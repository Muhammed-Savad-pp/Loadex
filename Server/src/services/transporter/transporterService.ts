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


configDotenv()


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
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

    async getProfileData(id: string): Promise<{ success: boolean, message: string, transporterData?: Partial<ITransporter> }> {


        const transporterData = await this._transporterRepository.findById(id);

        const signedUrl = await generateSignedUrl(transporterData?.aadhaarBack);
        console.log(signedUrl);


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
            toCoords: { lat: number, lng: number }
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File): Promise<{ success: boolean, message: string }> {

        try {

            console.log(typeof truckData.currentLocationCoords)

            const { vehicleNumber, ownerName, ownerMobileNo, type, capacity, tyres, driverName,
                driverMobileNumber, currentLocation, from, to, selectedLocations, currentLocationCoords, fromCoords, toCoords } = truckData;


            const ExistTruck = await this._truckRepository.findTruckByRcno(vehicleNumber)

            if (ExistTruck) {
                console.log('Truck already exits');
                return { success: false, message: 'Truck already Exits' }
            }

            let rcBookUrl: string | undefined;
            let driverLicenseUrl: string | undefined;

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
                operatingStates: selectedLocations,
                rcBook: rcBookUrl,
                driverLicense: driverLicenseUrl,
                currentLocationCoords: currentLocationCoords,
                pickupLocationCoords: fromCoords,
                dropLocationCoords: toCoords

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

    async getLoads(): Promise<ILoad[] | null> {
        try {

            const projection = {
                shipperId: 1,
                pickupLocation: 1,
                dropLocation: 1,
                material: 1,
                quantity: 1,
                scheduledDate:1,
                length: 1,
                truckType: 1,
                transportationRent: 1,
                height: 1,
                breadth: 1,
                descriptions: 1,
                pickupCoordinates: 1,
                dropCoordinates: 1,
                distanceInKm: 1
            }

            const loads = await this._loadRepository.getLoads(
                {status: 'active'}, 
                [
                    { path: 'shipperId', select: 'companyName shipperName _id'},
                ]
             )
            console.log(loads,'loads');
            
            return loads;

        } catch (error: any) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findTrucks(id: string): Promise<ITruck[] | null> {
        try {

            return await this._truckRepository.findTrucks(id);

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

            console.log(formData);
            

            const truck = await this._truckRepository.findTruckByRcno(formData.truckNo)
            console.log(truck);
            
            if (!truck || !truck.available || truck.verificationStatus !== 'approved' || truck.status !== 'active') {
                return { success: false, message: 'Truck not Available' }
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

            console.log(truckObjectId);
            

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

    async fetchAllBids(transporterid: string): Promise<IBid[] | null> {
        try {

            return await this._bidRepository.findBidsForTransporter(transporterid);

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

            const payment = await this._transporterPaymentRepository.createPayment({
                transactionId: session.id,
                transporterId: bid.transporterId,
                bidId: bidObjectId,
                paymentType: 'bid',
                amount: commission
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

                    if(trip) {

                        const deleteBids = await this._bidRepository.deleteBids({loadId: bid.loadId})
                        console.log('deleteBids',deleteBids)

                        const updateLoad = await this._loadRepository.findLoadByIdAndUpdate(String(bid.loadId), {status: 'in-Transit'})
                        console.log('updateLoad', updateLoad);

                        const updateTruck = await this._truckRepository.updateTruckById(String(bid.truckId), {status: 'in-transit'});
                        console.log('updateTruck', updateTruck);
                        
                        
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

    async fetchTrips(transporterId: string): Promise<ITrip[] | null> {
        try {

            const trips = await this._tripRepository.findTrips(
                { transporterId: transporterId },
                [
                    { path: 'transporterId', select: 'transporterName' },
                    { path: 'shipperId', select: 'shipperName phone companyName profileImage' },
                    { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate length height breadth descriptions distanceInKm ' },
                    { path: 'truckId', select: 'truckNo truckType capacity driverName driverMobileNo ' }
                ]
            )


            return trips;

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateTripStatus(tripId: string, newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'): Promise<{ success: boolean; message: string; }> {
        try {

            const updateData = await this._tripRepository.findByIdAndUpdate(tripId, { tripStatus: newStatus })

            if (!updateData) return { success: false, message: 'Somthing wrong.' };

            if(newStatus == 'completed') {
                await this._truckRepository.updateTruckById(String(updateData.truckId), {status: 'in-active'})
                await this._loadRepository.findLoadByIdAndUpdate(String(updateData.loadId), {status: 'completed'})
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

    async fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{shipperData: IShipper, isFollow: boolean, loadsCount: number, tripsCount: number, reviews: Partial<IRatingReview>[]; averageRating: number,  isReview: boolean}> {
        try {
            
            const shipper = await this._shipperRepository.findShipperById(shipperId);

            if(!shipper) {
                throw new Error('Shipper not found')
            }

            let isFollow;
            if(shipper.followers?.includes(transporterId)){
                isFollow = true;
            }else {
                isFollow = false
            }

            const loadscount = await this._loadRepository.count({shipperId: shipperId});
            const tripsCompletedcount = await this._tripRepository.count({shipperId: shipper, tripStatus: "completed"});
            const reviews = await this._reviewRepository.findWithPopulates(
                { "to.id": shipperId, "to.role": 'Shipper'},
                [
                    { path: 'from.id', select: 'transporterName profileImage'}
                ]
            )

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const isReview = reviews.some(val => val.from.id.equals(transporterObjectId));
            
            const averageRatingPipeline = [
                { $match: { 'to.id': new mongoose.Types.ObjectId(shipperId)}},
                {
                    $group: {
                        _id: "$to.id", 
                        avgRating: { $avg: "$rating"}, 
                    }
                }
            ]

            const averageRatingResult = await this._reviewRepository.aggregate(averageRatingPipeline);
            const averageRating = averageRatingResult[0]?.avgRating ?? 0;

            return {shipperData: shipper, isFollow: isFollow, tripsCount: tripsCompletedcount, loadsCount: loadscount, reviews:reviews, averageRating:averageRating , isReview: isReview };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async followShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: IShipper; isFollow: boolean }> {
        try {
            
            const updateTransporter = await this._transporterRepository.follow(transporterId, 'followings', shipperId);

            if(!updateTransporter) {
                throw new Error('Transporter not found or update failed')
            }

            const updateShipper = await this._shipperRepository.follow(shipperId, 'followers', transporterId);

            if(!updateShipper) throw new Error('Shipper not found or Update failed')

            let isFollow;

            if(updateShipper.followers?.includes(transporterId)) {
                isFollow = true
            } else {
                isFollow = false
            }

            return {success: true, shipperData: updateShipper, isFollow: isFollow};

        } catch (error) {
            throw new Error (error instanceof Error ? error.message : String(error))
        }
    }

    async unFollowShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: IShipper; isFollow: boolean; }> {
        try {
            
            const updateTransporter = await this._transporterRepository.unFollow(transporterId, 'followings', shipperId)

            if(!updateTransporter) throw new Error('Transporter not found')

            const updateShipper = await this._shipperRepository.unFollow(shipperId, 'followers', transporterId);

            if(!updateShipper) throw new Error('Shipper not found');

            let isFollow;
            if(updateShipper.followers?.includes(transporterId)) {
                isFollow = true
            } else {
                isFollow = false
            }
            
            return {success : true, shipperData: updateShipper, isFollow: isFollow};

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    } 

    async postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{ success: boolean; reviewData?: IRatingReview; }> {
        try {
            
            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            const review = await this._reviewRepository.createReview({
                from: { id: transporterObjectId, role: 'Transporter'},
                to: { id: shipperObjectId, role: 'Shipper'},
                rating,
                review: comment
            });

            if(!review) {
                return { success: false } 
            }

            return { success: true, reviewData: review};

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShippers(): Promise<IShipper[] | null> {
        try {
            
            const projection = {
                _id: 1,
                profileImage: 1,
                shipperName: 1,
                companyName: 1,
                email: 1
            }

            return await this._shipperRepository.find({}, projection)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }   
    }

}