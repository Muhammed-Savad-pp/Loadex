import config from "../../config";
import { getPresignedDownloadUrl, s3 } from "../../config/s3Config";
import { TruckForShipperDTO } from "../../dtos/truck/truck.for.shipper.dto";
import { TruckDTO } from "../../dtos/truck/truck.for.transporter.dto";
import { RequestedTruckForAdminDTO } from "../../dtos/truck/truck.forAdmin.dto";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITruckService } from "../../interface/truck/ITruckService";
import { ITruck } from "../../models/TruckModel";
import { INotificationRepository } from "../../repositories/interface/INotificationRepository";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITruckRepository } from "../../repositories/interface/ITruckRepository";
import { PutObjectCommand } from "@aws-sdk/client-s3";


export class TruckSerice implements ITruckService {

    constructor(
        private _truckRepository: ITruckRepository,
        private _transporterRepository: ITransporterRepository,
        private _notificationRepository: INotificationRepository
    ) { };

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
                rcValidity: 1,
                rejectReason: 1
            }

            const trucks = await this._truckRepository.find({ transporterId: id, status: status }, projection, skip, limit, { createdAt: -1 });
            const total = await this._truckRepository.count({ transporterId: id, status: status });

            const truckDatos: TruckDTO[] = await Promise.all(
                trucks.map(async (truck: ITruck) => {

                    let trukImageUrl = '';
                    let driverLicenseUrl = ''

                    if (truck.truckImage) {
                        try {
                            trukImageUrl = await getPresignedDownloadUrl(truck.truckImage) ?? '';
                        } catch (err) {
                            console.error(`Error generating URL for ${truck.truckImage}:`, err);
                        }
                    }


                    if (truck.driverLicense) {
                        try {
                            driverLicenseUrl = await getPresignedDownloadUrl(truck.driverLicense) ?? ''
                        } catch (error) {
                            console.error(`error generating URL for ${truck.driverLicense}:`, error)
                        }
                    }

                    return {
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
                        driverLicense: driverLicenseUrl,
                        status: truck.status ?? "inactive",
                        truckImage: trukImageUrl,
                        rcValidity: truck.rcValidity,
                        rejectReason: truck.rejectReason,
                    };
                })
            );

            return { trucks: truckDatos, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
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

            let rcBookKey: string | undefined;
            let driverLicenseKey: string | undefined;
            let truckImageKey: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const key = `${folder}/transporter/${Date.now()}_${file.originalname}`
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

            if (rcBook) {
                rcBookKey = await uploadToS3(rcBook, 'rcBook')
            }

            if (driverLicense) {
                driverLicenseKey = await uploadToS3(driverLicense, 'driverLicense')
            }

            if (truckImage) {
                truckImageKey = await uploadToS3(truckImage, 'truckImage')
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
                truckNo: vehicleNumber.toUpperCase(),
                truckType: type,
                capacity: capacity,
                tyres: tyres,
                driverName: driverName,
                driverMobileNo: driverMobileNumber,
                currentLocation: currentLocation,
                pickupLocation: from,
                dropLocation: to,
                operatingStates: selectedLocationsParsed,
                rcBook: rcBookKey,
                driverLicense: driverLicenseKey,
                currentLocationCoords: currentLocationCoords,
                pickupLocationCoords: fromCoords,
                dropLocationCoords: toCoords,
                rcValidity: rcValidityDate,
                truckImage: truckImageKey,

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

    async updateTruckAvailable(formData: Partial<ITruck>, driverLicensefile?: Express.Multer.File): Promise<{ success: boolean, truckData?: TruckDTO, message: string }> {
        try {

            const { id, driverName, driverMobileNo, currentLocation, driverLicense, currentLocationCoords } = formData;

            let driverLicenseNewKey: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {

                const key = `${folder}/transporter/${Date.now()}_${file.originalname}`

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

            if (driverLicensefile) {
                driverLicenseNewKey = await uploadToS3(driverLicensefile, 'driverLicense')
            } else {
                driverLicenseNewKey = driverLicense
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
                driverLicense: driverLicenseNewKey,
                available: true,
                status: 'active'
            });

            if (!updateTruck) {
                return { success: false, message: "Truck not activated" }
            }

            const truckData: TruckDTO = {
                _id: updateTruck._id as string,
                available: updateTruck.available ?? false,
                currentLocation: updateTruck.currentLocation ?? '',
                driverMobileNo: updateTruck.driverMobileNo ?? '',
                driverName: updateTruck.driverName ?? '',
                dropLocation: updateTruck.dropLocation ?? '',
                operatingStates: updateTruck.operatingStates ?? [],
                pickupLocation: updateTruck.pickupLocation ?? '',
                truckNo: updateTruck.truckNo ?? '',
                truckOwnerMobileNo: updateTruck.truckOwnerMobileNo ?? '',
                truckOwnerName: updateTruck.truckOwnerName ?? '',
                truckType: updateTruck.truckType ?? '',
                tyres: updateTruck.tyres ?? '',
                verificationStatus: updateTruck.verificationStatus ?? '',
                capacity: updateTruck.capacity ?? '',
                driverLicense: updateTruck.driverLicense ?? '',
                status: updateTruck.status ?? '',
                truckImage: updateTruck.truckImage ?? '',
                rcValidity: updateTruck.rcValidity ?? '',
            };

            return { success: true, message: 'Truck Active SuccessFully', truckData: truckData }

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

    async updateTruck(updateData: Partial<ITruck>, truckImage: Express.Multer.File): Promise<{ success: boolean; message: string; }> {
        try {

            const { _id, truckOwnerName, truckOwnerMobileNo, tyres, truckType, capacity, rcValidity, operatingStates } = updateData

            const truck = await this._truckRepository.findById(_id as string);

            if (!truck) {
                return { success: false, message: 'Truck not found' }
            }

            let truckImageUrl: string | undefined;

            const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
                const s3Params = {
                    Bucket: config.awsBucketName,
                    Key: `${folder}/transporter/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(s3Params)
                await s3.send(command)

                return `https://${config.awsBucketName}.s3.${config.awsRegion}.amazonaws.com/${s3Params.Key}`;
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

            if (rcValidity) {
                parsedRCValidity = new Date(rcValidity);
                if (isNaN(parsedRCValidity.getTime())) {
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

            if (!updateTruck) {
                return { success: false, message: 'Truck update Failed' }
            }

            return { success: true, message: 'Truck updated successFully' }

        } catch (error) {
            console.error(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async fetchTrucksForShipper(page: number, limit: number): Promise<{ truckData: TruckForShipperDTO[] | null, totalPages: number }> {
        try {

            const skip = (page - 1) * limit;

            const trucks = await this._truckRepository.findWithPopulate(
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

            const total = await this._truckRepository.count({ verificationStatus: 'approved' })
            return { truckData: mappedTrucks, totalPages: Math.ceil(total / limit) }

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getRequestedTrucksForAdmin(): Promise<RequestedTruckForAdminDTO[]> {
        try {

            const trucks = await this._truckRepository.getRequestedTrucks();

            const mappedTrucks: RequestedTruckForAdminDTO[] = await Promise.all(
                trucks.map(async truck => {
                    const truckImageUrl = truck.truckImage ? await getPresignedDownloadUrl(truck.truckImage) : '';
                    const rcBookUrl = truck.rcBook ? await getPresignedDownloadUrl(truck.rcBook) : '';
                    const driverLicenseUrl = truck.driverLicense ? await getPresignedDownloadUrl(truck.driverLicense) : '';

                    return {
                        _id: truck._id as string,
                        transporterId: truck.transporterId?.toString() || "",
                        truckOwnerName: truck.truckOwnerName ?? '',
                        truckOwnerMobileNo: truck.truckOwnerMobileNo ?? '',
                        truckNo: truck.truckNo ?? '',
                        truckType: truck.truckType ?? '',
                        capacity: truck.capacity ?? '',
                        tyres: truck.tyres ?? '',
                        driverName: truck.driverName ?? '',
                        driverMobileNo: truck.driverMobileNo ?? '',
                        currentLocation: truck.currentLocation ?? '',
                        pickupLocation: truck.pickupLocation ?? '',
                        dropLocation: truck.dropLocation ?? '',
                        verificationStatus: truck.verificationStatus ?? '',
                        operatingStates: truck.operatingStates ?? [],
                        rcBook: rcBookUrl ?? '',
                        driverLicense: driverLicenseUrl ?? '',
                        available: truck.available ?? false,
                        createdAt: truck.createdAt ? new Date(truck.createdAt) : new Date(),
                        rcValidity: truck.rcValidity ? new Date(truck.rcValidity) : new Date(),
                        truckImage: truckImageUrl ?? '',
                    };
                })
            );
            return mappedTrucks;

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async changeTruckVerificationStatusByAdmin(id: string, status: ITruck["verificationStatus"], rejectReason: string): Promise<string> {
        try {

            let truck;
            if(status === 'rejected' && rejectReason) {
                truck = await this._truckRepository.updateTruckById(id, {verificationStatus: status, rejectReason: rejectReason})
            } else {
                truck = await this._truckRepository.updateTruckById(id, { verificationStatus: status });
            }
            
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

}