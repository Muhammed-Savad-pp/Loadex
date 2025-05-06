import bcrypt from "bcryptjs";
import { generateOtp } from "../transporter/authService";
import { IOtp } from "../../models/otpModel";
import { MailService } from "../../utils/mail";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { IShipper } from "../../models/ShipperModel";
import { IShipperService } from "../../interface/shipper/IShipperService";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { IOtpRepository } from "../../repositories/interface/IOtpRepository";
import { s3 } from "../../config/s3Config";
import { InvalidObjectState, PutObjectCommand } from "@aws-sdk/client-s3";
import { ILoad } from "../../models/LoadModel";
import mongoose, { Mongoose } from "mongoose";
import { IBid } from "../../models/BidModel";
import Stripe from "stripe";
import { configDotenv } from "dotenv";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import { IBidRepository } from "../../repositories/interface/IBidRepository";
import { IShipperPaymentRepository } from "../../repositories/interface/IShipperPaymentRepository";
import { ITrip } from "../../models/TripModel";
import { ITripRepository } from "../../repositories/interface/ITripRepository";
import { ITransporter } from "../../models/TransporterModel";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { IReviewRatingRepository } from "../../repositories/interface/IReviewRatingRepository";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { ITruck } from "../../models/TruckModel";

configDotenv()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
})

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

function calculateCommission(distanceKm: number): number {
    const ratePerKm = 5; 
    return distanceKm * ratePerKm;
}

const mailService = new MailService();


export class ShipperService implements IShipperService {

    constructor(
        private _shipperRepositories: IShipperRepository,
        private _otpRepositories: IOtpRepository,
        private _loadRepositories: ILoadRepository,
        private _bidRepositories: IBidRepository,
        private _shipperPaymentRepositories: IShipperPaymentRepository,
        private _tripRepositories: ITripRepository,
        private _transporterRepositories: ITransporterRepository,
        private _truckRepositories: ITruckRepository,
        private _reviewRatingRepositories: IReviewRatingRepository,
    ) { }

    async shipperSignUp(shipperName: string, email: string, phone: string, password: string, confirmPassword: string): Promise<{ success: boolean, message: string }> {

        if (password !== confirmPassword) {
            return { success: false, message: 'Password and ConfirmPassword do not match' }
        }

        const existingShipper = await this._shipperRepositories.findShipperByEmail(email);

        if (existingShipper && existingShipper.isVerified) {
            return { success: false, message: 'shipperAlreadyExists' }
        }

        if (existingShipper && !existingShipper.isVerified) {

            const getOtp = await this._otpRepositories.findOtpByEmail(email);

            if (getOtp) {

                const currentTime = new Date().getTime();

                const expirationTime = new Date(getOtp.createdAt).getTime() + 2 * 60 * 1000;

                if (currentTime < expirationTime) {
                    return { success: true, message: 'OTP is still valid. Please verify using same OTP.' }
                } else {

                    const newOtp = generateOtp();

                    await this._otpRepositories.createOtp({ email, otp: newOtp } as unknown as IOtp);

                    await mailService.sendOtpEmail(email, newOtp);

                    return { success: true, message: "OTP expired. A new OTP has been sent to your email" }

                }

            } else {

                const newOtp = generateOtp();

                await this._otpRepositories.createOtp({ email, otp: newOtp } as unknown as IOtp);

                await mailService.sendOtpEmail(email, newOtp)

                return { success: true, message: 'no OTP found. A new otp has been sent to your email ' }

            }

        }


        const hashedPassword = await hashPassword(password);

        const savedShipper = await this._shipperRepositories.createShipper({
            shipperName: shipperName,
            email: email,
            phone: phone,
            password: hashedPassword,
        })

        const newOtp = generateOtp();

        await this._otpRepositories.createOtp({ email, otp: newOtp } as unknown as IOtp);

        await mailService.sendOtpEmail(email, newOtp)

        return { success: true, message: 'shipperCreated' }

    }

    async verifyShipperOtp(otpdata: { otpData: string, email: string }): Promise<{ success: boolean, message: string }> {

        const { otpData, email } = otpdata;

        const validUser = await this._shipperRepositories.findShipperByEmail(email);

        if (!validUser) {
            return { success: false, message: 'This Email not registered' }
        }

        const currentOtp = await this._otpRepositories.findOtpByEmail(email);

        if (!currentOtp?.otp) return { success: false, message: 'Resend the OTP' }

        if (currentOtp.otp === otpData) {

            await this._shipperRepositories.verifyShipper(email, true);

            await this._otpRepositories.deleteOtpByEmail(email);

            return { success: true, message: "OTP Verification Completed" }
        } else {
            return { success: false, message: 'Please Enter Valid OTP' }
        }

    }

    async resendOtp(resendOtpData: { email: string }): Promise<{ success: boolean, message: string }> {

        const email = resendOtpData.email;
        const otp = generateOtp();

        try {

            const existingEmail = await this._otpRepositories.findOtpByEmail(email);

            if (existingEmail) {

                await this._otpRepositories.updateOtpByEmail(email, otp)

            } else {

                await this._otpRepositories.createOtp({ email, otp } as unknown as IOtp)
            }

            await mailService.sendOtpEmail(email, otp);

            return { success: true, message: "New Otp Sended" }

        } catch (error) {
            console.log(error)
            return { success: false, message: 'failed to resend OTP' }
        }
    }

    async shipperLogin(userData: { email: string, password: string }): Promise<{ success: boolean, message: string, data?: Partial<IShipper>, accessToken?: string, refreshToken?: string }> {

        const { email, password } = userData;

        const existingShipper = await this._shipperRepositories.findShipperByEmail(email);

        if (!existingShipper) {
            return { success: false, message: 'Invalid Crediantional' }
        }

        const validPassword = await bcrypt.compare(password, existingShipper.password);

        if (!validPassword) {
            return { success: false, message: 'Invalid Password' }
        }

        if (existingShipper && existingShipper.isBlocked) {
            return { success: false, message: "The Shipper is Blocked" }
        }

        const shippperData: Partial<IShipper> = {
            shipperName: existingShipper.shipperName,
            email: existingShipper.email
        }

        const { ...data } = existingShipper;

        const accessToken = await generateAcessToken(data._id as string, 'shipper');
        const refreshToken = await generateRefreshToken(data._id as string, 'shipper');

        return { success: true, message: "Logged SuccessFully", data: shippperData, accessToken, refreshToken }

    }

    async shipperGoogleLoging(name: string, email: string): Promise<{ success: boolean; message: string; data?: Partial<IShipper> | null; accessToken?: string; refreshToken?: string; }> {
        try {

            const existingShipper = await this._shipperRepositories.findShipperByEmail(email);

            if (!existingShipper) {
                const savedShipper:any = await this._shipperRepositories.createShipper({
                    shipperName: name,
                    email: email,
                    phone: 'not Provided',
                    password: '',
                    isVerified: true,
                })

                const accessToken = await generateAcessToken(savedShipper._id as string, 'shipper');
                const refreshToken = await generateRefreshToken(savedShipper._id as string, 'shipper');

                return { success: true, message: "Logged SuccessFully", data: existingShipper, accessToken, refreshToken }
            }


            if (existingShipper && existingShipper.isBlocked) {
                return { success: false, message: "The Shipper is Blocked" }
            }

            const { ...data } = existingShipper;


            const accessToken = await generateAcessToken(data._id as string, 'shipper');
            const refreshToken = await generateRefreshToken(data._id as string, 'shipper');

            return { success: true, message: "Logged SuccessFully", data: existingShipper, accessToken, refreshToken }


        } catch (error) {
            console.log(error);
            return { success: false, message: 'Shipper not login' }

        }
    }

    async getShipperProfileData(id: string): Promise<{ success: boolean; message: string; shipperData?: Partial<IShipper>; }> {
        try {

            const shipperData = await this._shipperRepositories.findById(id)

            if (!shipperData) {
                return { success: false, message: 'Shipper not found' }
            }


            return { success: true, message: 'Shipper Find Successfully', shipperData: shipperData };

        } catch (error) {
            console.error('error in shipperService ', error)
            return { success: false, message: 'error in GetShipperProfiledData' }
        }
    }

    async registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File): Promise<{ success: boolean; message: string; shipperData?: Partial<IShipper>; }> {
        try {

            let aadhaarFrontUrl: string | undefined;
            let aadhaarBackUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/shipper/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;
            }

            if (aadhaarFront) {
                aadhaarFrontUrl = await uploadToS3(aadhaarFront, 'aadhaar-front');
            }

            if (aadhaarBack) {
                aadhaarBackUrl = await uploadToS3(aadhaarBack, 'aadhaar-back');
            }

            const updateShipper = await this._shipperRepositories.updateShipperById(
                shipperId,
                {
                    companyName,
                    panNumber,
                    gstNumber,
                    aadhaarFront: aadhaarFrontUrl,
                    aadhaarBack: aadhaarBackUrl,
                    verificationStatus: 'requested'
                }
            )

            if (!updateShipper) {
                return { success: false, message: 'Shipper not found' }
            }

            return {
                success: true, message: 'Kyc verification completed',
                shipperData: {
                    companyName: updateShipper.companyName,
                    gstNumber: updateShipper.gstNumber,
                    panNumber: updateShipper.panNumber,
                    aadhaarFront: updateShipper.aadhaarFront,
                    aadhaarBack: updateShipper.aadhaarBack,
                    verificationStatus: updateShipper.verificationStatus
                }
            }

        } catch (error) {
            console.error(error, 'error in service')
            return { success: false, message: 'Kyc verification failed ' }
        }

    }

    async createLoad(shipperId: string, formData: Partial<ILoad>): Promise<{ success: boolean; message: string; }> {
        try {
            const materials = formData.material;

            const { pickupLocation, dropLocation, material, quantity, scheduledDate, length, truckType,
                transportationRent, height, breadth, descriptions, pickupCoordinates, dropCoordinates } = formData;


            console.log(pickupLocation, dropLocation, material, quantity, scheduledDate, length, truckType, transportationRent, height, breadth, descriptions);

            function deg2rad(deg:number): number {
                return deg * (Math.PI / 180);
            }

            function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2:number): number {

                const R = 6371;
                const dLat = deg2rad(lat2 - lat1);
                const dLon = deg2rad(lon2 - lon1);

                const a = 
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
                    Math.cos(deg2rad(lat1)) * 
                        Math.cos(deg2rad(lat2)) * 
                        Math.sin(dLon / 2) * 
                        Math.sin(dLon / 2);

                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;
                return d ;
            }

            let distances = 0;

            if (
                pickupCoordinates?.latitude !== undefined && pickupCoordinates?.longitude !== undefined &&
                dropCoordinates?.latitude !== undefined &&  dropCoordinates?.longitude !== undefined  ) {

                distances = getDistanceFromLatLonInKm(
                  pickupCoordinates.latitude,
                  pickupCoordinates.longitude,
                  dropCoordinates.latitude,
                  dropCoordinates.longitude
                );
              
                console.log("Distance (km):", distances);
              }
              

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            const createLoad = await this._loadRepositories.createLoad({
                shipperId: shipperObjectId,
                pickupLocation,
                dropLocation,
                material,
                quantity,
                scheduledDate,
                length,
                truckType,
                transportationRent,
                height,
                breadth,
                descriptions,
                pickupCoordinates,
                dropCoordinates,
                distanceInKm: Math.round(distances)
            })

            if (!createLoad) {
                return { success: false, message: 'Load not created' }
            }

            return { success: true, message: 'Load created' }

        } catch (error) {
            console.error('error in create load at shipperService', error);
            return { success: false, message: 'Create Load Failed' }
        }
    }

    async getVerificationStatus(id: string): Promise<{ success: boolean; message: string; shipperData?: string }> {
        try {

            const shipper = await this._shipperRepositories.findShipperById(id);

            console.log(shipper)

            if (!shipper) {
                return { success: false, message: 'Shipper not Found' }
            }

            return { success: true, message: 'Shipper find successFully', shipperData: shipper.verificationStatus };

        } catch (error) {
            console.log(error);
            return { success: false, message: 'Find Shipper VerificationsStatus Failed' }
        }
    }

    async forgotPassword(email: string): Promise<{ success: boolean; message: string; }> {
        try {

            const shipper = await this._shipperRepositories.findShipperByEmail(email);
            console.log(shipper);

            if (!shipper) {
                return { success: false, message: 'Shipper Not Registered' }
            }

            const newOtp = generateOtp();

            await this._otpRepositories.createOtp({ email, otp: newOtp } as unknown as IOtp)

            await mailService.sendOtpEmail(email, newOtp)

            return { success: true, message: 'Otp send successfully' }

        } catch (error) {
            console.log(error);
            return { success: false, message: 'Forgot Password Failed' }
        }
    }

    async setNewPassword(email: string, password: string): Promise<{ success: boolean; message: string; }> {
        try {

            const shipper = await this._shipperRepositories.findShipperByEmail(email);

            const hashedPassword = await hashPassword(password);
            const id = String(shipper?._id);

            await this._shipperRepositories.updateShipperById(id, { password: hashedPassword });

            return { success: true, message: 'Password Changed SuccessFuly' }

        } catch (error) {
            console.log(error);
            return { success: false, message: 'New Password Set is failed' }
        }
    }

    async findBids(id: string): Promise<IBid[] | null> {
        try {

            const bids = await this._bidRepositories.findBidsForShipper(id);

            return bids

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateBidStatus(bidId: string, status: string): Promise<{ success: boolean, message: string, bidData?: IBid }> {
        try {

            const updateBid = await this._bidRepositories.updateBidStatus(bidId, status);
            if (!updateBid) {
                return { success: false, message: `Bid not ${status}` };
            }

            return { success: true, message: `Bid ${status}` };

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getShipperLoads(shipperId: string): Promise<ILoad[] | null> {
        try {

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            const projection = {
                pickupLocation: 1,
                dropLocation: 1,
                material: 1,
                quantity: 1,
                scheduledDate: 1,
                createdAt: 1,
                length: 1,
                truckType: 1,
                transportationRent: 1,
                height: 1,
                breadth: 1,
                descriptions: 1,
                status: 1,
            }

            const filter = {
                shipperId: shipperObjectId
            }

            return await this._loadRepositories.getLoads( 
                {shipperId: shipperObjectId},
                []
            );

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async sessionCheckout(bidId: string): Promise<{ success: boolean; message: string; sessionId?: string; }> {
        try {
            
            const bidObjectId =  new mongoose.Types.ObjectId(bidId);

            const bid = await this._bidRepositories.findBidById(bidId);
            if(!bid) return {success: false, message: 'Bid not found'};
            
            const loadid = String(bid.loadId)

            const load = await this._loadRepositories.findLoadById(loadid)

            const distanceInKm = load?.distanceInKm;
            const commission = calculateCommission(distanceInKm || 0);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Shipping Platform Commission',
                                description: `Commission for bid ${bidId}`,
                            },
                            unit_amount: Math.round(commission * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `http://localhost:5173/shipper/success?transactionId={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/shipper/failed?transactionId={CHECKOUT_SESSION_ID}`,
            })


            const payment = await this._shipperPaymentRepositories.createPayment(
                {
                    transactionId: session.id,
                    shipperId: bid.shipperId,
                    bidId: bidObjectId,
                    paymentType: 'bid',
                    amount: commission
                }
            )


            return {success: true, sessionId: session.id, message: 'payment'}

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async verifyPayment(transactionId: string, status: string): Promise<{ success: boolean; message: string; }> {
        try {

            const shipperPayment = await this._shipperPaymentRepositories.findShipperPaymentByTransactionIdandUpdate(transactionId, status)

            console.log('shipperPayment',shipperPayment);

            const bidId = String(shipperPayment?.bidId)
            
            if(status === 'success') {
                const bidData = await this._bidRepositories.findBidAndUpdate(bidId, {shipperPayment: true, status: 'accepted'})
            }

            return {success: true,  message: 'success'}
           

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrips(shipperId: string): Promise<ITrip[] | null> {
        try {
            
            const trips = await this._tripRepositories.findTrips(
                {shipperId: shipperId}, 
                [
                    {path: 'transporterId', select: "transporterName phone profileImage"},
                    {path: 'shipperId', select: "shipperName"},
                    {path: 'loadId', select: "pickupLocation dropLocation material quantity scheduledDate length height breadth descriptions distanceInKm "},
                    {path: 'truckId', select: "truckNo truckType capacity driverName driverMobileNo"}
                ]
            )

            return trips;

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateProfile(shipperId: string, shipperName: string, phone: string, profileImage?: Express.Multer.File): Promise<{ success: boolean; message: string; shipperData?: Partial<IShipper>; }> {
        try {
            
            let profileImageUrl: string | undefined

            const uploadToS3 = async (file: Express.Multer.File , folder: string) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: `${folder}/shipper/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Params.Key}`;

            }

            if(profileImage) {
                profileImageUrl = await uploadToS3(profileImage, 'profileImage')
            }

            const updateShipper = await this._shipperRepositories.updateShipperById(shipperId, {
                shipperName: shipperName,
                phone: phone,
                profileImage: profileImageUrl,
            })

            if(!updateShipper) {
                return {success: false, message: 'Shipper Profile not Updated'}
            }

            console.log('profileImageUrl',profileImageUrl);

            return {success:true, message: 'Shipper Profile Updated SuccessFully', shipperData: updateShipper}

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporterDetails(shipperId: string, transporterId: string): Promise<{ transporterData: ITransporter; isFollow: boolean; truckCount: number; tripsCount: number; reviews: Partial<IRatingReview>[]; averageRating: number,  isReview: boolean}> {
        try {

            const transporter = await this._transporterRepositories.findTransporterById(transporterId);

            if(!transporter) {
                throw new Error("Transporter not found")
            }

            let isFollow;
            if(transporter.followers?.includes(shipperId)) {
                isFollow = true
            } else {
                isFollow = false;
            }

            const trucks = await this._truckRepositories.count({verificationStatus: 'approved'});
            const trips = await this._tripRepositories.count({transporterId: transporterId, tripStatus: 'completed'});
            const reviews = await this._reviewRatingRepositories.findWithPopulates(
                {"to.id": transporterId, "to.role": "Transporter"},
                [
                    {path: 'from.id', select: 'shipperName profileImage'}
                ]
            )

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);
            let isReview = reviews.some(val => val.from.id.equals(shipperObjectId))

            const AverageRatingPipeline = [
                { $match: { "to.id": new mongoose.Types.ObjectId(transporterId)}},
                {
                    $group: {
                        _id: "$to.id",
                        avgRating: { $avg: "$rating"},
                    }
                }
            ]
            const averageRatingResult = await this._reviewRatingRepositories.aggregate(AverageRatingPipeline);
            const averageRating = averageRatingResult[0]?.avgRating ?? 0;
                
            return {transporterData: transporter , isFollow: isFollow, truckCount: trucks, tripsCount: trips, reviews: reviews, averageRating: averageRating, isReview};
            
        } catch (error) {
            throw new Error (error instanceof Error ? error.message : String(error))
        }
    }

    async followTransporter(shipperId: string, tranpsorterId: string): Promise<{ success: boolean; transporterData: ITransporter; isFollow: boolean; }> {
        try {
            
            const updateTransporter = await this._transporterRepositories.follow(tranpsorterId, 'followers', shipperId);

            if(!updateTransporter) {
                throw new Error('Transporter not found or Update Failed')
            }

            const updateShipper = await this._shipperRepositories.follow(shipperId, 'followings', tranpsorterId);

            if(!updateShipper) {
                throw new Error('Shipper not found or Update Failed')
            }

            let isFollow;
            if(updateTransporter.followers?.includes(shipperId)) {
                isFollow = true;
            } else {
                isFollow = false
            }

            return {success: true , transporterData: updateTransporter, isFollow: isFollow};

        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }

    async unFollowTransporter(shipperId: string, transporterId: string): Promise<{ success: boolean; transporterData: ITransporter; isFollow: boolean; }> {
        try {
            
            const updateTransporter = await this._transporterRepositories.unFollow(transporterId, 'followers', shipperId);

            if(!updateTransporter) {
                throw new Error('Transporter not found or Update failed')
            }

            const updateShipper = await this._shipperRepositories.unFollow(shipperId, 'followings', transporterId);

            if(!updateShipper) {
                throw new Error('Shipper not found or Update failed')
            };

            let isFollow;
            if(updateTransporter.followers?.includes(shipperId)) {
                isFollow = true;
            } else {
                isFollow = false
            }

            return { success: true, transporterData: updateTransporter, isFollow: isFollow};

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async postReview(shipperId: string, tranpsorterId: string, rating: number, comment: string): Promise<{ success: boolean, reviewData?: IRatingReview}> {
        try {

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);
            const transporterObjectId = new mongoose.Types.ObjectId(tranpsorterId);

            const review = await this._reviewRatingRepositories.createReview({
                from: { id: shipperObjectId, role: 'Shipper' },
                to: { id: transporterObjectId, role: 'Transporter'},
                rating,
                review: comment
            })

            if(!review) {
                return { success: false}
            }

            return {success: true, reviewData: review}
            
        } catch (error) {
            throw new Error (error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporters(): Promise<ITransporter[] | null> {
        try {
            
            const projection = {
                _id: 1,
                transporterName: 1,
                profileImage: 1,
                email: 1,
            }

            return await this._transporterRepositories.find({}, projection);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrucks(): Promise<ITruck[] | null> {
        try {
            
            const trucks =  await this._truckRepositories.findWithPopulate(
                {verificationStatus: 'approved'},
                [
                    {path:'transporterId', select:'transporterName profileImage'}
                ]
            )
            console.log(trucks);
            
            return trucks

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}