import { ITransporter } from "../../models/transporter/TransporterModel";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import { configDotenv } from 'dotenv';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/s3Config";
import { ITransporterRepository } from "../../repositories/interface/ITransporterRepository";
import { ITransporterService } from "../../interface/transporter/ITransporterService";

configDotenv()

export class TransporterService implements ITransporterService {

    constructor(private transporterRepository: ITransporterRepository) { };

    async verificationStatus(id: string): Promise<{ success: boolean, message: string, verificationStatus?: string }> {

        console.log('herer');

        const transporter = await this.transporterRepository.findById(id)
        console.log(transporter?.verificationStatus, 'verification status');

        if (!transporter) {
            return { success: false, message: 'Transporter not signUp' }
        }


        return { success: true, message: 'Transporter verification Status', verificationStatus: transporter.verificationStatus }

    }

    async getProfileData(id: string): Promise<{ success: boolean, message: string, transporterData?: Partial<ITransporter> }> {


        const transporterData = await this.transporterRepository.findById(id);

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


            const updateTransporter = await this.transporterRepository.updateTransporterById(
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
            selectedLocations: string[]
        }, rcBook: Express.Multer.File, driverLicense: Express.Multer.File): Promise<{ success: boolean, message: string }> {

        try {

            const { vehicleNumber, ownerName, ownerMobileNo, type, capacity, tyres, driverName,
                driverMobileNumber, currentLocation, from, to, selectedLocations } = truckData;


            const ExistTruck = await this.transporterRepository.FindTruckByRcno(vehicleNumber)

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

            console.log('success')
            console.log(rcBookUrl, 'rcBookUrl')
            console.log(driverLicenseUrl, 'driverLicenseUrl');

            const createTruck = await this.transporterRepository.createTruck({
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
                driverLicense: driverLicenseUrl

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
}