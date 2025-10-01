import mongoose from "mongoose";
import { ILoadService } from "../../interface/load/ILoadService";
import { ILoad } from "../../models/LoadModel";
import { ILoadRepository } from "../../repositories/interface/ILoadRepository";
import { IShipperRepository } from "../../repositories/interface/IShipperRepository";
import { LoadForAdminDTO, LoadForShipperDTO, LoadForTransporterDTO } from "../../dtos/load/response/load.dto";

export class LoadService implements ILoadService {

    constructor(
        private _shipperRepositories: IShipperRepository,
        private _loadRepositories: ILoadRepository,
    ) { }

    async createLoad(shipperId: string, formData: Partial<ILoad>): Promise<{ success: boolean; message: string; }> {
        try {
            const { pickupLocation, dropLocation, material, quantity, scheduledDate, length, truckType,
                transportationRent, height, breadth, descriptions, pickupCoordinates, dropCoordinates } = formData;

            if(transportationRent && Number(transportationRent) < 1) {
                return { success: false, message: 'Transportation Rent must be greater than 0'}
            }

            if(quantity && Number(quantity) < 1) {
                return { success: false, message: 'quantity must be greater than 0'}
            }

            if(Number(length) < 1 || Number(height) < 1 || Number(breadth) < 1) {
                return { success: false, message: 'Negative value not accept'}
            }

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

    async updateLoad(formData: Partial<ILoad>): Promise<{ success: boolean; message: string; updateData?: LoadForShipperDTO; }> {
        try {

            const { pickupCoordinates, dropCoordinates, pickupLocation, dropLocation, material, quantity, scheduledDate,
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

    async loadsForAdmin(page: number, limit: number, search: string, startDate: string, endDate: string): Promise<{ loadData: LoadForAdminDTO[] | null, totalPages: number }> {
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

            const response = await this._loadRepositories.find(filter, {}, skip, limit, { createdAt: -1 });
            const totalcounts = await this._loadRepositories.count(filter)

            const mappedLoads: LoadForAdminDTO[] = response.map(load => ({
                material: load.material ?? '',
                quantity: load.quantity ?? '',
                transportationRent: load.transportationRent ?? '',
                createdAt: load.createdAt ? new Date(load.createdAt) : new Date(),
            }));

            return { loadData: mappedLoads, totalPages: Math.ceil(totalcounts / limit) };

        } catch (error) {
            console.log(error);
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async loadsForTransporter(page: number, limit: number): Promise<{ loads: LoadForTransporterDTO[] | null, currentPage: number, totalPages: number, totalItems: number }> {
        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            const skip = (page - 1) * limit;

            const loads = await this._loadRepositories.getLoads(
                { status: 'active', createdAt: { $gte: threeDaysAgo } },
                [
                    { path: 'shipperId', select: 'companyName shipperName _id' },
                ],
                skip,
                limit
            )

            const total = await this._loadRepositories.count({ status: 'active' });
            const loadDatos: LoadForTransporterDTO[] = (loads || []).map((load: ILoad) => ({
                _id: load._id as string,
                shipperId: {
                    _id: (load.shipperId as any)._id.toString(),
                    companyName: (load.shipperId as any).companyName,
                    shipperName: (load.shipperId as any).shipperName,
                },
                pickupLocation: load.pickupLocation ?? '',
                dropLocation: load.dropLocation ?? '',
                material: load.material ?? '',
                quantity: load.quantity ?? '',
                scheduledDate: load.scheduledDate,
                length: load.length ?? '',
                truckType: load.truckType ?? '',
                transportationRent: load.transportationRent ?? '',
                height: load.height ?? '',
                breadth: load.breadth ?? '',
                descriptions: load.descriptions ?? '',
                pickupCoordinates: {
                    longitude: (load.pickupCoordinates as any).longitude,
                    latitude: (load.pickupCoordinates as any).latitude,
                },
                dropCoordinates: {
                    longitude: (load.dropCoordinates as any).longitude,
                    latitude: (load.dropCoordinates as any).latitude,
                },
                distanceInKm: load.distanceInKm ?? 0
            }))

            return { loads: loadDatos, currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total };
        } catch (error: any) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }
}