import mongoose from "mongoose";
import { IBidService } from "../../interface/bid/IBidService";
import { IBidRepository } from "../../repositories/interface/IBidRepository";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { getPresignedDownloadUrl } from "../../config/s3Config";
import { IBid } from "../../models/BidModel";
import { BidForTransporterDTO } from "../../dtos/bids/bid.for.transporter.dto";
import { BidForShipperDTO } from "../../dtos/bids/bid.for.shipper.dto";

export class BidService implements IBidService {

    constructor(
        private _transporterRepository: ITransporterRepository,
        private _bidRepository: IBidRepository,
        private _truckRepository: ITruckRepository,

    ) { }

    async createBid(formData: { truckNo: string, rent: string, loadId: string, shipperId: string }, transporterId: string): Promise<{ success: boolean; message: string; }> {
        try {
            const transporter = await this._transporterRepository.findById(transporterId);
            const today = new Date()

            if (transporter?.subscription?.isActive && transporter.subscription.status === 'active' && transporter.subscription.endDate < today) {
                await this._transporterRepository.updateById(transporterId, { 'subscription.status': 'expired', 'subscription.isActive': false })
            }

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            const todayBidCount = await this._bidRepository.count({ transporterId: transporterId, createAt: { $gte: startOfToday, $lte: endOfToday } });
            if (todayBidCount >= 2 && !transporter?.subscription?.isActive) {
                return { success: false, message: 'You can only send up to 2 bids per day. To send unlimited bids, please subscribe to a premium plan.' }
            }

            const truck = await this._truckRepository.findTruckByRcno(formData.truckNo);

            if (!truck || truck.verificationStatus !== 'approved' || truck.status !== 'active') {
                return { success: false, message: 'Truck not Available' }
            }

            if (truck?.rcValidity <= today) {
                await this._truckRepository.updateById(truck?._id as string, { status: 'in-active' });
                return { success: false, message: `This truck's RC expired on ${new Date(truck.rcValidity).toLocaleDateString()}. Please update the validity.` }
            }

            if (
                !mongoose.Types.ObjectId.isValid(formData.shipperId) ||
                !mongoose.Types.ObjectId.isValid(formData.loadId) ||
                !mongoose.Types.ObjectId.isValid(transporterId)
            ) {
                return { success: false, message: 'Invalid ID format in input' };
            }

            const shipperObjectId = new mongoose.Types.ObjectId(formData.shipperId);
            const loadObjectId = new mongoose.Types.ObjectId(formData.loadId);
            const transporterObjectId = new mongoose.Types.ObjectId(transporterId)
            const truckObjectId = truck._id as mongoose.Types.ObjectId;

            const bid = await this._bidRepository.createBid({
                shipperId: shipperObjectId,
                loadId: loadObjectId,
                transporterId: transporterObjectId,
                truckId: truckObjectId,
                price: formData.rent,

            })

            if (!bid) {
                return { success: false, message: 'bid not created' }
            }

            return { success: true, message: 'Bid send Successfully' }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchBidsForTransporter(transporterid: string, page: number, limit: number, status: string): Promise<{ bidDatas: BidForTransporterDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit

            const filter: any = {
                transporterId: transporterid
            }

            if (status !== 'all') {
                filter.status = status
            }

            const bids = await this._bidRepository.findWithPopulate(
                filter,
                [
                    { path: 'shipperId', select: 'shipperName profileImage' },
                    { path: 'truckId', select: 'truckNo truckType capacity' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate ' }
                ],
                skip,
                limit,
                { createAt: -1 }
            )

            const totalDocumentCount = await this._bidRepository.count({ transporterId: transporterid });
            const bidDtos: BidForTransporterDTO[] = await Promise.all(
                bids.map(async (bid: IBid) => {
                    let profileImageUrl: string | null = null;

                    if ((bid.shipperId as any).profileImage) {
                        profileImageUrl = await getPresignedDownloadUrl((bid.shipperId as any).profileImage) ?? '';
                    }

                    return {
                        _id: bid._id as string,
                        shipperId: {
                            _id: (bid.shipperId as any)._id.toString(),
                            shipperName: (bid.shipperId as any).shipperName,
                            profileImage: profileImageUrl ?? '',
                        },
                        transporterId: bid.transporterId.toString(),
                        loadId: {
                            _id: (bid.loadId as any)._id.toString(),
                            pickupLocation: (bid.loadId as any).pickupLocation,
                            dropLocation: (bid.loadId as any).dropLocation,
                            material: (bid.loadId as any).material,
                            quantity: (bid.loadId as any).quantity,
                            scheduledDate: (bid.loadId as any).scheduledDate,
                        },
                        truckId: {
                            _id: (bid.truckId as any)._id.toString(),
                            truckNo: (bid.truckId as any).truckNo,
                            truckType: (bid.truckId as any).truckType,
                            capacity: (bid.truckId as any).capacity,
                            truckImage: (bid.truckId as any).truckImage,
                        },
                        price: bid.price,
                        status: bid.status,
                        createAt: bid.createAt,
                        shipperPayment: bid.shipperPayment,
                        transporterPayment: bid.transporterPayment,
                    };
                })
            );

            return { bidDatas: bidDtos, totalPages: Math.ceil(totalDocumentCount / limit) }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateBid(bidId: string, truckId: string, price: string): Promise<{ success: boolean, message: string, updateBid?: BidForTransporterDTO }> {
        try {

            const truck = await this._truckRepository.findById(truckId);
            if (!truck || truck.status !== 'active') return { success: false, message: 'Truck not available' }

            const updateData = await this._bidRepository.updateById(bidId, { truckId: truck._id, price: price });
            if (!updateData) return { success: false, message: 'Bid not updated' };

            const bidDatos: BidForTransporterDTO = {
                _id: updateData._id as string,
                shipperId: {
                    _id: (updateData.shipperId as any)._id.toString(),
                    shipperName: (updateData.shipperId as any).shipperName,
                    profileImage: (updateData.shipperId as any).profileImage
                },
                transporterId: updateData.transporterId.toString(),
                loadId: {
                    _id: (updateData.loadId as any)._id.toString(),
                    pickupLocation: (updateData.loadId as any).pickupLocation,
                    dropLocation: (updateData.loadId as any).dropLocation,
                    material: (updateData.loadId as any).material,
                    quantity: (updateData.loadId as any).quantity,
                    scheduledDate: (updateData.loadId as any).scheduledDate
                },
                truckId: {
                    _id: (updateData.truckId as any)._id.toString(),
                    truckNo: (updateData.truckId as any).truckNo,
                    truckType: (updateData.truckId as any).truckType,
                    capacity: (updateData.truckId as any).capacity,
                    truckImage: (updateData.truckId as any).truckImage,
                },
                price: updateData.price,
                status: updateData.status,
                createAt: updateData.createAt,
                shipperPayment: updateData.shipperPayment,
                transporterPayment: updateData.transporterPayment
            }

            return { success: true, message: 'Bid Updated', updateBid: bidDatos }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async deleteBidById(bidId: string): Promise<{ success: boolean; message: string; BidData?: IBid; }> {
        try {

            const bid = await this._bidRepository.findBidById(bidId);
            if (!bid) return { success: false, message: 'Bid not found' };

            const deletedBid = await this._bidRepository.deleteById(bidId);
            if (!deletedBid) return { success: false, message: 'Bid not deleted' }

            return { success: true, message: 'Bid Deleted.', BidData: deletedBid };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchBidsForShipper(id: string, page: number, limit: number, status: string): Promise<{ bidData: BidForShipperDTO[] | null, totalPages: number }> {
        try {
            const skip = (page - 1) * limit
            const filter: any = {
                shipperId: id
            };

            if (status !== 'all') {
                filter.status = status
            }

            const bids = await this._bidRepository.findBidsForShipper(filter, skip, limit);
            const bidsCount = await this._bidRepository.count({ shipperId: id })

            const bidDatos: BidForShipperDTO[] = await Promise.all(
                (bids ?? []).map(async (bid: IBid) => {
                    let profileImageUrl = '';
                    let truckImageUrl = '';

                    try {
                        if ((bid.transporterId as any)?.profileImage) {
                            profileImageUrl = await getPresignedDownloadUrl((bid.transporterId as any).profileImage) ?? '';
                        }
                        if ((bid.truckId as any)?.truckImage) {
                            truckImageUrl = await getPresignedDownloadUrl((bid.truckId as any).truckImage) ?? '';
                        }
                    } catch (err) {
                        console.error('Error generating presigned URL:', err);
                    }

                    return {
                        _id: bid._id as string,
                        transporterId: {
                            _id: (bid.transporterId as any)._id.toString(),
                            transporterName: (bid.transporterId as any).transporterName,
                            profileImage: profileImageUrl
                        },
                        shipperId: bid.shipperId.toString(),
                        loadId: {
                            _id: (bid.loadId as any)._id.toString(),
                            pickupLocation: (bid.loadId as any).pickupLocation,
                            dropLocation: (bid.loadId as any).dropLocation,
                            material: (bid.loadId as any).material,
                            quantity: (bid.loadId as any).quantity,
                            scheduledDate: (bid.loadId as any).scheduledDate
                        },
                        truckId: {
                            _id: (bid.truckId as any)._id.toString(),
                            truckNo: (bid.truckId as any).truckNo,
                            truckType: (bid.truckId as any).truckType,
                            capacity: (bid.truckId as any).capacity,
                            truckImage: truckImageUrl
                        },
                        price: bid.price,
                        status: bid.status,
                        createAt: bid.createAt,
                        shipperPayment: bid.shipperPayment,
                        transporterPayment: bid.transporterPayment
                    };
                })
            );

            return { bidData: bidDatos, totalPages: Math.ceil(bidsCount / limit) }
        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

     async updateBidStatusByShipper(bidId: string, status: string): Promise<{ success: boolean, message: string }> {
        try {

            const updateBid = await this._bidRepository.updateBidStatus(bidId, status);
            if (!updateBid) {
                return { success: false, message: `Bid not ${status}` };
            }

            return { success: true, message: `Bid ${status}` };
        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}