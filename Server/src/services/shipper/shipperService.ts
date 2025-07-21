import bcrypt from "bcryptjs";
import { generateOtp } from "../transporter/authService";
import { IOtp } from "../../models/otpModel";
import { MailService } from "../../utils/mail";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { IShipper } from "../../models/ShipperModel";
import { IShipperService } from "../../interface/shipper/IShipperService";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { IOtpRepository } from "../../repositories/interface/IOtpRepository";
import { getPresignedDownloadUrl, s3 } from "../../config/s3Config";
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
import { SHIPPER_SUBSCRIPTION_PLAN } from "../../config/shipperPlans";
import { IChat } from "../../models/Chat";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { IMessageRepository } from "../../repositories/interface/IMessageRepository";
import { IMessage } from "../../models/Message";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { INotification } from "../../models/NotificationModel";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipperPayment } from "../../models/ShipperPaymentModel";
import { startOfDay, subDays } from "date-fns";
import { IAdminPaymentRepository } from "../../repositories/interface/IAdminPaymentRepository";
import { BidForShipperDTO } from "../../dtos/bids/bid.for.shipper.dto";
import { ShipperDTO, ShipperPaymentDTO, TransporterForShipperDTO } from "../../dtos/shipper/shipper.dto";
import config from "../../config";
import { LoadForShipperDTO } from "../../dtos/load/load.dto";
import { TripForShipperDTO } from "../../dtos/trip/trip.for.transporter.dto";
import { TruckForShipperDTO } from "../../dtos/truck/truck.for.shipper.dto";
import { ChatForShipperDTO } from "../../dtos/chat/chat.dto";
import { ReviewForShipperDTO } from "../../dtos/reviews/review.dto";
import { NotificationForShipper } from "../../dtos/notifications/notification.dto";

configDotenv()

const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-04-30.basil',
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
        private _chatRepository: IChatRepository,
        private _messageRepository: IMessageRepository,
        private _notificationRepository: INotificationRepository,
        private _adminPaymentRepository: IAdminPaymentRepository,
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

    async shipperLogin(userData: { email: string, password: string }): Promise<{ success: boolean, message: string, accessToken?: string, refreshToken?: string }> {

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

        return { success: true, message: "Logged SuccessFully", accessToken, refreshToken }

    }

    async shipperGoogleLoging(name: string, email: string): Promise<{ success: boolean; message: string; accessToken?: string; refreshToken?: string; }> {
        try {

            const existingShipper = await this._shipperRepositories.findShipperByEmail(email);

            if (!existingShipper) {
                const savedShipper: any = await this._shipperRepositories.createShipper({
                    shipperName: name,
                    email: email,
                    phone: 'not Provided',
                    password: '',
                    isVerified: true,
                })

                const accessToken = await generateAcessToken(savedShipper._id as string, 'shipper');
                const refreshToken = await generateRefreshToken(savedShipper._id as string, 'shipper');

                return { success: true, message: "Logged SuccessFully", accessToken, refreshToken }
            }


            if (existingShipper && existingShipper.isBlocked) {
                return { success: false, message: "The Shipper is Blocked" }
            }

            const { ...data } = existingShipper;


            const accessToken = await generateAcessToken(data._id as string, 'shipper');
            const refreshToken = await generateRefreshToken(data._id as string, 'shipper');

            return { success: true, message: "Logged SuccessFully", accessToken, refreshToken }


        } catch (error) {
            console.log(error);
            return { success: false, message: 'Shipper not login' }

        }
    }

    async getShipperProfileData(id: string): Promise<{ success: boolean; message: string; shipperData?: ShipperDTO; }> {
        try {

            const shipperData = await this._shipperRepositories.findById(id)

            if (!shipperData) {
                return { success: false, message: 'Shipper not found' }
            }

            const profileImageUrl = shipperData.profileImage
                ? await getPresignedDownloadUrl(shipperData.profileImage)
                : '';
            const aadhaarFrontUrl = shipperData.aadhaarFront
                ? await getPresignedDownloadUrl(shipperData.aadhaarFront)
                : '';
            const aadhaarBackUrl = shipperData.aadhaarBack
                ? await getPresignedDownloadUrl(shipperData.aadhaarBack)
                : '';


            const dto: ShipperDTO = {
                shipperName: shipperData.shipperName ?? '',
                email: shipperData.email ?? '',
                phone: shipperData.phone ?? '',
                verificationStatus: shipperData.verificationStatus ?? '',
                panNumber: shipperData.panNumber ?? '',
                aadhaarFront: aadhaarFrontUrl ?? '',
                aadhaarBack: aadhaarBackUrl ?? '',
                companyName: shipperData.companyName ?? '',
                gstNumber: shipperData.gstNumber ?? '',
                profileImage: profileImageUrl ?? '',
                followers: shipperData.followers?.map(String) ?? [],
                followings: shipperData.followings?.map(String) ?? [],
                subscription: {
                    planId: shipperData.subscription?.planId ?? '',
                    planName: shipperData.subscription?.planName ?? '',
                    status: shipperData.subscription?.status ?? '',
                    startDate: shipperData.subscription?.startDate ?? null,
                    endDate: shipperData.subscription?.endDate ?? null,
                    createdAt: shipperData.subscription?.createdAt ?? null,
                    isActive: shipperData.subscription?.isActive ?? false,
                    paidAmount: shipperData.subscription?.paidAmount ?? 0
                }
            };


            return {
                success: true,
                message: 'Shipper Find Successfully',
                shipperData: dto
            };


        } catch (error) {
            console.error('error in shipperService ', error)
            return { success: false, message: 'error in GetShipperProfiledData' }
        }
    }

    async registerKyc(shipperId: string, companyName: string, panNumber: string, gstNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File): Promise<{ success: boolean; message: string; shipperData?: ShipperDTO; }> {
        try {

            let aadhaarFrontKey: string | undefined;
            let aadhaarBackKey: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {

                const key = `${folder}/shipper/${Date.now()}_${file.originalname}`
                const s3Params = {
                    Bucket: config.awsBucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return key;
            }

            if (aadhaarFront) {
                aadhaarFrontKey = await uploadToS3(aadhaarFront, 'aadhaar-front');
            }

            if (aadhaarBack) {
                aadhaarBackKey = await uploadToS3(aadhaarBack, 'aadhaar-back');
            }

            const updatedShipper = await this._shipperRepositories.updateShipperById(
                shipperId,
                {
                    companyName,
                    panNumber,
                    gstNumber,
                    aadhaarFront: aadhaarFrontKey,
                    aadhaarBack: aadhaarBackKey,
                    verificationStatus: 'requested'
                }
            )

            if (!updatedShipper) {
                return { success: false, message: 'Shipper not found' }
            }

            return {
                success: true,
                message: "KYC verification completed",
                shipperData: {
                    shipperName: updatedShipper.shipperName ?? "",
                    email: updatedShipper.email ?? "",
                    phone: updatedShipper.phone ?? "",
                    verificationStatus: updatedShipper.verificationStatus ?? "pending",
                    panNumber: updatedShipper.panNumber ?? "",
                    aadhaarFront: updatedShipper.aadhaarFront ?? "",
                    aadhaarBack: updatedShipper.aadhaarBack ?? "",
                    companyName: updatedShipper.companyName ?? "",
                    gstNumber: updatedShipper.gstNumber ?? "",
                    profileImage: updatedShipper.profileImage ?? "",
                    followers: updatedShipper.followers ?? [],
                    followings: updatedShipper.followings ?? [],
                    subscription: {
                        planId: updatedShipper.subscription?.planId ?? "",
                        planName: updatedShipper.subscription?.planName ?? "",
                        status: updatedShipper.subscription?.status ?? "",
                        startDate: updatedShipper.subscription?.startDate
                            ? new Date(updatedShipper.subscription.startDate)
                            : null,
                        endDate: updatedShipper.subscription?.endDate
                            ? new Date(updatedShipper.subscription.endDate)
                            : null,
                        isActive: updatedShipper.subscription?.isActive ?? false,
                        createdAt: updatedShipper.subscription?.createdAt
                            ? new Date(updatedShipper.subscription.createdAt)
                            : null,
                        paidAmount: updatedShipper.subscription?.paidAmount ?? 0,
                    },
                },
            };

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

            const shipper = await this._shipperRepositories.findById(shipperId)

            const today = new Date();

            const dayOfWeek = today.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() + diffToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const loadCountOfWeek = await this._loadRepositories.count({ shipperId: shipperId, createdAt: { $gte: startOfWeek, $lte: endOfWeek } })

            if (loadCountOfWeek >= 2 && !shipper?.subscription?.isActive) {
                return { success: false, message: 'You can post up to 2 loads per week with a free account. Please subscribe to post more loads.' }
            }

            function deg2rad(deg: number): number {
                return deg * (Math.PI / 180);
            }

            function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {

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
                return d;
            }

            let distances = 0;

            if (
                pickupCoordinates?.latitude !== undefined && pickupCoordinates?.longitude !== undefined &&
                dropCoordinates?.latitude !== undefined && dropCoordinates?.longitude !== undefined) {

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

    async findBids(id: string, page: number, limit: number, status: string): Promise<{ bidData: BidForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit

            const filter: any = {
                shipperId: id
            };

            if (status !== 'all') {
                filter.status = status
            }

            const bids = await this._bidRepositories.findBidsForShipper(filter, skip, limit);
            const bidsCount = await this._bidRepositories.count({ shipperId: id })

            const bidDatos: BidForShipperDTO[] = await Promise.all(
                (bids ?? []).map(async (bid: IBid) => {
                    let profileImageUrl = '';
                    let truckImageUrl = '';

                    // Generate presigned URLs if keys exist
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

    async updateBidStatus(bidId: string, status: string): Promise<{ success: boolean, message: string }> {
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

    async getShipperLoads(shipperId: string, page: number, limit: number): Promise<{ loads: LoadForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            const loads = await this._loadRepositories.getLoads(
                { shipperId: shipperObjectId },
                [],
                skip,
                limit,
                { createdAt: -1 }
            );

            const total = await this._loadRepositories.count({ shipperId: shipperObjectId });

            const loadDatos: LoadForShipperDTO[] = (loads || []).map((load: any) => ({
                _id: load._id.toString(),
                pickupLocation: load.pickupLocation ?? '',
                dropLocation: load.dropLocation ?? '',
                material: load.material ?? '',
                quantity: load.quantity ?? '',
                length: load.length ?? '',
                truckType: load.truckType ?? '',
                transportationRent: load.transportationRent ?? '',
                height: load.height ?? '',
                breadth: load.breadth ?? '',
                status: load.status ?? '',
                scheduledDate: load.scheduledDate,
                createdAt: load.createdAt,
                descriptions: load.descriptions ?? '',
                pickupCoordinates: {
                    latitude: load.pickupCoordinates?.latitude ?? 0,
                    longitude: load.pickupCoordinates?.longitude ?? 0
                },
                dropCoordinates: {
                    latitude: load.dropCoordinates?.latitude ?? 0,
                    longitude: load.dropCoordinates?.longitude ?? 0
                }
            }));

            return { loads: loadDatos, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async sessionCheckout(bidId: string): Promise<{ success: boolean; message: string; sessionId?: string; }> {
        try {


            const bidObjectId = new mongoose.Types.ObjectId(bidId);

            const existingPayment = await this._shipperPaymentRepositories.findOne({ bidId: bidObjectId })

            console.log(existingPayment, 'existing');


            if (existingPayment && (existingPayment.paymentStatus === 'success' || existingPayment.paymentStatus === 'pending')) {
                console.log('herere');

                return { success: false, message: 'Payment is already in progress or completed for this bid.' };
            }

            const bid = await this._bidRepositories.findBidById(bidId);
            if (!bid) return { success: false, message: 'Bid not found' };

            const loadid = String(bid.loadId)

            const load = await this._loadRepositories.findLoadById(loadid)

            const distanceInKm = load?.distanceInKm;
            const commission = calculateCommission(distanceInKm || 0);

            const totalAmount = commission + Number(bid.price)

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Shipping Platform Commission',
                                description: `Ammount for bid ${bidId}`,
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${config.frontEndUrl}/shipper/success?transactionId={CHECKOUT_SESSION_ID}`,
                cancel_url: `${config.frontEndUrl}/failed?transactionId={CHECKOUT_SESSION_ID}`,
            })


            const payment = await this._shipperPaymentRepositories.createPayment(
                {
                    transactionId: session.id,
                    shipperId: bid.shipperId,
                    bidId: bidObjectId,
                    paymentType: 'bid',
                    amount: totalAmount,
                    transactionType: 'debit',
                }
            )


            const shipperId = String(bid?.shipperId)

            await this._adminPaymentRepository.createAdminPaymentHistory({
                transactionId: session.id,
                userType: 'shipper',
                userId: shipperId,
                amount: totalAmount,
                transactionType: 'credit',
                paymentFor: 'bid',
                bidId: bidObjectId
            })


            return { success: true, sessionId: session.id, message: 'payment' }

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async verifyPayment(transactionId: string, status: string): Promise<{ success: boolean; message: string; }> {
        try {

            const session = await stripe.checkout.sessions.retrieve(transactionId);
            const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';

            const shipperPayment = await this._shipperPaymentRepositories.findShipperPaymentByTransactionIdandUpdate(transactionId, status, paymentIntentId)
            await this._adminPaymentRepository.updateBytransactionId(transactionId, status)

            console.log('shipperPayment', shipperPayment);

            const bidId = String(shipperPayment?.bidId)

            if (status === 'success') {

                const bidData = await this._bidRepositories.findBidAndUpdate(bidId, { shipperPayment: true, status: 'accepted' });


                const transporterId = String(bidData?.transporterId)
                await this._notificationRepository.createNotification({
                    userId: transporterId,
                    userType: 'transporter',
                    title: 'Your Bid Has Been Accepted!',
                    message: `Your bid on load ${bidData?.loadId} has been accepted by the shipper. Get ready to transport!`
                })
            }

            return { success: true, message: 'success' }


        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrips(shipperId: string, page: number, limit: number, status: string): Promise<{ tripsData: TripForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const filter: any = {
                shipperId: shipperId
            };

            if (status !== 'all') {
                filter.tripStatus = status
            }



            const trips = await this._tripRepositories.findTrips(
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



            const tripsCount = await this._tripRepositories.count(filter);

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

    async updateProfile(shipperId: string, shipperName: string, phone: string, profileImage?: Express.Multer.File): Promise<{ success: boolean; message: string; shipperData?: ShipperDTO; }> {
        try {

            let profileImageKey: string | undefined

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const key = `${folder}/shipper/${Date.now()}_${file.originalname}`
                const s3Params = {
                    Bucket: config.awsBucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return key;

            }

            if (profileImage) {
                profileImageKey = await uploadToS3(profileImage, 'profileImage')
            }

            const updatedShipper = await this._shipperRepositories.updateShipperById(shipperId, {
                shipperName: shipperName,
                phone: phone,
                profileImage: profileImageKey,
            })

            if (!updatedShipper) {
                return { success: false, message: 'Shipper Profile not Updated' }
            }

            const profileImageUrl = updatedShipper.profileImage
                ? await getPresignedDownloadUrl(updatedShipper.profileImage)
                : "";

            const aadhaarFrontUrl = updatedShipper.aadhaarFront ? await getPresignedDownloadUrl(updatedShipper.aadhaarFront) : '';
            const aadhaarBackUrl = updatedShipper.aadhaarBack ? await getPresignedDownloadUrl(updatedShipper.aadhaarBack) : '';

            return {
                success: true,
                message: "Shipper Profile Updated Successfully",
                shipperData: {
                    shipperName: updatedShipper.shipperName ?? "",
                    email: updatedShipper.email ?? "",
                    phone: updatedShipper.phone ?? "",
                    verificationStatus: updatedShipper.verificationStatus ?? "pending",
                    panNumber: updatedShipper.panNumber ?? "",
                    aadhaarFront: aadhaarFrontUrl ?? "",
                    aadhaarBack: aadhaarBackUrl ?? "",
                    companyName: updatedShipper.companyName ?? "",
                    gstNumber: updatedShipper.gstNumber ?? "",
                    profileImage: profileImageUrl ?? '',
                    followers: updatedShipper.followers ?? [],
                    followings: updatedShipper.followings ?? [],
                    subscription: {
                        planId: updatedShipper.subscription?.planId ?? "",
                        planName: updatedShipper.subscription?.planName ?? "",
                        status: updatedShipper.subscription?.status ?? "",
                        startDate: updatedShipper.subscription?.startDate
                            ? new Date(updatedShipper.subscription.startDate)
                            : null,
                        endDate: updatedShipper.subscription?.endDate
                            ? new Date(updatedShipper.subscription.endDate)
                            : null,
                        isActive: updatedShipper.subscription?.isActive ?? false,
                        createdAt: updatedShipper.subscription?.createdAt
                            ? new Date(updatedShipper.subscription.createdAt)
                            : null,
                        paidAmount: updatedShipper.subscription?.paidAmount ?? 0,
                    },
                },
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporterDetails(shipperId: string, transporterId: string): Promise<{ transporterData: TransporterForShipperDTO; isFollow: boolean; truckCount: number; tripsCount: number; reviews: ReviewForShipperDTO[]; averageRating: number, isReview: boolean }> {
        try {

            const transporter = await this._transporterRepositories.findTransporterById(transporterId);

            if (!transporter) {
                throw new Error("Transporter not found")
            }

            let isFollow;
            if (transporter.followers?.includes(shipperId)) {
                isFollow = true
            } else {
                isFollow = false;
            }

            const trucks = await this._truckRepositories.count({ verificationStatus: 'approved' });
            const trips = await this._tripRepositories.count({ transporterId: transporterId, tripStatus: 'completed' });
            const rawReviews = await this._reviewRatingRepositories.findWithPopulates(
                { "to.id": transporterId, "to.role": "Transporter" },
                [
                    { path: 'from.id', select: 'shipperName profileImage' }
                ]
            )

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);
            let isReview = rawReviews.some(val => val.from.id.equals(shipperObjectId))

            const AverageRatingPipeline = [
                { $match: { "to.id": new mongoose.Types.ObjectId(transporterId) } },
                {
                    $group: {
                        _id: "$to.id",
                        avgRating: { $avg: "$rating" },
                    }
                }
            ]
            const averageRatingResult = await this._reviewRatingRepositories.aggregate(AverageRatingPipeline);
            const averageRating = averageRatingResult[0]?.avgRating ?? 0;

            let profileImageUrl = '';
            if (transporter?.profileImage) {
                try {
                    profileImageUrl = await getPresignedDownloadUrl(transporter.profileImage) ?? '';
                } catch (error) {
                    console.error("Error generating presigned URL:", error);
                }
            }

            const mappedTransporter: TransporterForShipperDTO = {
                _id: transporter._id as string,
                transporterName: transporter.transporterName,
                email: transporter.email,
                profileImage: profileImageUrl,
                followers: transporter.followers?.map((f: any) => f.toString()) ?? [],
                followings: transporter.followings?.map((f: any) => f.toString()) ?? []
            };

            const reviews: ReviewForShipperDTO[] = await Promise.all(
                rawReviews.map(async (review: any) => {
                    let profileImageUrl = '';
                    if (review.from?.id?.profileImage) {
                        try {
                            profileImageUrl = await getPresignedDownloadUrl(review.from.id.profileImage) ?? '';
                        } catch (error) {
                            console.error("Error generating presigned URL for review profileImage:", error);
                        }
                    }

                    return {
                        _id: review._id,
                        from: {
                            id: {
                                _id: review.from.id._id.toString(),
                                shipperName: review.from.id.shipperName,
                                profileImage: profileImageUrl
                            },
                            role: review.from.role
                        },
                        to: {
                            id: review.to.id.toString(),
                            role: review.to.role
                        },
                        rating: review.rating,
                        review: review.review,
                        createdAt: review.createdAt
                    }
                })
            );

            return { transporterData: mappedTransporter, isFollow: isFollow, truckCount: trucks, tripsCount: trips, reviews: reviews, averageRating: averageRating, isReview };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async followTransporter(shipperId: string, tranpsorterId: string): Promise<{ success: boolean; transporterData: TransporterForShipperDTO; isFollow: boolean; }> {
        try {
            const updateTransporter = await this._transporterRepositories.follow(tranpsorterId, 'followers', shipperId);

            if (!updateTransporter) {
                throw new Error('Transporter not found or Update Failed');
            }

            const updateShipper = await this._shipperRepositories.follow(shipperId, 'followings', tranpsorterId);

            if (!updateShipper) {
                throw new Error('Shipper not found or Update Failed');
            }

            await this._notificationRepository.createNotification({
                userId: tranpsorterId,
                userType: 'transporter',
                title: 'New Follower',
                message: `${updateShipper.shipperName} has started following you. Check your followers list to connect.`
            });

            const isFollow = updateTransporter.followers?.includes(shipperId) ?? false;

            // Get presigned profile image
            let profileImageUrl = '';
            if (updateTransporter.profileImage) {
                try {
                    profileImageUrl = await getPresignedDownloadUrl(updateTransporter.profileImage) ?? '';
                } catch (error) {
                    console.error("Error generating presigned URL for transporter profile:", error);
                }
            }

            const transporterData: TransporterForShipperDTO = {
                _id: updateTransporter._id as string,
                transporterName: updateTransporter.transporterName,
                email: updateTransporter.email,
                profileImage: profileImageUrl,
                followers: updateTransporter.followers?.map((id: any) => id.toString()) ?? [],
                followings: updateTransporter.followings?.map((id: any) => id.toString()) ?? []
            };

            return { success: true, transporterData, isFollow };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async unFollowTransporter(shipperId: string, transporterId: string): Promise<{ success: boolean; transporterData: TransporterForShipperDTO; isFollow: boolean; }> {
        try {
            const updateTransporter = await this._transporterRepositories.unFollow(transporterId, 'followers', shipperId);

            if (!updateTransporter) {
                throw new Error('Transporter not found or Update failed');
            }

            const updateShipper = await this._shipperRepositories.unFollow(shipperId, 'followings', transporterId);

            if (!updateShipper) {
                throw new Error('Shipper not found or Update failed');
            }

            const isFollow = updateTransporter.followers?.includes(shipperId) ?? false;

            // Generate presigned URL for profileImage if exists
            let profileImageUrl = '';
            if (updateTransporter.profileImage) {
                try {
                    profileImageUrl = await getPresignedDownloadUrl(updateTransporter.profileImage) ?? '';
                } catch (error) {
                    console.error("Error generating presigned URL for transporter profile:", error);
                }
            }

            const transporterData: TransporterForShipperDTO = {
                _id: updateTransporter._id as string,
                transporterName: updateTransporter.transporterName,
                email: updateTransporter.email,
                profileImage: profileImageUrl,
                followers: updateTransporter.followers?.map((id: any) => id.toString()) ?? [],
                followings: updateTransporter.followings?.map((id: any) => id.toString()) ?? []
            };

            return { success: true, transporterData, isFollow };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async postReview(shipperId: string, tranpsorterId: string, rating: number, comment: string): Promise<{ success: boolean, reviewData?: IRatingReview }> {
        try {

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);
            const transporterObjectId = new mongoose.Types.ObjectId(tranpsorterId);

            const review = await this._reviewRatingRepositories.createReview({
                from: { id: shipperObjectId, role: 'Shipper' },
                to: { id: transporterObjectId, role: 'Transporter' },
                rating,
                review: comment
            })

            if (!review) {
                return { success: false }
            }

            return { success: true, reviewData: review }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporters(page: number, limit: number, search: string): Promise<{ transporters: TransporterForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const filter: any = {}

            const projection = {
                _id: 1,
                transporterName: 1,
                profileImage: 1,
                email: 1,
            }

            if (search) {
                filter.transporterName = { $regex: search, $options: "i" }
            }

            const transporters = await this._transporterRepositories.find(filter, projection, skip, limit);
            const total = await this._transporterRepositories.count({});

            const transportersDatas: TransporterForShipperDTO[] = await Promise.all(
                (transporters ?? []).map(async (transporter: any) => {
                    let profileImageUrl = '';

                    try {
                        if (transporter.profileImage) {
                            profileImageUrl = await getPresignedDownloadUrl(transporter.profileImage) ?? '';
                        }
                    } catch (error) {
                        console.error('Failed to generate profile image URL:', error);
                    }

                    return {
                        _id: transporter._id.toString(),
                        transporterName: transporter.transporterName,
                        email: transporter.email,
                        profileImage: profileImageUrl,
                        followers: transporter.followers?.map((f: any) => f.toString()) ?? [],
                        followings: transporter.followings?.map((f: any) => f.toString()) ?? [],
                    };
                })
            );

            return { transporters: transportersDatas, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrucks(page: number, limit: number): Promise<{ truckData: TruckForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const trucks = await this._truckRepositories.findWithPopulate(
                { verificationStatus: 'approved' },
                [
                    { path: 'transporterId', select: 'transporterName profileImage' }
                ],
                skip,
                limit
            )

            const mappedTrucks: TruckForShipperDTO[] = await Promise.all(
                (trucks ?? []).map(async (truck: any) => {
                    let profileImageUrl = '';

                    try {
                        if (truck.transporterId?.profileImage) {
                            profileImageUrl = await getPresignedDownloadUrl(truck.transporterId.profileImage) ?? '';
                        }
                    } catch (error) {
                        console.error('Failed to generate presigned profile image URL:', error);
                    }

                    return {
                        _id: truck._id.toString(),
                        transporterId: {
                            _id: truck.transporterId._id.toString(),
                            transporterName: truck.transporterId.transporterName,
                            profileImage: profileImageUrl,
                        },
                        truckOwnerName: truck.truckOwnerName,
                        truckType: truck.truckType,
                        truckNo: truck.truckNo,
                        capacity: truck.capacity,
                        tyres: truck.tyres,
                        currentLocation: truck.currentLocation,
                        operatingStates: truck.operatingStates,
                    };
                })
            );

            const total = await this._truckRepositories.count({ verificationStatus: 'approved' })
            return { truckData: mappedTrucks, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShipperPlans(): Promise<{ shipperPlans: {}; }> {
        try {

            return { shipperPlans: SHIPPER_SUBSCRIPTION_PLAN }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async subscriptionCheckoutSession(shipperId: string, planId: string): Promise<{ success: boolean; sessionId?: string; message: string }> {
        try {

            const plan = SHIPPER_SUBSCRIPTION_PLAN.find(p => p.id === planId);
            if (!plan) return { success: false, message: 'Invalid Plan' };

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const existing = await this._shipperPaymentRepositories.findOne({
                planId: planId,
                shipperId: shipperId,
                createdAt: { $gte: fiveMinutesAgo }
            })

            if (existing) {
                return { success: false, message: 'You recently initiated a payment for this plan. Please wait a few minutes.' };
            }

            const shipper = await this._shipperRepositories.findById(shipperId);
            if (!shipper) return { success: false, message: 'Shipper not found' }

            const amount = Number(plan.price)

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
                            unit_amount: Math.round(amount * 100)
                        },
                        quantity: 1
                    }
                ],
                success_url: `${config.frontEndUrl}/shipper/subscription-success?session_id={CHECKOUT_SESSION_ID}&planId=${plan.id}`,
                cancel_url: `${config.frontEndUrl}/shipper/subscription-failed`,
            });

            const shipperObjectId = new mongoose.Types.ObjectId(shipperId)

            await this._shipperPaymentRepositories.createPayment({
                transactionId: session.id,
                shipperId: shipperObjectId,
                planId: planId,
                paymentType: 'subscription',
                amount: amount,
                transactionType: 'debit',
            })

            await this._adminPaymentRepository.createAdminPaymentHistory({
                transactionId: session.id,
                userType: 'shipper',
                userId: shipperId,
                amount: amount,
                transactionType: 'credit',
                paymentFor: 'subscription',
                subscriptionId: planId,
            })

            return { success: true, message: 'Payment Created', sessionId: session.id }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async handleSubscriptionSuccess(shipperId: string, sessionId: string, planId: string): Promise<{ success: boolean; message: string; planName: string; endDate: Date }> {
        try {

            const plan = SHIPPER_SUBSCRIPTION_PLAN.find(p => p.id === planId);
            if (!planId || !plan) {
                throw new Error('Plan not found in metadata');
            }

            const planDuration = plan.PlanDurationInDays ? plan.PlanDurationInDays : 1;
            const startDate = new Date();
            const endDate = new Date(startDate);

            endDate.setDate(endDate.getDate() + planDuration);

            const amount = Number(plan.price)

            const updateShipper = await this._shipperRepositories.updateShipperById(shipperId, {
                subscription: {
                    planId: planId,
                    planName: plan.name,
                    status: 'active',
                    startDate,
                    endDate,
                    isActive: true,
                    paidAmount: amount,
                    createdAt: new Date()
                }
            });

            await this._shipperPaymentRepositories.findShipperPaymentByTransactionIdandUpdate(sessionId, 'success');
            await this._adminPaymentRepository.updateBytransactionId(sessionId, 'success')
            await this._notificationRepository.createNotification({
                userId: shipperId,
                userType: 'shipper',
                title: 'New Plan',
                message: `${plan.name} has activated`
            })

            return { success: true, message: 'Subscription verified and saved', planName: plan.name, endDate: endDate };

        } catch (error) {
            console.error('Error in verifying subscription:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async checkExpiredSubscriptions(): Promise<void> {
        try {

            const today = new Date();
            const result = await this._shipperRepositories.expiredSubscriptionUpdate(today);

            console.log(`Subscription expired: ${result.modifiedCount}`);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateLoad(formData: Partial<ILoad>): Promise<{ success: boolean; message: string; updateData?: LoadForShipperDTO; }> {
        try {

            const { pickupCoordinates, dropCoordinates, _id, shipperId, pickupLocation, dropLocation, material, quantity, scheduledDate,
                length, truckType, transportationRent, height, breadth, descriptions
            } = formData;

            const loadId = formData._id as string;

            function deg2rad(deg: number): number {
                return deg * (Math.PI / 180);
            }

            function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {

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
                return d;
            }

            let distances = 0;

            if (
                pickupCoordinates?.latitude !== undefined && pickupCoordinates?.longitude !== undefined &&
                dropCoordinates?.latitude !== undefined && dropCoordinates?.longitude !== undefined) {

                distances = getDistanceFromLatLonInKm(
                    pickupCoordinates.latitude,
                    pickupCoordinates.longitude,
                    dropCoordinates.latitude,
                    dropCoordinates.longitude
                );

                console.log("Distance (km):", distances);
            }


            const updated = await this._loadRepositories.updateById(loadId, {
                pickupLocation,
                dropLocation,
                material,
                quantity,
                scheduledDate,
                length,
                transportationRent,
                truckType,
                height,
                breadth,
                descriptions,
                pickupCoordinates,
                dropCoordinates,
                distanceInKm: distances
            })

            if (!updated) return { success: false, message: 'Load not updated' }

            const updateData: LoadForShipperDTO = {
                _id: updated._id as string,
                pickupLocation: updated.pickupLocation,
                dropLocation: updated.dropLocation,
                material: updated.material,
                quantity: updated.quantity,
                length: updated.length ?? '',
                truckType: updated.truckType,
                transportationRent: updated.transportationRent,
                height: updated.height ?? '',
                breadth: updated.breadth ?? '',
                status: updated.status,
                scheduledDate: updated.scheduledDate,
                createdAt: updated.createdAt,
                descriptions: updated.descriptions ?? '',
                pickupCoordinates: updated.pickupCoordinates,
                dropCoordinates: updated.dropCoordinates
            };


            return { success: true, message: 'Load updated Successfully', updateData: updateData };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async deleteLoadByLoadId(loadId: string): Promise<{ success: boolean; message: string; loadData?: LoadForShipperDTO; }> {
        try {
            if (!loadId) return { success: false, message: 'LoadId not found' };

            const deleteLoad = await this._loadRepositories.deleteById(loadId);
            if (!deleteLoad) return { success: false, message: 'Load not found or already deleted' };

            const loadData: LoadForShipperDTO = {
                _id: deleteLoad._id as string,
                pickupLocation: deleteLoad.pickupLocation,
                dropLocation: deleteLoad.dropLocation,
                material: deleteLoad.material,
                quantity: deleteLoad.quantity,
                length: deleteLoad.length ?? '',
                truckType: deleteLoad.truckType,
                transportationRent: deleteLoad.transportationRent,
                height: deleteLoad.height ?? '',
                breadth: deleteLoad.breadth ?? '',
                status: deleteLoad.status,
                scheduledDate: deleteLoad.scheduledDate,
                createdAt: deleteLoad.createdAt,
                descriptions: deleteLoad.descriptions ?? '',
                pickupCoordinates: {
                    latitude: deleteLoad.pickupCoordinates.latitude,
                    longitude: deleteLoad.pickupCoordinates.longitude
                },
                dropCoordinates: {
                    latitude: deleteLoad.dropCoordinates.latitude,
                    longitude: deleteLoad.dropCoordinates.longitude
                }
            };

            return { success: true, message: 'Load Deleted', loadData };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async startChat(shipperId: string, transporterId: string): Promise<{ success: boolean; chatData: IChat; }> {
        try {

            let chat = await this._chatRepository.findOne({ transporterId, shipperId });

            const transporterObjectId = new mongoose.Types.ObjectId(transporterId);
            const shipperObjectId = new mongoose.Types.ObjectId(shipperId);

            if (!chat) {
                chat = await this._chatRepository.createChat({ transporterId: transporterObjectId, shipperId: shipperObjectId })
            }

            return { success: true, chatData: chat }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchChats(shipperId: string): Promise<ChatForShipperDTO[] | null> {
        try {
            const chats = await this._chatRepository.findWithPopulate(
                { shipperId },
                [
                    { path: 'transporterId', select: '_id transporterName profileImage' }
                ]
            );

            const updatedChats: ChatForShipperDTO[] = await Promise.all(
                chats.map(async (chat: any) => {
                    let unreadCount = await this._messageRepository.count({
                        chatId: chat._id,
                        receiverId: shipperId,
                        isRead: false
                    });

                    let profileImageUrl = '';
                    try {
                        if (chat.transporterId?.profileImage) {
                            profileImageUrl = await getPresignedDownloadUrl(chat.transporterId.profileImage) ?? '';
                        }
                    } catch (err) {
                        console.error('Failed to generate pre-signed profileImage URL:', err);
                    }

                    return {
                        _id: chat._id.toString(),
                        shipperId: chat.shipperId.toString(),
                        lastMessage: chat.lastMessage ?? null,
                        unreadCount: unreadCount,
                        transporterId: {
                            _id: chat.transporterId._id.toString(),
                            transporterName: chat.transporterId.transporterName,
                            profileImage: profileImageUrl,
                        }
                    };
                })
            );

            return updatedChats;
        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error));
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

    async sendMessage(shipperId: string, chatId: string, transporterId: string, content: string): Promise<{ success: boolean; messageData?: IMessage; }> {
        try {

            const chatObjectId = new mongoose.Types.ObjectId(chatId)

            const message = await this._messageRepository.createMessage({
                chatId: chatObjectId,
                senderId: shipperId,
                receiverId: transporterId,
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

    async upateMessageAsRead(chatId: string, shipperId: string): Promise<{ success: boolean; }> {
        try {

            await this._messageRepository.updateMany({ chatId, receiverId: shipperId, isRead: false }, { isRead: true })
            return { success: true }


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchNotifications(shipperId: string, status: string): Promise<NotificationForShipper[]> {
        try {
            const filter: any = {
                userId: shipperId,
                userType: 'shipper'
            };

            if (status !== 'all') {
                filter.isRead = status === 'unread' ? false : true;
            }

            const response = await this._notificationRepository.find(filter, {}, 0, 0, { createdAt: -1 });

            const notifications: NotificationForShipper[] = response.map((notification) => ({
                _id: notification._id as string,
                userId: notification.userId.toString(),
                userType: notification.userType,
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
            }));

            return notifications;

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async updateNotificationAsRead(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: NotificationForShipper; }> {
        try {
            const updateData = await this._notificationRepository.updateById(notificationId, { isRead: true });
            if (!updateData) return { success: false, message: 'Notification not updated' };

            const notificationData: NotificationForShipper = {
                _id: updateData._id as string,
                userId: updateData.userId.toString(),
                userType: updateData.userType,
                title: updateData.title,
                message: updateData.message,
                isRead: updateData.isRead,
                createdAt: updateData.createdAt,
            };

            return { success: true, message: 'Mark notification as read', notificationData };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: NotificationForShipper; }> {
        try {
            const deleteData = await this._notificationRepository.deleteById(notificationId);
            if (!deleteData) return { success: false, message: 'notification not deleted' };

            const notificationData: NotificationForShipper = {
                _id: deleteData._id as string,
                userId: deleteData.userId.toString(),
                userType: deleteData.userType,
                title: deleteData.title,
                message: deleteData.message,
                isRead: deleteData.isRead,
                createdAt: deleteData.createdAt,
            };

            return { success: true, message: 'notification Deleted', notificationData };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async fetchPaymentHistory(
        shipperId: string,
        status: string,
        type: string,
        date: string,
        page: number,
        limit: number,
        search: string
    ): Promise<{
        paymentData: ShipperPaymentDTO[];
        totalPages: number;
        totalEarnings: number;
        bidPayments: number;
        subscriptionPayment: number;
        pendingAmount: number;
    }> {
        try {
            const allPayments = await this._shipperPaymentRepositories.find({ shipperId });

            const totalEarnings = allPayments
                .filter(p => p.paymentStatus === 'success')
                .reduce((sum, p) => sum + p.amount, 0);

            const pendingAmount = allPayments
                .filter(p => p.paymentStatus === 'pending')
                .reduce((sum, p) => sum + p.amount, 0);

            const bidPayments = allPayments.filter(p => p.paymentType === 'bid').length;
            const subscriptionPayment = allPayments.filter(p => p.paymentType === 'subscription').length;

            const skip = (page - 1) * limit;

            const filter: any = { shipperId };

            if (status !== 'all') {
                filter.paymentStatus = status;
            }

            if (type !== 'all') {
                filter.paymentType = type;
            }

            const now = new Date();
            let fromDate: Date | null = null;

            if (date === 'today') {
                fromDate = startOfDay(now);
            } else if (date === 'week') {
                fromDate = subDays(now, 7);
            } else if (date === 'month') {
                fromDate = subDays(now, 30);
            }

            if (date !== 'all' && fromDate) {
                filter.createdAt = { $gte: fromDate };
            }

            if (search) {
                filter.transactionId = { $regex: search, $options: "i" };
            }

            const payment = await this._shipperPaymentRepositories.find(filter, {}, skip, limit, { createdAt: -1 });
            const totalPayment = await this._shipperPaymentRepositories.count(filter);

            const paymentData: ShipperPaymentDTO[] = payment.map(p => ({
                _id: p._id as string,
                transactionId: p.transactionId || '',
                bidId: p.bidId?.toString() || '',
                planId: p.planId?.toString() || '',
                shipperId: p.shipperId.toString(),
                paymentType: p.paymentType || '', 
                amount: p.amount || 0,
                paymentStatus: p.paymentStatus || '',
                createdAt: p.createdAt || '',
                transactionType: p.transactionType || ''
            }));

            return {
                paymentData,
                totalPages: Math.ceil(totalPayment / limit),
                totalEarnings,
                bidPayments,
                subscriptionPayment,
                pendingAmount
            };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }


    async checkAndRefundExpiredBids(): Promise<{ success: boolean; }> {
        try {

            const fourtyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);


            const expiredbids = await this._bidRepositories.find(
                {
                    shipperPayment: true,
                    transporterPayment: false,
                    status: 'accepted',
                    createAt: { $lt: fourtyEightHoursAgo }

                }
            )

            for (const bid of expiredbids) {

                const payment = await this._shipperPaymentRepositories.findOne(
                    {
                        bidId: bid._id,
                        refundStatus: 'none',
                        paymentStatus: 'success'
                    }
                );

                if (!payment || !payment.paymentIntentId) continue;

                try {

                    const refund = await stripe.refunds.create({
                        payment_intent: payment.paymentIntentId,
                    })

                    await this._shipperPaymentRepositories.updateById(payment._id as string, {
                        refundId: refund.id,
                        refundStatus: 'refunded',
                        transactionType: 'credit'
                    })

                    const shipperId = String(payment.shipperId)
                    const bidObjectId = new mongoose.Types.ObjectId(bid._id as string)

                    await this._adminPaymentRepository.createAdminPaymentHistory({
                        transactionId: payment.transactionId,
                        userType: 'shipper',
                        userId: shipperId,
                        amount: payment.amount,
                        transactionType: 'debit',
                        paymentFor: 'refund',
                        bidId: bidObjectId,
                        paymentStatus: 'success'
                    })

                    await this._bidRepositories.updateBids({ _id: bid._id }, { status: 'expired' });

                    await this._notificationRepository.createNotification({
                        userId: shipperId,
                        userType: 'shipper',
                        title: 'Refund',
                        message: 'Refund processed because transporter didn’t start trip.'
                    })

                } catch (error) {
                    console.error(`Refund failed for bid ${bid._id}:`, error)
                }
            }

            return { success: true }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async expireInActiveLoads(): Promise<void> {
        try {

            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            // const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

            const staleLoads = await this._loadRepositories.find(
                { status: 'active', createdAt: { $lt: threeDaysAgo } },
            );

            for (const load of staleLoads) {

                // const activeBid = await this._bidRepositories.find({ loadId: load._id });

                const acceptedBid = await this._bidRepositories.find({ loadId: load._id, status: 'accepted' });

                if (acceptedBid.length === 0) {
                    await this._loadRepositories.updateById(load._id as string, { status: 'expired' });

                    const bids = await this._bidRepositories.find({ loadId: load.id });

                    for (let bid of bids) {
                        if (bid.status === 'requested') {
                            await this._bidRepositories.updateById(bid._id as string, { status: 'expired' })
                        }
                    }

                    console.log('expired log', load._id);

                }
            }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async findUnReadNotificationCount(shipperId: string): Promise<number | undefined> {
        try {

            const counts = await this._notificationRepository.count({ userType: 'shipper', userId: shipperId, isRead: false });
            console.log(counts, 'counts');

            return counts

        } catch (error) {
            console.error(error)
        }
    }


}