import { ITransporter } from "../../models/TransporterModel";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import { configDotenv } from 'dotenv';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, generateSignedUrl } from "../../config/s3Config";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITransporterService } from "../../interface/transporter/ITransporterService";
import { ILoad } from "../../models/LoadModel";
import { ITruck } from "../../models/TruckModel";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IBid } from "../../models/BidModel";
import mongoose, { mongo } from "mongoose";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { IBidRepository } from "../../repositories/interface/IBidRepository";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import Stripe from "stripe";
import { ITransporterPaymentRepository } from "../../repositories/interface/ITransporterPayment";
import { ITripRepository } from "../../repositories/interface/ITripRepository";
import { ITrip } from "../../models/TripModel";
import { IShipper } from "../../models/ShipperModel";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { IReviewRatingRepository } from "../../repositories/interface/IReviewRatingRepository";
import { error } from "console";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import { TRANSPORTER_SUBSCRIPTION_PLANS } from "../../config/transporterPlans";
import { ITransporterPayment } from "../../models/TransporterPayment";
import { startOfDay, subDays } from "date-fns";
import { IChat } from "../../models/Chat";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import path from "path";
import { IMessage } from "../../models/Message";
import { IMessageRepository } from "../../repositories/interface/IMessageRepository";
import { INotification } from "../../models/NotificationModel";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { ITransporterWallet } from "../../models/TransporterWallet";
import { ITransporterWalletRepository } from "../../repositories/interface/ITransporterWalletRepository";
import { IAdminPaymentRepository } from "../../repositories/interface/IAdminPaymentRepository";
import { BidForTransporterDTO } from "../../dtos/bids/bid.for.transporter.dto";
import { TransporterDTO } from "../../dtos/transporter/transporter.dto";
import { TruckDTO } from "../../dtos/truck/truck.for.transporter.dto";
import { TripForTransporterDTO } from "../../dtos/trip/trip.for.transporter.dto";


configDotenv()


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
})


function calculateCommission(distance: number): number {

    const ratePerKm = 3;
    return distance * ratePerKm;
}

export class TransporterService implements ITransporterService {

    constructor(
        private _transporterRepository: ITransporterRepository,
        private _truckRepository: ITruckRepository,
        private _bidRepository: IBidRepository,
        private _loadRepository: ILoadRepository,
        private _transporterPaymentRepository: ITransporterPaymentRepository,
        private _tripRepository: ITripRepository,
        private _shipperRepository: IShipperRepository,
        private _reviewRepository: IReviewRatingRepository,
        private _chatRepository: IChatRepository,
        private _messageRepository: IMessageRepository,
        private _notificationRepository: INotificationRepository,
        private _transporterWalletRepository: ITransporterWalletRepository,
        private _adminPaymentRepository: IAdminPaymentRepository
    ) { };

    async verificationStatus(id: string): Promise<{ success: boolean, message: string, verificationStatus?: string }> {

        console.log('herer');

        const transporter = await this._transporterRepository.findById(id)
        console.log(transporter?.verificationStatus, 'verification status');

        if (!transporter) {
            return { success: false, message: 'Transporter not signUp' }
        }


        return { success: true, message: 'Transporter verification Status', verificationStatus: transporter.verificationStatus }

    }

    async getProfileData(id: string): Promise<{ success: boolean, message: string, transporterData?: Partial<TransporterDTO> }> {


        const transporterData = await this._transporterRepository.findById(id);

        const signedUrl = await generateSignedUrl(transporterData?.aadhaarBack);

        if (!transporterData) {
            return { success: false, message: 'No Transporter' }
        }

        return { success: true, message: 'success', transporterData: transporterData }
    }

    async kycVerification(transporterId: string, panNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File): Promise<{ success: boolean, message: string, transporterData?: Partial<ITransporter> }> {

        try {

            let aadhaarFrontUrl: string | undefined;
            let aadhaarBackUrl: string | undefined

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (aadhaarFront) {
                aadhaarFrontUrl = await uploadToS3(aadhaarFront, "aadhaar-front");
            }


            if (aadhaarBack) {
                aadhaarBackUrl = await uploadToS3(aadhaarBack, 'aadhaar-back');
            }


            const updateTransporter = await this._transporterRepository.updateTransporterById(
                transporterId,
                {
                    panNumber,
                    aadhaarFront: aadhaarFrontUrl,
                    aadhaarBack: aadhaarBackUrl,
                    verificationStatus: 'requested'
                }
            );

            if (!updateTransporter) {
                return { success: false, message: "Transporter not found" }
            }

            return {
                success: true, message: "KYC submitted successFully",
                transporterData: {
                    panNumber: updateTransporter.panNumber,
                    aadhaarFront: updateTransporter.aadhaarFront,
                    aadhaarBack: updateTransporter.aadhaarBack,
                    verificationStatus: updateTransporter.verificationStatus
                }
            }

        } catch (error) {
            console.error(error);
            return { success: false, message: 'KYC verification failed due to an error' }
        }
    }


    async registerTruck(transporterId: string,
        truckData: {
            vehicleNumber: string,
            ownerName: string,
            ownerMobileNo: string,
            type: string,
            capacity: string,
            tyres: string,
            driverName: string,
            driverMobileNumber: string,
            currentLocation: string,
            from: string,
            to: string,
            selectedLocations: string[],
            currentLocationCoords: { lat: number, lng: number },
            fromCoords: { lat: number, lng: number },
            toCoords: { lat: number, lng: number },
            rcValidity: string,
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File, truckImage: Express.Multer.File): Promise<{ success: boolean, message: string }> {

        try {

            const { vehicleNumber, ownerName, ownerMobileNo, type, capacity, tyres, driverName,
                driverMobileNumber, currentLocation, from, to, selectedLocations, currentLocationCoords, fromCoords, toCoords, rcValidity } = truckData;

            const transporter = await this._transporterRepository.findById(transporterId);
            const trucksCount = await this._truckRepository.count({ transporterId: transporterId });

            if (!transporter?.subscription?.isActive && trucksCount >= 1) {
                return { success: false, message: 'You can register only one truck with a free account. Please subscribe to add more trucks.' }
            }

            const rcValidityDate = new Date(rcValidity)

            const ExistTruck = await this._truckRepository.findTruckByRcno(vehicleNumber)

            if (ExistTruck) {
                console.log('Truck already exits');
                return { success: false, message: 'Truck already Exits' }
            }

            let rcBookUrl: string | undefined;
            let driverLicenseUrl: string | undefined;
            let truckImageUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (rcBook) {
                rcBookUrl = await uploadToS3(rcBook, 'rcBook')
            }

            if (driverLicense) {
                driverLicenseUrl = await uploadToS3(driverLicense, 'driverLicense')
            }

            if (truckImage) {
                truckImageUrl = await uploadToS3(truckImage, 'truckImage')
            }

            // Parse selectedLocations if it's a stringified array
            let selectedLocationsParsed: string[] = [];

            if (typeof truckData.selectedLocations === 'string') {
                try {
                    selectedLocationsParsed = JSON.parse(truckData.selectedLocations);
                    if (!Array.isArray(selectedLocationsParsed)) {
                        throw new Error();
                    }
                } catch (err) {
                    return { success: false, message: 'Invalid selected locations format' };
                }
            } else {
                selectedLocationsParsed = truckData.selectedLocations;
            }


            const createTruck = await this._truckRepository.createTruck({
                transporterId: transporterId,
                truckOwnerName: ownerName,
                truckOwnerMobileNo: ownerMobileNo,
                truckNo: vehicleNumber,
                truckType: type,
                capacity: capacity,
                tyres: tyres,
                driverName: driverName,
                driverMobileNo: driverMobileNumber,
                currentLocation: currentLocation,
                pickupLocation: from,
                dropLocation: to,
                operatingStates: selectedLocationsParsed,
                rcBook: rcBookUrl,
                driverLicense: driverLicenseUrl,
                currentLocationCoords: currentLocationCoords,
                pickupLocationCoords: fromCoords,
                dropLocationCoords: toCoords,
                rcValidity: rcValidityDate,
                truckImage: truckImageUrl,

            })

            if (!createTruck) {
                return { success: false, message: 'Failed to register the truck. Please try again later.' }
            }

            return { success: true, message: 'Truck registered! Waiting for admin approval.' }

        } catch (error) {
            console.log(error)
            return { success: false, message: 'An error occurred while registering the truck. Please try again.' }
        }
    }

    async getLoads(page: number, limit: number): Promise<{ loads: ILoad[] | null, currentPage: number, totalPages: number, totalItems: number }> {
        try {

            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

            const skip = (page - 1) * limit;

            const loads = await this._loadRepository.getLoads(
                { status: 'active', createdAt: { $gte: threeDaysAgo } },
                [
                    { path: 'shipperId', select: 'companyName shipperName _id' },
                ],
                skip,
                limit
            )

            const total = await this._loadRepository.count({ status: 'active' });

            return { loads: loads, currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total };

        } catch (error: any) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findTrucks(id: string, status: string, page: number, limit: number): Promise<{ trucks: TruckDTO[] | null; totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const projection = {
                truckOwnerName: 1,
                truckOwnerMobileNo: 1,
                truckNo: 1,
                truckType: 1,
                capacity: 1,
                tyres: 1,
                driverName: 1,
                driverMobileNo: 1,
                currentLocation: 1,
                pickupLocation: 1,
                dropLocation: 1,
                verificationStatus: 1,
                operatingStates: 1,
                available: 1,
                driverLicense: 1,
                status: 1,
                truckImage: 1,
                rcValidity: 1
            }

            const trucks = await this._truckRepository.find({ transporterId: id, status: status }, projection, skip, limit, { createdAt: -1 });
            const total = await this._truckRepository.count({ transporterId: id, status: status });

            const truckDatos: TruckDTO[] = trucks.map((truck: ITruck) => ({
                _id: truck._id as string,
                available: truck.available ?? false,
                currentLocation: truck.currentLocation ?? "",
                driverMobileNo: truck.driverMobileNo ?? "",
                driverName: truck.driverName ?? "",
                dropLocation: truck.dropLocation ?? "",
                operatingStates: truck.operatingStates ?? [],
                pickupLocation: truck.pickupLocation ?? "",
                truckNo: truck.truckNo ?? "",
                truckOwnerMobileNo: truck.truckOwnerMobileNo ?? "",
                truckOwnerName: truck.truckOwnerName ?? "",
                truckType: truck.truckType ?? "",
                tyres: truck.tyres ?? '0',
                verificationStatus: truck.verificationStatus ?? "",
                capacity: truck.capacity ?? "",
                driverLicense: truck.driverLicense ?? "",
                status: truck.status ?? "inactive",
                truckImage: truck.truckImage ?? '',
                rcValidity: truck.rcValidity
            }));

            return { trucks: truckDatos, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateTruckAvailable(formData: Partial<ITruck>, driverLicensefile?: Express.Multer.File): Promise<{ success: boolean, truckData?: ITruck, message: string }> {
        try {

            const { id, driverName, driverMobileNo, currentLocation, driverLicense, currentLocationCoords } = formData;

            let driverLicenseNewUrl: string | undefined;


            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (driverLicensefile) {
                driverLicenseNewUrl = await uploadToS3(driverLicensefile, 'driverLicense')
            } else {
                driverLicenseNewUrl = driverLicense
            }

            const truck = await this._truckRepository.findTruckById(id);

            if (!truck) {
                const error: any = new Error('Truck not found')
                error.status = HTTP_STATUS.NOT_FOUND;
                throw error
            }

            const today = new Date();

            if (truck.rcValidity <= today) {
                return { success: false, message: `This truck's RC expired on ${new Date(truck.rcValidity).toLocaleDateString()}. Please update the validity.` }
            }

            const updateTruck = await this._truckRepository.updateTruckById(id, {
                driverName,
                driverMobileNo,
                currentLocation,
                currentLocationCoords,
                driverLicense: driverLicenseNewUrl,
                available: true,
                status: 'active'
            });

            if (!updateTruck) {
                return { success: false, message: "Truck not activated" }
            }

            return { success: true, message: 'Truck Active SuccessFully', truckData: updateTruck }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async sendBid(formData: { truckNo: string, rent: string, loadId: string, shipperId: string }, transporterId: string): Promise<{ success: boolean; message: string; }> {
        try {

            const transporter = await this._transporterRepository.findById(transporterId);
            const today = new Date()

            if (transporter?.subscription?.isActive && transporter.subscription.status === 'active' && transporter.subscription.endDate < today) {
                console.log('Transporter Subscrition updated');
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

            const trucksCount = await this._truckRepository.count({ transporterId: truck?.transporterId, status: 'active' })
            const currentBidCont = await this._bidRepository.count({ transporterId: truck?.transporterId });

            // if(currentBidCont >= trucksCount) {
            //     return {success: false, message: 'You not send bid. not available truck'}
            // }



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

    async fetchAllBids(transporterid: string, page: number, limit: number, status: string): Promise<{ bidDatas: BidForTransporterDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit

            const filter: any = {
                transporterId: transporterid
            }

            if (status !== 'all') {
                filter.status = status
            }

            // const bids = await this._bidRepository.findBidsForTransporter(transporterid);
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

            const bidDtos: BidForTransporterDTO[] = bids.map((bid: IBid) => ({
                _id: bid._id as string,
                shipperId: {
                    _id: (bid.shipperId as any)._id.toString(),
                    shipperName: (bid.shipperId as any).shipperName,
                    profileImage: (bid.shipperId as any).profileImage
                },
                transporterId: bid.transporterId.toString(),
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
                    truckImage: (bid.truckId as any).truckImage,
                },
                price: bid.price,
                status: bid.status,
                createAt: bid.createAt,
                shipperPayment: bid.shipperPayment,
                transporterPayment: bid.transporterPayment
            }));

            return { bidDatas: bidDtos, totalPages: Math.ceil(totalDocumentCount / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async bidCheckoutSession(bidID: string): Promise<{ success: boolean; message: string; sessionId?: string; }> {
        try {

            const bidObjectId = new mongoose.Types.ObjectId(bidID);

            const bid = await this._bidRepository.findBidById(bidID);
            if (!bid) return { success: false, message: 'Bid not Found' }

            const loadId = String(bid.loadId);

            const load = await this._loadRepository.findLoadById(loadId);

            const distanceInKm = load?.distanceInKm;
            const commission = calculateCommission(distanceInKm || 0);


            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Transport Platform Commission',
                                description: `Commision for bid ${bidID}`,

                            },
                            unit_amount: Math.round(commission * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/transporter/success?transactionId={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/transporter/failed?transactionId={CHECKOUT_SESSION_ID}`,
            })

            await this._transporterPaymentRepository.createPayment({
                transactionId: session.id,
                transporterId: bid.transporterId,
                bidId: bidObjectId,
                paymentType: 'bid',
                amount: commission,
                transactionType: 'debit',
            })

            const transporeterId = String(bid.transporterId)
            await this._adminPaymentRepository.createAdminPaymentHistory({
                transactionId: session.id,
                userType: 'transporter',
                userId: transporeterId,
                amount: commission,
                transactionType: 'credit',
                paymentFor: 'bid',
                bidId: bidObjectId,
            })


            return { success: true, message: 'success', sessionId: session.id }


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async verifyBidPayment(transactionId: string, status: string): Promise<{ success: boolean; message: string; }> {
        try {

            if (status === 'success') {

                const payment = await this._transporterPaymentRepository.findTransporterPaymentByTransactionIdAndUpdate(transactionId, status);
                await this._adminPaymentRepository.updateBytransactionId(transactionId, status);

                const bidId = String(payment?.bidId)

                const bid = await this._bidRepository.findBidAndUpdate(bidId, { transporterPayment: true });

                if (bid?.shipperPayment && bid.transporterPayment) {

                    const trip = await this._tripRepository.createTrip(
                        {
                            transporterId: bid.transporterId,
                            shipperId: bid.shipperId,
                            loadId: bid.loadId,
                            truckId: bid.truckId,
                            price: bid.price,
                        }
                    )

                    if (trip) {

                        await this._bidRepository.updateBids({ loadId: bid.loadId, _id: { $ne: bid._id } }, { status: 'rejected' })

                        const updateLoad = await this._loadRepository.findLoadByIdAndUpdate(String(bid.loadId), { status: 'in-Transit' })

                        const updateTruck = await this._truckRepository.updateTruckById(String(bid.truckId), { status: 'in-transit' });

                        const shipperid = String(trip.shipperId)

                        await this._notificationRepository.createNotification({
                            userId: shipperid,
                            userType: 'shipper',
                            title: 'Trip Started',
                            message: 'The transporter has completed the payment. Your shipment is now on its way.'
                        })

                    }

                    return { success: true, message: 'Trip Confirmed.' }

                }
            }

            const failedPayment = await this._transporterPaymentRepository.findTransporterPaymentByTransactionIdAndUpdate(transactionId, status);

            return { success: true, message: 'Payment verification failed. Invalid status.' }


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrips(transporterId: string, status: string, page: number, limit: number): Promise<{ trips: TripForTransporterDTO[] | null, totalPages: number }> {
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

            const tripDatos: TripForTransporterDTO[] = trips.map((trip) => ({
                _id: trip._id as string,
                shipperId: {
                    _id: (trip.shipperId as any)._id.toString(),
                    shipperName: (trip.shipperId as any).shipperName ?? "",
                    phone: (trip.shipperId as any).phone ?? "",
                    companyName: (trip.shipperId as any).companyName ?? "",
                    profileImage: (trip.shipperId as any).profileImage ?? "",
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
                    }
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
            }));


            const total = await this._tripRepository.count(filter)

            return { trips: tripDatos, totalPages: Math.ceil(total / limit) };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateTripStatus(tripId: string, newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'): Promise<{ success: boolean; message: string; }> {
        try {

            let currentDate = new Date()

            let updateData
            switch (newStatus) {
                case 'confirmed':
                    updateData = await this._tripRepository.findByIdAndUpdate(tripId, { tripStatus: newStatus, confirmedAt: currentDate })
                    break;
                case 'inProgress':
                    updateData = await this._tripRepository.findByIdAndUpdate(tripId, { tripStatus: newStatus, progressAt: currentDate })
                    break;
                case 'arrived':
                    updateData = await this._tripRepository.findByIdAndUpdate(tripId, { tripStatus: newStatus, arrivedAt: currentDate })
                    break;
                case 'completed':
                    updateData = await this._tripRepository.findByIdAndUpdate(tripId, { tripStatus: newStatus, completedAt: currentDate })
                    break;
                default:
                    break;
            }

            const shipperId = String(updateData?.shipperId);

            await this._notificationRepository.createNotification({
                userId: shipperId,
                userType: 'shipper',
                title: 'Trip Status Updated',
                message: `${tripId} Trip Status has updated ${updateData?.tripStatus}`
            })

            if (!updateData) return { success: false, message: 'Somthing wrong.' };

            if (newStatus == 'completed') {
                await this._truckRepository.updateTruckById(String(updateData.truckId), { status: 'in-active' })
                await this._loadRepository.findLoadByIdAndUpdate(String(updateData.loadId), { status: 'completed' })
            }

            return { success: true, message: "Trip Status Updated." }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateProfile(transporterId: string, transporterName: string, phone: string, profileImage: Express.Multer.File): Promise<{ success: boolean; message: string; transporterData?: Partial<ITransporter>; }> {
        try {

            let profileImageUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (profileImage) {
                profileImageUrl = await uploadToS3(profileImage, 'profileImage')
            }


            const updateTransporter = await this._transporterRepository.updateTransporterById(transporterId,
                {
                    transporterName: transporterName,
                    phone: phone,
                    profileImage: profileImageUrl
                }
            )

            if (!updateTransporter) {
                return { success: false, message: 'Profile Not Updated' }
            }

            return { success: true, message: 'Updated SuccessFully', transporterData: updateTransporter };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{ shipperData: IShipper, isFollow: boolean, loadsCount: number, tripsCount: number, reviews: Partial<IRatingReview>[]; averageRating: number, isReview: boolean }> {
        try {

            const shipper = await this._shipperRepository.findShipperById(shipperId);

            if (!shipper) {
                throw new Error('Shipper not found')
            }

            let isFollow;
            if (shipper.followers?.includes(transporterId)) {
                isFollow = true;
            } else {
                isFollow = false
            }

            const loadscount = await this._loadRepository.count({ shipperId: shipperId });
            const tripsCompletedcount = await this._tripRepository.count({ shipperId: shipper, tripStatus: "completed" });
            const reviews = await this._reviewRepository.findWithPopulates(
                { "to.id": shipperId, "to.role": 'Shipper' },
                [
                    { path: 'from.id', select: 'transporterName profileImage' }
                ]
            )

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const isReview = reviews.some(val => val.from.id.equals(transporterObjectId));

            const averageRatingPipeline = [
                { $match: { 'to.id': new mongoose.Types.ObjectId(shipperId) } },
                {
                    $group: {
                        _id: "$to.id",
                        avgRating: { $avg: "$rating" },
                    }
                }
            ]

            const averageRatingResult = await this._reviewRepository.aggregate(averageRatingPipeline);
            const averageRating = averageRatingResult[0]?.avgRating ?? 0;

            return { shipperData: shipper, isFollow: isFollow, tripsCount: tripsCompletedcount, loadsCount: loadscount, reviews: reviews, averageRating: averageRating, isReview: isReview };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async followShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: IShipper; isFollow: boolean }> {
        try {

            const updateTransporter = await this._transporterRepository.follow(transporterId, 'followings', shipperId);

            if (!updateTransporter) {
                throw new Error('Transporter not found or update failed')
            }

            await this._notificationRepository.createNotification({
                userId: shipperId,
                userType: 'shipper',
                title: 'New follower',
                message: `${updateTransporter.transporterName} has followed you`
            })

            const updateShipper = await this._shipperRepository.follow(shipperId, 'followers', transporterId);

            if (!updateShipper) throw new Error('Shipper not found or Update failed')

            let isFollow;

            if (updateShipper.followers?.includes(transporterId)) {
                isFollow = true
            } else {
                isFollow = false
            }

            return { success: true, shipperData: updateShipper, isFollow: isFollow };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async unFollowShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: IShipper; isFollow: boolean; }> {
        try {

            const updateTransporter = await this._transporterRepository.unFollow(transporterId, 'followings', shipperId)

            if (!updateTransporter) throw new Error('Transporter not found')

            const updateShipper = await this._shipperRepository.unFollow(shipperId, 'followers', transporterId);

            if (!updateShipper) throw new Error('Shipper not found');

            let isFollow;
            if (updateShipper.followers?.includes(transporterId)) {
                isFollow = true
            } else {
                isFollow = false
            }

            return { success: true, shipperData: updateShipper, isFollow: isFollow };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{ success: boolean; reviewData?: IRatingReview; }> {
        try {

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            const review = await this._reviewRepository.createReview({
                from: { id: transporterObjectId, role: 'Transporter' },
                to: { id: shipperObjectId, role: 'Shipper' },
                rating,
                review: comment
            });

            if (!review) {
                return { success: false }
            }

            return { success: true, reviewData: review };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShippers(page: number, limit: number): Promise<{ shipper: IShipper[] | null, totalPages: number, totalItems: number }> {
        try {

            const skip = (page - 1) * limit;

            const projection = {
                _id: 1,
                profileImage: 1,
                shipperName: 1,
                companyName: 1,
                email: 1
            }

            const shippers = await this._shipperRepository.find({}, projection, skip, limit)
            const total = await this._shipperRepository.count({})

            return { shipper: shippers, totalPages: Math.ceil(total / limit), totalItems: total }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporterFollowersandFollowings(transporterId: string, status: string, search: string, page: number, limit: number): Promise<{ datas: any[], followersCount: number, followingsCount: number, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;


            const transporter = await this._transporterRepository.findById(transporterId);

            if (!transporterRepository) {
                throw new Error('Transporter not found')
            }

            const projection = {
                _id: 1,
                shipperName: 1,
                profileImage: 1,
                followers: 1,
                followings: 1
            }

            type ShipperWithfollowesBack = {
                _doc?: any;
                followsBack: boolean;
            }

            const followersLength = transporter?.followers?.length ?? 0
            const followingsLength = transporter?.followings?.length ?? 0;

            let cleanedResult;
            let total = 0;;

            if (status === 'followers') {

                // * ---- findFollowers ----*
                const followersIds = transporter?.followers;
                // const followersSet = new Set(followersIds);
                total = transporter?.followers?.length as number

                const filter: any = {
                    _id: { $in: followersIds }
                }

                if (search) {
                    filter.shipperName = { $regex: search, $options: 'i' }
                }

                const shippers = await this._shipperRepository.find(filter, projection, skip, limit);

                const result = shippers.map(shipper => ({
                    ...shipper,
                    followsBack: shipper.followers?.includes(transporterId)
                }))

                cleanedResult = result.map(val => {
                    const { _doc, followsBack } = val as ShipperWithfollowesBack;
                    return {
                        ..._doc,
                        followsBack,
                    }
                })

            } else {

                // * ---- findFollowings ----- *

                const followingsIds = transporter?.followings;
                // const followingsSet = new Set(followersIds);
                total = transporter?.followings?.length as number;

                const filter: any = {
                    _id: { $in: followingsIds }
                }

                if (search) {
                    filter.shipperName = { $regex: search, $options: 'i' }
                }

                const followingShipper = await this._shipperRepository.find(filter, projection, skip, limit);

                const followingResult = followingShipper.map(shipper => ({
                    ...shipper,
                    followsBack: shipper.followers?.includes(transporterId)
                }))

                cleanedResult = followingResult.map(val => {
                    const { _doc, followsBack } = val as ShipperWithfollowesBack;
                    return {
                        ..._doc,
                        followsBack,
                    }
                })
            }
            return { datas: cleanedResult, followersCount: followersLength, followingsCount: followingsLength, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            console.log(error);

            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchSubscriptionPlans(): Promise<{ subscriptionPlans: {}; }> {
        try {

            return { subscriptionPlans: TRANSPORTER_SUBSCRIPTION_PLANS };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async subscriptionCheckoutSession(transporterId: string, planId: string): Promise<{ success: boolean; sessionId?: string; message: string }> {
        try {

            const plan = TRANSPORTER_SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) return { success: false, message: 'Invalid Plan' }

            const transporter = await this._transporterRepository.findById(transporterId);
            if (!transporter) return { success: false, message: 'Transporter not found' }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: plan.name,
                                description: plan.duration
                            },
                            unit_amount: Math.round(plan.price * 100)
                        },
                        quantity: 1
                    }
                ],
                success_url: `http://localhost:5173/transporter/subscription-success?session_id={CHECKOUT_SESSION_ID}&planId=${plan.id}`,
                cancel_url: `http://localhost:5173/transporter/subscription-failed`,
            })

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId)

            await this._transporterPaymentRepository.createPayment({
                transactionId: session.id,
                planId,
                transporterId: transporterObjectId,
                paymentType: 'subscription',
                amount: plan.price,
                transactionType: 'debit',
            })

            await this._adminPaymentRepository.createAdminPaymentHistory({
                transactionId: session.id,
                userType: 'transporter',
                userId: transporterId,
                amount: plan.price,
                transactionType: 'credit',
                paymentFor: 'subscription',
                subscriptionId: planId,

            })

            return { success: true, message: 'Checkout Created', sessionId: session.id }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async subscriptionSuccess(transporterId: string, sessionId: string, planId: string): Promise<{ success: boolean; message: string; planName?: string; endDate?: Date; }> {
        try {

            const plan = TRANSPORTER_SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) return { success: false, message: 'Invalid plan' }

            const startDate = new Date();
            const endDate = new Date(startDate);

            endDate.setDate(endDate.getDate() + plan.planDurationInDays);

            const updateTransporter = await this._transporterRepository.updateById(transporterId, {
                subscription: {
                    planId: plan.id,
                    planName: plan.name,
                    status: 'active',
                    startDate,
                    endDate,
                    isActive: true,
                    paidAmount: plan.price
                }
            })

            await this._transporterPaymentRepository.findTransporterPaymentByTransactionIdAndUpdate(sessionId, 'success');
            await this._adminPaymentRepository.updateBytransactionId(sessionId, 'success')
            await this._notificationRepository.createNotification({
                userId: transporterId,
                userType: 'transporter',
                title: 'New Plan',
                message: `${plan.name} as Activated`
            })

            return { success: true, message: 'Subscription Activated', planName: plan.name, endDate }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async checkExpiredSubscription(): Promise<void> {
        try {

            const today = new Date();
            const result = await this._transporterRepository.subscriptionExpiredUpdate(today);

            console.log(`Subscription Expired ${result.modifiedCount}`);


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchActiveTrucks(transporterId: string): Promise<ITruck[] | null> {
        try {

            const trucks = await this._truckRepository.find({ transporterId: transporterId, status: 'active', verificationStatus: 'approved' }, { truckNo: 1 })
            return trucks;

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateBid(bidId: string, truckId: string, price: string): Promise<{ success: boolean, message: string, updateBid?: IBid }> {
        try {

            const truck = await this._truckRepository.findById(truckId);
            if (!truck || truck.status !== 'active') return { success: false, message: 'Truck not available' }

            const updateData = await this._bidRepository.updateById(bidId, { truckId: truck._id, price: price });

            if (!updateData) return { success: false, message: 'Bid not updated' }

            return { success: true, message: 'Bid Updated', updateBid: updateData }

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

    async fetchPaymentHistory(transporterId: string, status: string, type: string, date: string, page: number, limit: number):
        Promise<{ paymentData: ITransporterPayment[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number }> {
        try {

            const paymentData = await this._transporterPaymentRepository.find({ transporterId: transporterId })
            const totalEarnings = paymentData
                .filter(p => p.paymentStatus === 'success')
                .reduce((sum, p) => sum + p.amount, 0)

            const pendingAmount = paymentData
                .filter(p => p.paymentStatus === 'pending')
                .reduce((sum, p) => sum + p.amount, 0)

            const bidPayments = paymentData.filter(p => p.paymentType === 'bid').length;
            const subscriptionPayment = paymentData.filter(p => p.paymentType === 'subscription').length;


            const skip = (page - 1) * limit;

            const filter: any = {
                transporterId: transporterId
            }

            if (status !== 'all') {
                filter.paymentStatus = status
            }

            if (type !== 'all') {
                filter.paymentType = type
            }

            const now = new Date();
            let fromDate: Date | null = null;

            if (date === 'today') {
                fromDate = startOfDay(now)
            } else if (date === 'week') {
                fromDate = subDays(now, 7);
            } else if (date === 'month') {
                fromDate = subDays(now, 30);
            }

            if (date !== 'all') {
                filter.createdAt = { $gte: fromDate }
            }

            const payment = await this._transporterPaymentRepository.find(filter, {}, skip, limit, { createdAt: -1 });
            const totalPayment = await this._transporterPaymentRepository.count(filter);

            return { paymentData: payment, totalPages: Math.ceil(totalPayment / limit), totalEarnings, bidPayments, subscriptionPayment, pendingAmount };

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async startChat(transporterId: string, shipperId: string): Promise<{ success: boolean; chatData: IChat; }> {
        try {

            let chat = await this._chatRepository.findOne({ transporterId, shipperId })

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            if (!chat) {
                chat = await this._chatRepository.createChat({ transporterId: transporterObjectId, shipperId: shipperObjectId })
            }

            return { success: true, chatData: chat }

        } catch (error) {
            console.error(error)
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchChats(transporterId: string): Promise<IChat[]> {
        try {

            let chats = await this._chatRepository.findWithPopulate(
                { transporterId: transporterId },
                [
                    { path: 'shipperId', select: '_id shipperName profileImage' },
                ]
            )

            const updatedChats = [];
            for (let i = 0; i < chats.length; i++) {
                const unreadCount = await this._messageRepository.count({
                    chatId: chats[i]._id,
                    receiverId: transporterId,
                    isRead: false,
                });

                const chatObj = chats[i].toObject();
                chatObj.unreadCount = unreadCount;

                updatedChats.push(chatObj)
            }

            console.log(chats, 'chats');



            return updatedChats

        } catch (error) {
            console.error('Error in Fetch chats', error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async sendMessage(transporterId: string, chatId: string, shipperId: string, content: string): Promise<{ success: boolean; messageData?: IMessage; }> {
        try {

            const chatObjectId = new mongoose.Types.ObjectId(chatId)

            const message = await this._messageRepository.createMessage({
                chatId: chatObjectId,
                senderId: transporterId,
                receiverId: shipperId,
                message: content
            })

            await this._chatRepository.updateLastMessage(chatId, content);

            if (!message) return { success: false }

            return { success: true, messageData: message }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchMessages(chatId: string): Promise<IMessage[]> {
        try {

            const messages = await this._messageRepository.findWithPopulate(
                { chatId },
                [
                    { path: 'chatId', select: 'lastMessage transporterId shipperId' }
                ]
            )

            return messages;

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateMessageAsRead(chatId: string, transporeterId: string): Promise<{ success: boolean; }> {
        try {

            await this._messageRepository.updateMany({ chatId, receiverId: transporeterId, isRead: false }, { isRead: true });

            return { success: true }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchNotifications(transporterId: string, status: string): Promise<INotification[]> {
        try {

            const filter: any = {
                userId: transporterId,
                userType: 'transporter'
            }

            if (status !== 'all') {
                if (status === 'unread') {
                    filter.isRead = false
                } else if (status === 'read') {
                    filter.isRead = true
                }
            }

            const response = await this._notificationRepository.find(filter, {}, 0, 0, { createdAt: -1 })

            return response;

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateNotificationAsRead(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: INotification; }> {
        try {

            const updateData = await this._notificationRepository.updateById(notificationId, { isRead: true });
            if (!updateData) return { success: false, message: 'Notification not updated' }

            return { success: true, message: 'Mark notification as read', notificationData: updateData }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: INotification; }> {
        try {

            const deleteData = await this._notificationRepository.deleteById(notificationId);

            if (!deleteData) return { success: false, message: 'notification not deleted' };

            return { success: true, message: 'notification Deleted', notificationData: deleteData }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchWalletData(tranpsorterId: string): Promise<ITransporterWallet | null> {
        try {

            const walletData = await this._transporterWalletRepository.findOne({ transporterId: tranpsorterId });
            console.log(walletData, 'walletdata');

            return walletData


        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async bidPaymentByWallet(transporterId: string, bidId: string): Promise<{ success: boolean; message: string; }> {
        try {

            const transporterWallet = await this._transporterWalletRepository.findOne({ transporterId: transporterId });

            if (!transporterWallet) return { success: false, message: 'Your Wallet not found' };

            const bid = await this._bidRepository.findBidById(bidId);
            if (!bid) return { success: false, message: 'Bid not Found' }

            const loadId = String(bid.loadId);

            const load = await this._loadRepository.findLoadById(loadId);

            const distanceInKm = load?.distanceInKm;
            const commission = calculateCommission(distanceInKm || 0);

            if (transporterWallet.balance < commission) {
                return { success: false, message: 'Your Wallet no have money for this payment' }
            }

            const updateWallet = await this._transporterWalletRepository.decrementMoneyInWallet(transporterId, commission);

            if (!updateWallet) return { success: false, message: 'Payment not completed' }

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId)
            await this._transporterPaymentRepository.createPayment({
                transactionId: bid.id,
                bidId: bid.id,
                transporterId: transporterObjectId,
                paymentType: 'bid',
                amount: commission,
                paymentStatus: 'success',
                transactionType: 'debit',
                paymentMethod: 'wallet',
            })


            await this._adminPaymentRepository.createAdminPaymentHistory({
                transactionId: bidId,
                userType: 'transporter',
                userId: transporterId,
                amount: commission,
                transactionType: 'credit',
                paymentFor: 'bid',
                bidId: bid.id,
                paymentStatus: 'success',
                paymentMethod: 'wallet'
            })

            const updateBid = await this._bidRepository.findBidAndUpdate(bidId, { transporterPayment: true });

            if (updateBid?.shipperPayment && updateBid.transporterPayment) {

                const trip = await this._tripRepository.createTrip(
                    {
                        transporterId: updateBid.transporterId,
                        shipperId: updateBid.shipperId,
                        loadId: updateBid.loadId,
                        truckId: updateBid.truckId,
                        price: updateBid.price,
                    }
                )

                if (trip) {

                    await this._bidRepository.updateBids({ loadId: bid.loadId, _id: { $ne: updateBid._id } }, { status: 'rejected' })

                    const updateLoad = await this._loadRepository.findLoadByIdAndUpdate(String(updateBid.loadId), { status: 'in-Transit' })

                    const updateTruck = await this._truckRepository.updateTruckById(String(updateBid.truckId), { status: 'in-transit' });

                    const shipperid = String(trip.shipperId)

                    await this._notificationRepository.createNotification({
                        userId: shipperid,
                        userType: 'shipper',
                        title: 'Trip Started',
                        message: 'The transporter has completed the payment. Your shipment is now on its way.'
                    })

                }
            }

            return { success: true, message: 'Trip Start' }

        } catch (error) {
            console.error(error)
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findUnreadNotificationCount(transporeterId: string): Promise<number> {
        try {

            const notificationCount = await this._notificationRepository.count({ userType: 'transporter', userId: transporeterId, isRead: false });

            return notificationCount

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateTruck(updateData: Partial<ITruck>, truckImage: Express.Multer.File): Promise<{ success: boolean; message: string; }> {
        try {

            const { _id, truckOwnerName, truckOwnerMobileNo, tyres, truckType, capacity, rcValidity, operatingStates } = updateData

            console.log(_id);
            console.log(truckOwnerName);
            console.log(truckOwnerMobileNo);
            console.log(tyres);
            console.log(truckType);
            console.log(capacity);
            console.log(rcValidity);
            console.log(operatingStates);
            console.log(truckImage);

            const truck = await this._truckRepository.findById(_id as string);
            console.log(truck, 'truck');

            if (!truck) {
                return { success: false, message: 'Truck not found' }
            }

            let truckImageUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (truckImage) {
                truckImageUrl = await uploadToS3(truckImage, 'truckImage')
            } else {
                truckImageUrl = truck.truckImage;
            }

            let parsedOperatingStates: string[] = [];

            if (typeof operatingStates === 'string') {
                parsedOperatingStates = JSON.parse(operatingStates);
            } else if (Array.isArray(operatingStates)) {
                parsedOperatingStates = operatingStates;
            }

            let parsedRCValidity: Date | undefined = undefined;

            if(rcValidity) {
                parsedRCValidity = new Date(rcValidity);
                if(isNaN(parsedRCValidity.getTime())) {
                    throw new Error('Invalid RC Validity date')
                }
            }

            const updateTruck = await this._truckRepository.updateTruckById(_id as string, {
                truckOwnerName,
                truckOwnerMobileNo,
                tyres,
                truckType,
                capacity,
                rcValidity: parsedRCValidity,
                truckImage: truckImageUrl,
                operatingStates: parsedOperatingStates,

            })

            if(!updateTruck) {
                return {success: false, message: 'Truck update Failed'}
            }

            return { success: true, message: 'Truck updated successFully' }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}