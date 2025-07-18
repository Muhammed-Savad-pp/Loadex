import { IAdminService } from "../../interface/admin/IAdminService";
import { configDotenv } from "dotenv";
import { generateAcessToken, generateRefreshToken } from "../../utils/Token.utils";
import { ITransporter } from "../../models/TransporterModel";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipper } from "../../models/ShipperModel";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { ITruck } from "../../models/TruckModel";
import { ILoad } from "../../models/LoadModel";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { ITripRepository } from "../../repositories/interface/ITripRepository";
import { ITransporterWalletRepository } from "../../repositories/interface/ITransporterWalletRepository";
import { ITrip } from "../../models/TripModel";
import { ITransporterPaymentRepository } from "../../repositories/interface/ITransporterPayment";
import mongoose from "mongoose";
import { IAdminPaymentRepository } from "../../repositories/interface/IAdminPaymentRepository";
import { AdminPaymentDTO } from "../../dtos/admin/admin.payment.history.dto";
import config from "../../config";
import { endOfMonth, startOfMonth } from "date-fns";
import { TransporterForAdminDTO } from "../../dtos/transporter/transporter.dto";
import { getPresignedDownloadUrl } from "../../config/s3Config";

configDotenv()


export class AdminService implements IAdminService {

    constructor(
        private _transporterRepository: ITransporterRepository,
        private _shipperRepository: IShipperRepository,
        private _loadRepository: ILoadRepository,
        private _truckRepository: ITruckRepository,
        private _notificationRepository: INotificationRepository,
        private _tripRepository: ITripRepository,
        private _transporterWalletRepository: ITransporterWalletRepository,
        private _transporterPaymentRepository: ITransporterPaymentRepository,
        private _adminPaymentRepository: IAdminPaymentRepository
    ) { }

    async login(email: string, passwrod: string): Promise<{ accessToken?: string, refreshToken?: string, success: boolean, message: string }> {
        try {

            if (email != config.adminEmail || passwrod != config.adminPassword) {
                console.log('dasdfsdf');

                return { success: false, message: 'Invalid Crendential' }

            }

            const accessToken = await generateAcessToken(email as string, 'admin');
            const refreshToken = await generateRefreshToken(email as string, 'admin')

            return { accessToken: accessToken, refreshToken: refreshToken, success: true, message: 'Admin login successFully' }


        } catch (error) {
            console.log(error)
            throw new Error(error instanceof Error ? error.message : 'Unknow Error')
        }
    }

    async getTransporter(search: string, page: number, limit: number): Promise<{ transporterData: TransporterForAdminDTO[], totalPages: number }> {
        try {

            const skip = (page - 1) * limit;
            const filter: any = {};

            console.log(search, 'search')
            if (search) {
                filter.transporterName = { $regex: search, $options: 'i' }
            }

            const transporters = await this._transporterRepository.find(filter, {}, skip, limit);
            const total = await this._transporterRepository.count(filter);

            const transporterData: TransporterForAdminDTO[] = await Promise.all(
                transporters.map(async (transporter: any) => {

                    let profileImageUrl = '';
                    let aadhaarFrontUrl = '';
                    let aadhaarBackUrl = '';

                    if (transporter.profileImage) {
                        try {
                            profileImageUrl = await getPresignedDownloadUrl(transporter.profileImage) ?? '';
                        } catch (err) {
                            console.error(`Error generating presigned URL for ${transporter.profileImage}`, err);
                        }
                    }

                    if (transporter.aadhaarFront) {
                        try {
                            aadhaarFrontUrl = await getPresignedDownloadUrl(transporter.aadhaarFront) ?? ''
                        } catch (error) {
                            console.error(`Error generating presigned URL for ${transporter.aadhaarFront}`, error);
                        }
                    }

                    if (transporter.aadhaarBack) {
                        try {
                            aadhaarBackUrl = await getPresignedDownloadUrl(transporter.aadhaarBack) ?? ''
                        } catch (error) {
                            console.error(`Error generating presigned URL for ${transporter.aadhaarBack}`, error);
                        }
                    }

                    return {
                        _id: transporter._id.toString(),
                        transporterName: transporter.transporterName ?? '',
                        email: transporter.email ?? '',
                        phone: transporter.phone ?? '',
                        isBlocked: transporter.isBlocked ?? false,
                        profileImage: profileImageUrl,
                        verificationStatus: transporter.verificationStatus ?? '',
                        panNumber: transporter.panNumber ?? '',
                        aadhaarFront: aadhaarFrontUrl,
                        aadhaarBack: aadhaarBackUrl
                    };
                })
            );

            return { transporterData: transporterData, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : 'unknown error')
        }
    }

    async updateTransporterBlockandUnblock(id: string): Promise<string> {
        try {

            const transporter = await this._transporterRepository.findTransporterById(id);
            console.log(transporter, 'transport')

            if (!transporter) {
                const error: any = new Error('Transporter not found');
                error.status = HTTP_STATUS.NOT_FOUND;
                throw error
            }

            const updateTransporter = await this._transporterRepository.updateTransporterStatus(id, !transporter.isBlocked as boolean)

            return updateTransporter?.isBlocked ? 'Blocked Successfully' : 'UnblockSuccessFully'

        } catch (error: any) {
            console.log('error in updateTransporterStatus');
            throw new Error(error)
        }
    }

    async getRequestedTransporter(): Promise<TransporterForAdminDTO[]> {
        try {

            const transporters = await this._transporterRepository.getRequestedTransporter()

            const transporterData: TransporterForAdminDTO[] = await Promise.all(
                transporters.map(async (transporter: any) => {

                    let profileImageUrl = '';
                    let aadhaarFrontUrl = '';
                    let aadhaarBackUrl = '';

                    if (transporter.profileImage) {
                        try {
                            profileImageUrl = await getPresignedDownloadUrl(transporter.profileImage) ?? '';
                        } catch (err) {
                            console.error(`Error generating presigned URL for ${transporter.profileImage}`, err);
                        }
                    }

                    if (transporter.aadhaarFront) {
                        try {
                            aadhaarFrontUrl = await getPresignedDownloadUrl(transporter.aadhaarFront) ?? ''
                        } catch (error) {
                            console.error(`Error generating presigned URL for ${transporter.aadhaarFront}`, error);
                        }
                    }

                    if (transporter.aadhaarBack) {
                        try {
                            aadhaarBackUrl = await getPresignedDownloadUrl(transporter.aadhaarBack) ?? ''
                        } catch (error) {
                            console.error(`Error generating presigned URL for ${transporter.aadhaarBack}`, error);
                        }
                    }

                    return {
                        _id: transporter._id.toString(),
                        transporterName: transporter.transporterName ?? '',
                        email: transporter.email ?? '',
                        phone: transporter.phone ?? '',
                        isBlocked: transporter.isBlocked ?? false,
                        profileImage: profileImageUrl,
                        verificationStatus: transporter.verificationStatus ?? '',
                        panNumber: transporter.panNumber ?? '',
                        aadhaarFront: aadhaarFrontUrl,
                        aadhaarBack: aadhaarBackUrl
                    };
                })
            );

            return transporterData

        } catch (error: any) {
            console.error('error in getRequestedTransporter');
            throw new Error(error)
        }
    }

    async changeVerificationStatus(id: string, status: ITransporter['verificationStatus']): Promise<string> {
        try {

            const transporter = await this._transporterRepository.updateTransporterById(id, { verificationStatus: status });
            if (status == 'approved') {
                await this._transporterWalletRepository.createWallet({ transporterId: transporter?.id })
            }

            if (status == 'approved') {
                await this._notificationRepository.createNotification({
                    userId: transporter?.id,
                    userType: 'transporter',
                    title: 'Request Accept',
                    message: 'Your request accepted'

                })
            } else if (status == 'rejected') {
                await this._notificationRepository.createNotification({
                    userId: transporter?.id,
                    userType: 'transporter',
                    title: 'Request Rejected',
                    message: 'Your request rejected, Please provide valid documents and reRequest.'
                })
            }

            return status === 'approved' ? 'Request Approved.' : 'Request Reject.';

        } catch (error: any) {
            console.error('error in changeVerificatonStaus');
            throw new Error(error)
        }
    }

    async getShipper(search: string, page: number, limit: number): Promise<{ shipperData: IShipper[], totalPages: number }> {
        try {

            const skip = (page - 1) * limit;
            const filter: any = {}

            if (search) {
                filter.shipperName = { $regex: search, $options: 'i' }
            }

            const shippers = await this._shipperRepository.find(filter, {}, skip, limit);
            const total = await this._shipperRepository.count(filter);

            return { shipperData: shippers, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperStatus(id: string): Promise<string> {
        try {

            const shipper = await this._shipperRepository.findShipperById(id);

            if (!shipper) {
                const error: any = new Error('Shipper not found');
                error.status = HTTP_STATUS.NOT_FOUND;;
                throw error
            }

            const updateShipper = await this._shipperRepository.updateShipperStatus(id, !shipper.isBlocked as boolean)

            return updateShipper?.isBlocked ? 'Blocked' : 'Unblocked';

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedShipper(): Promise<IShipper[]> {
        try {

            return await this._shipperRepository.getRequestedShipper()

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeShipperVerificationStatus(id: string, status: IShipper["verificationStatus"]): Promise<string> {
        try {

            const shipper = await this._shipperRepository.updateShipperById(id, { verificationStatus: status });

            if (status == 'approved') {
                await this._notificationRepository.createNotification({
                    userId: shipper?.id,
                    userType: 'shipper',
                    title: 'Request Accept',
                    message: 'your request accepted'
                })
            } else if (status == 'rejected') {
                await this._notificationRepository.createNotification({
                    userId: shipper?.id,
                    userType: 'shipper',
                    title: 'Request Rejected',
                    message: 'your request rejected, Please provide valid documents and reRequest'
                })
            }
            return shipper?.verificationStatus === 'approved' ? 'Request Approved' : 'Request Rejected';

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedTrucks(): Promise<ITruck[]> {
        try {

            return await this._truckRepository.getRequestedTrucks();

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeTruckVerificationStatus(id: string, status: ITruck["verificationStatus"]): Promise<string> {
        try {

            const truck = await this._truckRepository.updateTruckById(id, { verificationStatus: status });
            if (status == 'approved') {
                await this._notificationRepository.createNotification({
                    userId: truck?.transporterId,
                    userType: 'transporter',
                    title: 'Request Accept',
                    message: 'Truck request accepted'
                })
            } else if (status == 'rejected') {
                await this._notificationRepository.createNotification({
                    userId: truck?.transporterId,
                    userType: 'transporter',
                    title: 'Request Rejected',
                    message: 'Truck request rejected'
                })
            }
            return truck?.verificationStatus === 'approved' ? 'Request Approve' : 'Request Reject';

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getLoads(page: number, limit: number, search: string, startDate: string, endDate: string): Promise<{ loadData: ILoad[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;
            const projection = {
                material: 1,
                quantity: 1,
                transportationRent: 1,
                createdAt: 1,
            }

            const filter: any = {};

            if (search) {
                filter.material = { $regex: search, $options: "i" };
            }

            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                }
            }

            const response = await this._loadRepository.find(filter, {}, skip, limit, { createdAt: -1 });
            const totalcounts = await this._loadRepository.count(filter)
            return { loadData: response, totalPages: Math.ceil(totalcounts / limit) };

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchDashboardDatas(): Promise<{ userCount: number; loadCount: number; tripCount: number; totalEarning: number; }> {
        try {

            const shippers = await this._shipperRepository.count({ isVerified: true });
            const transporters = await this._transporterRepository.count({ isVerified: true });

            const userCount = shippers + transporters

            const loads = await this._loadRepository.count({})

            const trips = await this._tripRepository.count({ tripStatus: 'completed' });

            const creditAmount = [
                { $match: { transactionType: 'credit' } },
                {
                    $group: {
                        _id: null,
                        totalCreditAmount: { $sum: '$amount' }
                    }
                }
            ]

            const totalcreditAmounts = await this._adminPaymentRepository.aggregate(creditAmount)
            const totalCredits = totalcreditAmounts[0]?.totalCreditAmount || 0;

            const debitAmount = [
                { $match: { transactionType: 'debit' } },
                {
                    $group: {
                        _id: null,
                        debitAmount: { $sum: '$amount' }
                    }
                }
            ]

            const totaldebitsAmounts = await this._adminPaymentRepository.aggregate(debitAmount)
            const totalDebits = totaldebitsAmounts[0]?.debitAmount || 0;

            const totalRevenue = totalCredits - totalDebits


            return { userCount, loadCount: loads, tripCount: trips, totalEarning: totalRevenue }


        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrips(page: number, limit: number, search: string, status: string): Promise<{ tripsData: ITrip[]; totalPages: number; }> {
        try {

            // const skip = (page - 1) * limit;

            // const filter: any = {}

            // if(status !== 'all') {
            //     filter.tripStatus = status
            // }

            // const trips = await this._tripRepository.findWithPopulate(
            //     filter,
            //     [
            //         { path: 'transporterId', select: 'transporterName profileImage phone email' },
            //         { path: 'shipperId', select: 'shipperName profileImage phone email' },
            //         { path: 'loadId', select: 'pickupLocation dropLocation material quantity scheduledDate distanceInKm' },
            //         { path: 'truckId', select: 'truckOwnerName truckOwnerMobileNo truckNo truckType driverName driverMobileNo' }
            //     ],
            //     skip,
            //     limit,
            //     { confirmedAt: -1 }
            // )

            // const totalCounts = await this._tripRepository.count({})

            // console.log(trips);


            // return { tripsData: trips, totalPages: Math.ceil(totalCounts / limit) }

            const skip = (page - 1) * limit;
            const matchStage: any = {};

            // Filter by trip status
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

            // Search filter
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

            // Count total
            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await this._tripRepository.aggregate(countPipeline);
            const totalCounts = countResult[0]?.total || 0;

            // Apply sorting, pagination
            pipeline.push(
                { $sort: { confirmedAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            );

            // Project only needed fields
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

            return {
                tripsData: trips,
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

    async fetchPaymentHistory(searchTerm: string, paymentStatus: string, userType: string, paymentfor: string, page: number, limit: number): Promise<{ paymentData: AdminPaymentDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit

            const filter: any = {};

            if (paymentStatus !== 'all') {
                filter.paymentStatus = paymentStatus
            }

            if (userType !== 'all') {
                filter.userType = userType
            }

            if (paymentfor !== 'all') {
                filter.paymentFor = paymentfor
            }

            if (searchTerm) {
                filter.transactionId = { $regex: searchTerm, $options: 'i' }
            }

            const paymentDatas = await this._adminPaymentRepository.findWithPopulate(
                filter,
                [
                    { path: 'tripId', select: '_id' },
                    { path: 'bidId', select: '_id' }
                ],
                skip,
                limit,
                { createdAt: -1 }
            )

            const adminPaymentDatos: AdminPaymentDTO[] = paymentDatas.map((data) => ({
                transactionId: data.transactionId ?? '',
                userType: data.userType ?? '',
                userId: data.userId ?? '',
                amount: data.amount ?? 0,
                tripId: data.tripId ? (data.tripId as any)._id?.toString() : undefined,
                transactionType: data.transactionType ?? '',
                paymentFor: data.paymentFor ?? '',
                bidId: data.bidId ? (data.bidId as any)._id?.toString() : undefined,
                subscriptionId: data.subscriptionId ?? '',
                paymentStatus: data.paymentStatus ?? '',
                paymentMethod: data.paymentMethod ?? '',
                createdAt: data.createdAt ?? null,
                updatedAt: data.updatedAt ?? null,
            }));

            const totalcounts = await this._adminPaymentRepository.count(filter)

            return { paymentData: adminPaymentDatos, totalPages: Math.ceil(totalcounts / limit) }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchRevenueDatas(): Promise<{ success: boolean; categories: string[]; data: number[] }> {
        try {

            const currentYear = new Date().getFullYear();

            const monthlyTotals: number[] = [];

            for (let month = 0; month < 12; month++) {
                const start = startOfMonth(new Date(currentYear, month));
                const end = endOfMonth(new Date(currentYear, month));

                const credit = await this._adminPaymentRepository.aggregate([
                    {
                        $match: {
                            transactionType: 'credit',
                            paymentStatus: 'success',
                            createdAt: {
                                $gte: start,
                                $lte: end
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" }
                        }
                    }
                ])

                const debit = await this._adminPaymentRepository.aggregate([
                    {
                        $match: {
                            transactionType: "debit",
                            paymentStatus: "success",
                            createdAt: { $gte: start, $lte: end },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" },
                        },
                    }
                ])

                const totalCredit = credit[0]?.totalAmount || 0;
                const totalDebit = debit[0]?.totalAmount || 0;

                monthlyTotals.push(totalCredit - totalDebit);

            }

            const categories = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            return { success: true, categories, data: monthlyTotals };

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }
}



