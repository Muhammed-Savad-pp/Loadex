import mongoose from "mongoose";
import { getPresignedDownloadUrl } from "../../config/s3Config";
import { TripForAdminDTO, TripForShipperDTO, TripForTransporterDTO } from "../../dtos/trip/trip.for.transporter.dto";
import { ITripService } from "../../interface/trip/ITripService";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { ITransporterWalletRepository } from "../../repositories/interface/ITransporterWalletRepository";
import { ITripRepository } from "../../repositories/interface/ITripRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { ITransporterPaymentRepository } from "../../repositories/interface/ITransporterPayment";
import { IAdminPaymentRepository } from "../../repositories/interface/IAdminPaymentRepository";


export class TripService implements ITripService {

    constructor(
        private _tripRepository: ITripRepository,
        private _notificationRepository: INotificationRepository,
        private _truckRepository: ITruckRepository,
        private _loadRepository: ILoadRepository,
        private _transporterWalletRepository: ITransporterWalletRepository,
        private _transporterPaymentRepository: ITransporterPaymentRepository,
        private _adminPaymentRepository: IAdminPaymentRepository,

    ) { }

    async fetchTripsForTransporter(transporterId: string, status: string, page: number, limit: number): Promise<{ trips: TripForTransporterDTO[] | null, totalPages: number }> {
        try {
            const filter: any = { transporterId: transporterId }
            if (status && status !== '') {
                filter.tripStatus = status;
            }

            const skip = (page - 1) * limit
            const trips = await this._tripRepository.findWithPopulate(
                filter,
                [
                    { path: 'transporterId', select: 'transporterName' },
                    { path: 'shipperId', select: 'shipperName phone companyName profileImage' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate length height breadth descriptions distanceInKm dropCoordinates' },
                    { path: 'truckId', select: 'truckNo truckType capacity driverName driverMobileNo status' }
                ],
                skip,
                limit,
                { confirmedAt: -1 }
            )
            const tripDatos: TripForTransporterDTO[] = await Promise.all(
                trips.map(async (trip) => {
                    let profileImageUrl = '';
                    const imageKey = (trip.shipperId as any).profileImage;
                    if (imageKey) {
                        try {
                            profileImageUrl = await getPresignedDownloadUrl(imageKey) ?? '';
                        } catch (error) {
                            console.error(`Error generating pre-signed URL for profile image: ${imageKey}`, error);
                        }
                    }
                    return {
                        _id: trip._id as string,
                        shipperId: {
                            _id: (trip.shipperId as any)._id.toString(),
                            shipperName: (trip.shipperId as any).shipperName ?? "",
                            phone: (trip.shipperId as any).phone ?? "",
                            companyName: (trip.shipperId as any).companyName ?? "",
                            profileImage: profileImageUrl, // pre-signed URL here
                        },
                        transporterId: {
                            _id: (trip.transporterId as any)._id.toString(),
                            transporterName: (trip.transporterId as any).transporterName ?? "",
                        },
                        loadId: {
                            _id: (trip.loadId as any)._id.toString(),
                            breadth: (trip.loadId as any).breadth ?? "",
                            distanceInKm: (trip.loadId as any).distanceInKm ?? 0,
                            dropLocation: (trip.loadId as any).dropLocation ?? "",
                            height: (trip.loadId as any).height ?? "",
                            length: (trip.loadId as any).length ?? "",
                            material: (trip.loadId as any).material ?? "",
                            pickupLocation: (trip.loadId as any).pickupLocation ?? "",
                            quantity: (trip.loadId as any).quantity ?? "",
                            scheduledDate: (trip.loadId as any).scheduledDate,
                            dropCoordinates: {
                                latitude: (trip.loadId as any).dropCoordinates?.latitude ?? 0,
                                longitude: (trip.loadId as any).dropCoordinates?.longitude ?? 0,
                            },
                        },
                        truckId: {
                            capacity: (trip.truckId as any).capacity ?? "",
                            driverMobileNo: (trip.truckId as any).driverMobileNo ?? "",
                            driverName: (trip.truckId as any).driverName ?? "",
                            truckNo: (trip.truckId as any).truckNo ?? "",
                            truckType: (trip.truckId as any).truckType ?? "",
                        },
                        tripStatus: trip.tripStatus ?? "",
                        price: trip.price ?? "",
                        confirmedAt: trip.confirmedAt ?? null,
                        progressAt: trip.progressAt ?? null,
                        arrivedAt: trip.arrivedAt ?? null,
                        completedAt: trip.completedAt ?? null,
                    };
                })
            );

            const total = await this._tripRepository.count(filter)
            return { trips: tripDatos, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateTripStatus(
        tripId: string,
        newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'
    ): Promise<{ success: boolean; message: string }> {
        try {
            const currentDate = new Date();
            const trip = await this._tripRepository.findOne({ _id: tripId });
            if (!trip) return { success: false, message: "Trip not found." }

            switch (newStatus) {
                case 'confirmed':
                    break;
                case 'inProgress':
                    if (trip.tripStatus !== 'confirmed') {
                        return { success: false, message: `Trip already in ${trip.tripStatus} status` }
                    }
                    break;

                case 'arrived':
                    if (trip.tripStatus !== 'inProgress') {
                        return { success: false, message: `Trip already in ${trip.tripStatus} status` };
                    }
                    break;

                case 'completed':
                    if (trip.tripStatus !== 'arrived') {
                        return { success: false, message: `Trip already in ${trip.tripStatus} status` };
                    }
                    break;

                default:
                    return { success: false, message: 'Invalid Status.' }
            }

            const updateFields: any = { tripStatus: newStatus };
            if (newStatus === 'confirmed') updateFields.confirmedAt = currentDate;
            if (newStatus === 'inProgress') updateFields.progressAt = currentDate;
            if (newStatus === 'arrived') updateFields.arrivedAt = currentDate;
            if (newStatus === 'completed') updateFields.completedAt = currentDate;

            const updateData = await this._tripRepository.findByIdAndUpdate(tripId, updateFields);
            if (!updateData) return { success: false, message: 'Update failed' }

            const shipperId = String(updateData?.shipperId);
            await this._notificationRepository.createNotification({
                userId: shipperId,
                userType: 'shipper',
                title: 'Trip Status Updated',
                message: `${tripId} Trip Status has been updated to ${newStatus}`
            });

            if (newStatus === 'completed') {
                await this._truckRepository.updateTruckById(String(updateData.truckId), { status: 'in-active' });
                await this._loadRepository.findLoadByIdAndUpdate(String(updateData.loadId), { status: 'completed' });
            }

            return { success: true, message: "Trip Status Updated." }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async fetchTripsForShipper(shipperId: string, page: number, limit: number, status: string): Promise<{ tripsData: TripForShipperDTO[] | null, totalPages: number }> {
        try {
            const skip = (page - 1) * limit;
            const filter: any = {
                shipperId: shipperId
            };
            if (status !== 'all') {
                filter.tripStatus = status
            }

            const trips = await this._tripRepository.findTrips(
                filter,
                [
                    { path: 'transporterId', select: "transporterName phone profileImage" },
                    { path: 'shipperId', select: "shipperName" },
                    { path: 'loadId', select: "pickupLocation dropLocation material quantity scheduledDate length height breadth descriptions distanceInKm " },
                    { path: 'truckId', select: "truckNo truckType capacity driverName driverMobileNo" }
                ],
                skip,
                limit,
            );

            const tripsCount = await this._tripRepository.count(filter);
            const tripsData: TripForShipperDTO[] = await Promise.all(
                (trips || []).map(async (trip: any) => {
                    let profileImageUrl = '';
                    if (trip.transporterId?.profileImage) {
                        try {
                            profileImageUrl = await getPresignedDownloadUrl(trip.transporterId.profileImage) ?? '';
                        } catch (err) {
                            console.error('Failed to generate presigned URL:', err);
                        }
                    }
                    return {
                        _id: trip._id as string,
                        transporterId: {
                            _id: trip.transporterId?._id?.toString() ?? '',
                            transporterName: trip.transporterId?.transporterName ?? '',
                            phone: trip.transporterId?.phone ?? '',
                            profileImage: profileImageUrl // Replace with presigned URL
                        },
                        shipperId: {
                            shipperName: trip.shipperId?.shipperName ?? ''
                        },
                        loadId: {
                            pickupLocation: trip.loadId?.pickupLocation ?? '',
                            dropLocation: trip.loadId?.dropLocation ?? '',
                            material: trip.loadId?.material ?? '',
                            quantity: trip.loadId?.quantity ?? '',
                            scheduledDate: trip.loadId?.scheduledDate ?? new Date(),
                            length: trip.loadId?.length ?? '',
                            height: trip.loadId?.height ?? '',
                            breadth: trip.loadId?.breadth ?? '',
                            descriptions: trip.loadId?.descriptions ?? '',
                            distanceInKm: trip.loadId?.distanceInKm ?? 0
                        },
                        truckId: {
                            truckNo: trip.truckId?.truckNo ?? '',
                            truckType: trip.truckId?.truckType ?? '',
                            capacity: trip.truckId?.capacity ?? '',
                            driverName: trip.truckId?.driverName ?? '',
                            driverMobileNo: trip.truckId?.driverMobileNo ?? ''
                        },
                        price: trip.price ?? '',
                        tripStatus: trip.tripStatus ?? '',
                        confirmedAt: trip.confirmedAt ?? ''
                    };
                })
            );
            return { tripsData: tripsData, totalPages: Math.ceil(tripsCount / limit) }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTripsForAdmin(page: number, limit: number, search: string, status: string): Promise<{ tripsData: TripForAdminDTO[]; totalPages: number; }> {
        try {
            const skip = (page - 1) * limit;
            const matchStage: any = {};

            if (status !== 'all') {
                matchStage.tripStatus = status;
            }

            // Initial aggregation pipeline
            const pipeline: any[] = [
                // Lookup transporter
                {
                    $lookup: {
                        from: 'transporters',
                        localField: 'transporterId',
                        foreignField: '_id',
                        as: 'transporter'
                    }
                },
                { $unwind: '$transporter' },

                // Lookup shipper
                {
                    $lookup: {
                        from: 'shippers',
                        localField: 'shipperId',
                        foreignField: '_id',
                        as: 'shipper'
                    }
                },
                { $unwind: '$shipper' },

                // Lookup load
                {
                    $lookup: {
                        from: 'loads',
                        localField: 'loadId',
                        foreignField: '_id',
                        as: 'load'
                    }
                },
                { $unwind: '$load' },

                // Lookup truck
                {
                    $lookup: {
                        from: 'trucks',
                        localField: 'truckId',
                        foreignField: '_id',
                        as: 'truck'
                    }
                },
                { $unwind: '$truck' },

                // Match status (if any)
                { $match: matchStage },
            ];

            if (search && search.trim() !== '') {
                const searchRegex = new RegExp(search, 'i');
                pipeline.push({
                    $match: {
                        $or: [
                            { 'truck.truckNo': searchRegex },
                            { 'load.material': searchRegex }
                        ]
                    }
                });
            }

            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await this._tripRepository.aggregate(countPipeline);
            const totalCounts = countResult[0]?.total || 0;

            pipeline.push(
                { $sort: { confirmedAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            );

            pipeline.push({
                $project: {
                    transporterId: '$transporter',
                    shipperId: '$shipper',
                    loadId: '$load',
                    truckId: '$truck',
                    price: 1,
                    tripStatus: 1,
                    confirmedAt: 1,
                    progressAt: 1,
                    arrivedAt: 1,
                    completedAt: 1,
                    adminPayment: 1
                }
            });

            const trips = await this._tripRepository.aggregate(pipeline);

            const tripsWithSignedUrls = await Promise.all(
                trips.map(async (trip: TripForAdminDTO) => {
                    const transporterImage = trip.transporterId.profileImage
                        ? await getPresignedDownloadUrl(trip.transporterId.profileImage)
                        : '';

                    const shipperImage = trip.shipperId.profileImage
                        ? await getPresignedDownloadUrl(trip.shipperId.profileImage)
                        : '';

                    return {
                        ...trip,
                        transporterId: {
                            ...trip.transporterId,
                            profileImage: transporterImage || ''
                        },
                        shipperId: {
                            ...trip.shipperId,
                            profileImage: shipperImage || ''
                        }
                    };
                })
            );

            return {
                tripsData: tripsWithSignedUrls,
                totalPages: Math.ceil(totalCounts / limit)
            };
        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async sendTripAmountToTransporter(tripId: string): Promise<{ success: boolean; message: string; }> {
        try {

            const updateTrip = await this._tripRepository.updateById(tripId, { adminPayment: true });
            const transporterId = String(updateTrip?.transporterId)
            await this._transporterWalletRepository.addMoneyInWallet(transporterId, updateTrip?.price as string);
            const tripObjectId = new mongoose.Types.ObjectId(tripId);
            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const numbericAmount = Number(updateTrip?.price)

            await this._transporterPaymentRepository.createPayment({
                tripId: tripObjectId,
                transporterId: transporterObjectId,
                paymentType: 'trip',
                amount: numbericAmount,
                paymentStatus: 'success',
                transactionType: 'credit'
            })

            await this._adminPaymentRepository.createAdminPaymentHistory({
                userType: 'transporter',
                userId: transporterId,
                amount: numbericAmount,
                tripId: tripObjectId,
                transactionType: 'debit',
                paymentFor: 'trip',
                paymentStatus: 'success'
            })

            await this._notificationRepository.createNotification({
                userType: 'transporter',
                userId: transporterId,
                title: 'Trip Rent Credited',
                message: `Admin pay your trip amount ${numbericAmount}`
            })

            return { success: true, message: "Payment success" }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}