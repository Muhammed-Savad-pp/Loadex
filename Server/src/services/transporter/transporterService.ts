import { configDotenv } from 'dotenv';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, getPresignedDownloadUrl } from "../../config/s3Config";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITransporterService } from "../../interface/transporter/ITransporterService";
import mongoose from "mongoose";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { IBidRepository } from "../../repositories/interface/IBidRepository";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import Stripe from "stripe";
import { ITransporterPaymentRepository } from "../../repositories/interface/ITransporterPayment";
import { ITripRepository } from "../../repositories/interface/ITripRepository";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { IReviewRatingRepository } from "../../repositories/interface/IReviewRatingRepository";
import { TRANSPORTER_SUBSCRIPTION_PLANS } from "../../config/transporterPlans";
import { startOfDay, subDays } from "date-fns";
import { IChat } from "../../models/Chat";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { IMessage } from "../../models/Message";
import { IMessageRepository } from "../../repositories/interface/IMessageRepository";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { ITransporterWalletRepository } from "../../repositories/interface/ITransporterWalletRepository";
import { IAdminPaymentRepository } from "../../repositories/interface/IAdminPaymentRepository";
import { ShipperForTransporterDirectoryDTO, ShipperForTransporterDTO, TransporterDTO, TransporterPaymentDTO } from "../../dtos/transporter/transporter.dto";
import config from "../../config";
import { ReviewForTransporter } from "../../dtos/reviews/review.dto";
import { NotificationForTransporterDTO } from "../../dtos/notifications/notification.dto";
import { WalletForTransporterDTO } from "../../dtos/wallet/wallet.dto";
import { ChatForTransporterDTO } from "../../dtos/chat/chat.dto";

configDotenv()

const stripe = new Stripe(config.stripeSecretKey, {
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
        const transporter = await this._transporterRepository.findById(id)
        if (!transporter) {
            return { success: false, message: 'Transporter not signUp' }
        }

        return { success: true, message: 'Transporter verification Status', verificationStatus: transporter.verificationStatus }
    }

    async getProfileData(id: string): Promise<{ success: boolean, message: string, transporterData?: TransporterDTO }> {
        const transporterDatas = await this._transporterRepository.findById(id);
        if (!transporterDatas) {
            return { success: false, message: 'No Transporter' }
        }

        const aadhaarFrontUrl = transporterDatas.aadhaarFront ? await getPresignedDownloadUrl(transporterDatas.aadhaarFront) : '';
        const aadhaarBackUrl = transporterDatas.aadhaarBack ? await getPresignedDownloadUrl(transporterDatas.aadhaarBack) : '';
        const profileIamgeUrl = transporterDatas.profileImage ? await getPresignedDownloadUrl(transporterDatas.profileImage) : ''

        transporterDatas.aadhaarFront = aadhaarFrontUrl;
        transporterDatas.aadhaarBack = aadhaarBackUrl;
        transporterDatas.profileImage = profileIamgeUrl

        return { success: true, message: 'success', transporterData: TransporterDTO.from(transporterDatas) }
    }

    async kycVerification(transporterId: string, panNumber: string, aadhaarFront?: Express.Multer.File, aadhaarBack?: Express.Multer.File): Promise<{ success: boolean, message: string, transporterData?: Partial<TransporterDTO> }> {
        try {

            let aadhaarFrontUrl: string | undefined;
            let aadhaarBackUrl: string | undefined
            const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {

                const key = `loadex/${folder}/transporter/${Date.now()}_${file.originalname}`;
                const command = new PutObjectCommand({
                    Bucket: config.awsBucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                });

                await s3.send(command)
                return key
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

    async bidCheckoutSession(bidID: string): Promise<{ success: boolean; message: string; sessionId?: string; }> {
        try {
            const bidObjectId = new mongoose.Types.ObjectId(bidID);
            const existingPayment = await this._transporterPaymentRepository.findOne({ bidId: bidObjectId });
            if (existingPayment && (existingPayment.paymentStatus === 'success' || existingPayment.paymentStatus === 'pending')) {
                return { success: false, message: 'Payment is already in progress or completed for this bid.' };
            }

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
                success_url: `${config.frontEndUrl}/transporter/success?transactionId={CHECKOUT_SESSION_ID}`,
                cancel_url: `${config.frontEndUrl}/transporter/failed?transactionId={CHECKOUT_SESSION_ID}`,
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
                        await this._loadRepository.findLoadByIdAndUpdate(String(bid.loadId), { status: 'in-Transit' })
                        await this._truckRepository.updateTruckById(String(bid.truckId), { status: 'in-transit' });
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

    async updateProfile(transporterId: string, transporterName: string, phone: string, profileImage: Express.Multer.File): Promise<{ success: boolean; message: string; transporterData?: TransporterDTO; }> {
        try {
            let profileImagekey: string | undefined;
            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const key = `loadex/${folder}/transporter/${Date.now()}_${file.originalname}`
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
                profileImagekey = await uploadToS3(profileImage, 'profileImage')
            }
            const updateTransporter = await this._transporterRepository.updateTransporterById(transporterId,
                {
                    transporterName: transporterName,
                    phone: phone,
                    profileImage: profileImagekey
                }
            )

            if (!updateTransporter) {
                return { success: false, message: 'Profile Not Updated' }
            }

            const aadhaarFrontUrl = updateTransporter.aadhaarFront ? await getPresignedDownloadUrl(updateTransporter.aadhaarFront) : '';
            const aadhaarBackUrl = updateTransporter.aadhaarBack ? await getPresignedDownloadUrl(updateTransporter.aadhaarBack) : '';
            const profileIamgeUrl = updateTransporter.profileImage ? await getPresignedDownloadUrl(updateTransporter.profileImage) : ''

            updateTransporter.aadhaarFront = aadhaarFrontUrl;
            updateTransporter.aadhaarBack = aadhaarBackUrl;
            updateTransporter.profileImage = profileIamgeUrl

            return { success: true, message: 'Updated SuccessFully', transporterData: TransporterDTO.from(updateTransporter) };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShipperProfileData(transporterId: string, shipperId: string): Promise<{ shipperData: ShipperForTransporterDTO, isFollow: boolean, loadsCount: number, tripsCount: number, reviews: ReviewForTransporter[]; averageRating: number, isReview: boolean }> {
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
            let profileImageUrl = shipper.profileImage ? await getPresignedDownloadUrl(shipper.profileImage) : '';
            shipper.profileImage = profileImageUrl;

            const reviewDatos: ReviewForTransporter[] = await Promise.all(
                reviews.map(async (review) => {
                    const populatedFromId = review.from.id as unknown as {
                        _id: mongoose.Types.ObjectId;
                        transporterName: string;
                        profileImage?: string;
                    };

                    let profileImageUrl = '';
                    if (populatedFromId.profileImage) {
                        profileImageUrl = await getPresignedDownloadUrl(populatedFromId.profileImage) ?? '';
                    }
                    return {
                        _id: review._id as string,
                        from: {
                            id: {
                                _id: populatedFromId._id.toString(),
                                transporterName: populatedFromId.transporterName,
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
                    };
                })
            );

            return { shipperData: ShipperForTransporterDTO.from(shipper), isFollow: isFollow, tripsCount: tripsCompletedcount, loadsCount: loadscount, reviews: reviewDatos, averageRating: averageRating, isReview: isReview };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async followShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: ShipperForTransporterDTO; isFollow: boolean }> {
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

            let profileImageUrl = updateShipper.profileImage ? await getPresignedDownloadUrl(updateShipper.profileImage) : '';
            updateShipper.profileImage = profileImageUrl;

            return { success: true, shipperData: ShipperForTransporterDTO.from(updateShipper), isFollow: isFollow };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async unFollowShipper(transporterId: string, shipperId: string): Promise<{ success: boolean; shipperData: ShipperForTransporterDTO; isFollow: boolean; }> {
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

            let profileImageUrl = updateShipper.profileImage ? await getPresignedDownloadUrl(updateShipper.profileImage) : '';
            updateShipper.profileImage = profileImageUrl;

            return { success: true, shipperData: ShipperForTransporterDTO.from(updateShipper), isFollow: isFollow };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async postReviews(transporterId: string, shipperId: string, rating: number, comment: string): Promise<{ success: boolean; reviewData?: ReviewForTransporter; }> {
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

            const populatedFromId = review.from.id as unknown as {
                _id: mongoose.Types.ObjectId;
                transporterName: string;
                profileImage: string;
            };

            const reviewDatos: ReviewForTransporter = {
                _id: review._id as string,
                from: {
                    id: {
                        _id: populatedFromId._id.toString(),
                        transporterName: populatedFromId.transporterName,
                        profileImage: populatedFromId.profileImage
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
            };

            return { success: true, reviewData: reviewDatos };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchShippers(page: number, limit: number, search: string): Promise<{ shipper: ShipperForTransporterDirectoryDTO[] | null, totalPages: number, totalItems: number }> {
        try {
            const skip = (page - 1) * limit;
            const projection = {
                _id: 1,
                profileImage: 1,
                shipperName: 1,
                companyName: 1,
                email: 1
            }

            const filter: any = {}

            if (search) {
                filter.shipperName = { $regex: search, $options: "i" }
            }

            const shippers = await this._shipperRepository.find(filter, projection, skip, limit)
            const total = await this._shipperRepository.count(filter);
            const newShippers = await Promise.all(
                shippers.map(async (shipper) => {
                    const plainShipper = shipper.toObject();

                    const profileIamgeUrl = plainShipper.profileImage ? await getPresignedDownloadUrl(plainShipper.profileImage) : '';
                    plainShipper.profileImage = profileIamgeUrl;
                    return ShipperForTransporterDirectoryDTO.from(plainShipper)
                })
            )

            return { shipper: newShippers, totalPages: Math.ceil(total / limit), totalItems: total }
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTransporterFollowersandFollowings(transporterId: string, status: string, search: string, page: number, limit: number): Promise<{ datas: any[], followersCount: number, followingsCount: number, totalPages: number }> {
        try {
            const skip = (page - 1) * limit;
            const transporter = await this._transporterRepository.findById(transporterId);

            if (!transporter) {
                throw new Error('Transporter not found');
            }

            const projection = {
                _id: 1,
                shipperName: 1,
                profileImage: 1,
                followers: 1,
                followings: 1
            };

            const followersLength = transporter.followers?.length ?? 0;
            const followingsLength = transporter.followings?.length ?? 0;

            let cleanedResult: any[] = [];
            let total = 0;
            const validIds = (ids: string[]) => ids?.filter(id => id && id.trim() !== "");

            if (status === 'followers') {
                const followersIds = validIds(transporter?.followers ?? []);
                total = followersIds.length;

                if (!followersIds.length) return {
                    datas: [],
                    followersCount: followersLength,
                    followingsCount: followingsLength,
                    totalPages: 0
                };

                const filter: any = {
                    _id: { $in: followersIds }
                };
                if (search) {
                    filter.shipperName = { $regex: search, $options: 'i' };
                }

                const shippers = await this._shipperRepository.find(filter, projection, skip, limit);
                const result = await Promise.all(shippers.map(async shipper => {
                    const presignedUrl = shipper.profileImage
                        ? await getPresignedDownloadUrl(shipper.profileImage)
                        : null;
                    return {
                        ...shipper,
                        profileImage: presignedUrl,
                        followsBack: shipper.followers?.includes(transporterId)
                    };
                }));

                cleanedResult = result.map(({ _doc, ...rest }: any) => ({
                    ..._doc,
                    ...rest,
                }));
            } else {
                const followingsIds = validIds(transporter?.followings ?? []);
                total = followingsIds.length;

                if (!followingsIds.length) return {
                    datas: [],
                    followersCount: followersLength,
                    followingsCount: followingsLength,
                    totalPages: 0
                };

                const filter: any = {
                    _id: { $in: followingsIds }
                };
                if (search) {
                    filter.shipperName = { $regex: search, $options: 'i' };
                }

                const followingShipper = await this._shipperRepository.find(filter, projection, skip, limit);
                const result = await Promise.all(followingShipper.map(async shipper => {
                    const presignedUrl = shipper.profileImage
                        ? await getPresignedDownloadUrl(shipper.profileImage)
                        : null;
                    return {
                        ...shipper,
                        profileImage: presignedUrl,
                        followsBack: shipper.followers?.includes(transporterId)
                    };
                }));

                cleanedResult = result.map(({ _doc, ...rest }: any) => ({
                    ..._doc,
                    ...rest,
                }));
            }

            return {
                datas: cleanedResult,
                followersCount: followersLength,
                followingsCount: followingsLength,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error));
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

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existing = await this._transporterPaymentRepository.findOne({
                planId: planId,
                transporterId: transporterId,
                createdAt: { $gte: fiveMinutesAgo }
            })

            if (existing) {
                return { success: false, message: 'You recently initiated a payment for this plan. Please wait a few minutes.' };
            }

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
                success_url: `${config.frontEndUrl}/transporter/subscription-success?session_id={CHECKOUT_SESSION_ID}&planId=${plan.id}`,
                cancel_url: `${config.frontEndUrl}/transporter/subscription-failed`,
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
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchPaymentHistory(transporterId: string, status: string, type: string, date: string, page: number, limit: number):
        Promise<{ paymentData: TransporterPaymentDTO[], totalPages: number, totalEarnings: number, bidPayments: number, subscriptionPayment: number, pendingAmount: number }> {
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
 
            return { paymentData: TransporterPaymentDTO.fromList(payment), totalPages: Math.ceil(totalPayment / limit), totalEarnings, bidPayments, subscriptionPayment, pendingAmount };
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

    async fetchChats(transporterId: string): Promise<ChatForTransporterDTO[]> {
        try {
            let chats = await this._chatRepository.findWithPopulate(
                { transporterId: transporterId },
                [
                    { path: 'shipperId', select: '_id shipperName profileImage' },
                ]
            )

            const updatedChats: ChatForTransporterDTO[] = await Promise.all(
                chats.map(async (chat) => {
                    const unreadCount = await this._messageRepository.count({
                        chatId: chat._id,
                        receiverId: transporterId,
                        isRead: false,
                    });
                    const chatObj = chat.toObject();
                    let profileImageUrl = '';
                    if (chatObj.shipperId?.profileImage) {
                        profileImageUrl = await getPresignedDownloadUrl(chatObj.shipperId.profileImage) ?? '';
                    }
                    return {
                        _id: chatObj._id.toString(),
                        transporterId: chatObj.transporterId.toString(),
                        shipperId: {
                            _id: chatObj.shipperId._id.toString(),
                            shipperName: chatObj.shipperId.shipperName,
                            profileImage: profileImageUrl
                        },
                        lastMessage: chatObj.lastMessage ?? null,
                        unreadCount
                    };
                })
            );

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

    async fetchNotifications(transporterId: string, status: string): Promise<NotificationForTransporterDTO[]> {
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
            const notificationDatos: NotificationForTransporterDTO[] = response.map((notification) => ({
                _id: notification._id as string,
                userId: notification.userId,
                userType: notification.userType ?? 'transporter',
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
            }))

            return notificationDatos;
        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async updateNotificationAsRead(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: NotificationForTransporterDTO; }> {
        try {
            const updateData = await this._notificationRepository.updateById(notificationId, { isRead: true });
            if (!updateData) return { success: false, message: 'Notification not updated' };

            const notificationData: NotificationForTransporterDTO = {
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


    async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string; notificationData?: NotificationForTransporterDTO; }> {
        try {
            const deleteData = await this._notificationRepository.deleteById(notificationId);
            if (!deleteData) return { success: false, message: 'Notification not deleted' };

            const notificationData: NotificationForTransporterDTO = {
                _id: deleteData._id as string,
                userId: deleteData.userId.toString(),
                userType: deleteData.userType,
                title: deleteData.title,
                message: deleteData.message,
                isRead: deleteData.isRead,
                createdAt: deleteData.createdAt,
            };

            return { success: true, message: 'Notification deleted', notificationData };

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async fetchWalletData(tranpsorterId: string): Promise<WalletForTransporterDTO | null> {
        try {
            const walletData = await this._transporterWalletRepository.findOne({ transporterId: tranpsorterId });
            const walletDatos: WalletForTransporterDTO = {
                _id: walletData?._id as string,
                balance: walletData?.balance ?? 0
            }

            return walletDatos
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
}