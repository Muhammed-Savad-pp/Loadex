import { useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import { Copy } from 'lucide-react';
import ProfileComponent from "../../components/shipper/ProfileComponent";
import { fetchTripsForShipper } from "../../services/trip/tripApi";

interface ITrips {
    _id: string;
    transporterId: {
        transporterName: string;
        phone: string;
        profileImage: string;
        _id: string
    };
    shipperId: {
        shipperName: string;
    };
    loadId: {
        pickupLocation: string;
        dropLocation: string;
        material: string;
        quantity: string;
        scheduledDate: Date;
        length: string;
        height: string;
        breadth: string;
        descriptions: string;
        distanceInKm: number;
    };
    truckId: {
        truckNo: string;
        truckType: string;
        capacity: string;
        driverName: string;
        driverMobileNo: string;
    };
    price: string;
    tripStatus: string;
    confirmedAt: string;
}

type IFilterStatus = 'all' | 'confirmed' | 'inProgress' | 'arrived' | 'completed';

const Trips = () => {
    const [trips, setTrips] = useState<ITrips[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(30);
    const [filterStatus, setFilterStatus] = useState<IFilterStatus>('all');
    const limit = 3;

    useEffect(() => {
        const getTrips = async () => {
            try {
                setLoading(true);
                const response: any = await fetchTripsForShipper(page, limit, filterStatus);
                setTrips(response.tripsData);
                setTotalPages(response.totalPages)
            } catch (error) {
                console.error("Failed to fetch trips:", error);
            } finally {
                setLoading(false);
            }
        };
        getTrips();
    }, [page, filterStatus]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-800";
            case "inProgress":
                return "bg-blue-100 text-blue-800";
            case "arrived":
                return "bg-red-100 text-red-800";
            case "completed":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleCopy = async (number: string) => {
        try {

            await navigator.clipboard.writeText(number)

        } catch (error) {
            console.log(error);
        }
    }
    console.log(filterStatus);


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-50 mt-10">
                <ShipperProfileSidebar />
                <div className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                            <div >
                                
                                <select
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as IFilterStatus)}
                                >
                                    <option value="all">All</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="inProgress">InProgress</option>
                                    <option value="arrived">Arrived</option>
                                    <option value="completed">Completed</option>

                                </select>
                            </div>

                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="bg-white shadow rounded-lg p-10 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No trips found</h3>

                            </div>
                        ) : (
                            <div className="space-y-4">
                                {trips.map((trip, index) => (
                                    <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                                        <div className="border border-gray-200 bg-gray-50 px-4 py-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center text-sm text-blue-600 font-semibold tracking-wide space-x-1">
                                                        <span className="text-gray-500">Trip ID:</span>
                                                        <span>{trip._id.slice(0, 10)}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-800">Trip #{index + 1}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.tripStatus)}`}>
                                                        {trip.tripStatus}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Created on {formatDate(trip.confirmedAt)}
                                                </div>
                                            </div>
                                            <div className="mt-1 flex row items-center cursor-pointer" onClick={() => setShowProfileModal(true)}>
                                                <img src={trip.transporterId.profileImage} alt="profileImage" className="w-10 h-10 rounded-full" />
                                                <p className="font-semibold ml-1 text-lg">{trip.transporterId.transporterName}</p>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex flex-wrap">
                                                {/* Route summary - Left column */}
                                                <div className="w-full md:w-2/5 pr-4">
                                                    <div className="flex mb-2">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-4 w-4 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <circle cx="10" cy="10" r="5" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm font-medium text-gray-900">From: <span className="font-normal text-gray-600">{trip.loadId.pickupLocation}</span></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex mb-2">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-4 w-4 text-red-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm font-medium text-gray-900">To: <span className="font-normal text-gray-600">{trip.loadId.dropLocation}</span></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center mb-2">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-2">
                                                            <p className="text-sm font-medium text-gray-900">Date: <span className="font-normal text-gray-600">{formatDate(trip.loadId.scheduledDate.toString())}</span></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-2 flex justify-between gap-2">
                                                            <p className="text-sm font-medium text-gray-900">Driver: <span className="font-normal text-gray-600">{trip.truckId.driverName} ( {trip.truckId.driverMobileNo} )</span></p>
                                                            < Copy className="w-4 h-4 mt-1 text-gray-600 cursor-pointer" onClick={() => handleCopy(trip.truckId.driverMobileNo)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Details grid - Right column */}
                                                <div className="w-full md:w-3/5 mt-3 md:mt-0">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Material</p>
                                                            <p className="text-sm font-medium truncate">{trip.loadId.material}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Quantity</p>
                                                            <p className="text-sm font-medium truncate">{trip.loadId.quantity}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Distance</p>
                                                            <p className="text-sm font-medium">{trip.loadId.distanceInKm} km</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Price</p>
                                                            <p className="text-sm font-medium text-indigo-600">₹{trip.price}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Transporter</p>
                                                            <p className="text-sm font-medium truncate">{trip.transporterId.transporterName}</p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-500">Truck</p>
                                                            <p className="text-sm font-medium truncate">{trip.truckId.truckNo}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {showProfileModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-75 bg-opacity-50">
                                                <div className="relative bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto overflow-auto max-h-[90vh]">
                                                    <button
                                                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-700"
                                                        onClick={() => setShowProfileModal(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>

                                                    {/* Profile Component */}
                                                    <ProfileComponent transporterId={trip.transporterId._id} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center mt-6">
                            <div className="inline-flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
                                    ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                    .map((p) => (
                                        <button className={`px-3 py-2 ml-1  mr-1 text-sm rounded-md font-medium border-t border-b border-gray-300 cursor-pointer
                                            ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                            {p}
                                        </button>
                                    ))
                                }
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
                                        ${page === totalPages ? 'bg-gray-100 text-gray-400 not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}'}`}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Trips;