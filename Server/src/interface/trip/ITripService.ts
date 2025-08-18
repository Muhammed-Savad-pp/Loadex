import { TripForAdminDTO, TripForShipperDTO, TripForTransporterDTO } from "../../dtos/trip/trip.for.transporter.dto";

export interface ITripService {
    fetchTripsForTransporter(transporterId: string, status: string, page: number, limit: number): Promise<{ trips: TripForTransporterDTO[] | null, totalPages: number }>;
    updateTripStatus(tripId: string, newStatus: 'confirmed' | 'inProgress' | 'arrived' | 'completed'): Promise<{ success: boolean, message: string }>;
    fetchTripsForShipper(shipperId: string, page: number, limit: number, status: string): Promise<{ tripsData: TripForShipperDTO[] | null, totalPages: number }>
    fetchTripsForAdmin(page: number, limit: number, search: string, status: string): Promise<{ tripsData: TripForAdminDTO[], totalPages: number }>;
    sendTripAmountToTransporter(tripId: string): Promise<{success: boolean, message: string}>;

}