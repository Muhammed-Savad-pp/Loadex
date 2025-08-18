import { useEffect, useState } from 'react'
import Navbar from '../../components/Common/Navbar/Navbar';
import ProfileComponent from '../../components/shipper/ProfileComponent';
import { fetchTrucksForShipper } from '../../services/truck/truckApi';

interface ITrucks {
    _id: string;
    transporterId: {
        _id: string;
        transporterName: string;
        profileImage: string;
    };
    truckOwnerName: string;
    truckType: string;
    truckNo: string;
    capacity: string;
    tyres: string;
    currentLocation: string;
    operatingStates: string[];
}

function TruckBoard() {

    const [trucks, setTrucks] = useState<ITrucks[]>([]);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [selectTransporterId, setSelectedTransporterId] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(10);
    const limit =4

    useEffect(() => {
        const listTrucks = async () => {
            const response: any = await fetchTrucksForShipper(page, limit);
            setTrucks(response.truckData);
            setTotalPages(response.totalPages)
        }
        listTrucks()
    }, [page])

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto mt-20 mb-8 p-4 h-[100vh] rounded-md bg-gray-50 '>
                <h1 className='text-2xl font-bold mb-6 text-gray-800'>Truck Board</h1>
                <div className='grid grid-cols-1 gap-4'>
                    <div className='hidden md:grid md:grid-cols-7 bg-gray-200 rounded-t-lg p-3 font-semibold text-md text-gray-800'>
                        <div className='px-2'>TransporterName</div>
                        <div className='px-2 text-center'>TruckOwner</div>
                        <div className='px-2 text-center'>TruckType</div>
                        <div className='px-2 text-center'>TruckNo</div>
                        <div className='px-2 text-center'>Capacity</div>
                        <div className='px-2 '>Tyres</div>
                        <div className=''>CurrentLocation</div>
                        {/* <div className='px-2'>OperatingStates</div> */}

                    </div>
                    {
                        trucks.map((truck) => (
                            <div key={truck._id} className='bg-white rounded-lg shadow overflow-hidden'>
                                <div className='hidden md:grid md:grid-cols-7 p-3 items-center hover:bg-gray-50'>
                                    <div className='px-2 text-gray-900 flex row items-center cursor-pointer' onClick={() => { setShowProfileModal(true); setSelectedTransporterId(truck.transporterId._id) }}>
                                        <img className='w-12 h-12 rounded-full' src={truck.transporterId.profileImage} alt="" />
                                        <p className='font-semibold'>{truck.transporterId.transporterName}</p>
                                    </div>
                                    <div className='px-2 text-center font-semibold text-gray-900'>{truck.truckOwnerName}</div>
                                    <div className='px-2 text-center font-semibold text-gray-900'>{truck.truckType}</div>
                                    <div className='px-2 text-center font-semibold text-gray-900'>{truck.truckNo}</div>
                                    <div className='px-2 text-center font-semibold text-gray-900'>{truck.capacity}</div>
                                    <div className='px-2  font-semibold text-gray-900'>{truck.tyres}</div>
                                    <div className=' font-semibold text-gray-900'>{truck.currentLocation}</div>
                                    {/* <div className='px-2 font-semibold text-gray-900 flex flex-wrap gap-2'>
                                        {
                                           Array.isArray(truck.operatingStates) && typeof truck.operatingStates[0] === 'string'
                                           ? JSON.parse(truck.operatingStates[0]).map((state: string, index: string) => (
                                            <span key={index} className='bg-green-500 text-white px-2 py-0.5 rounded-full text-sm shadow-md'>
                                                {state}
                                            </span>
                                           ))
                                           : "N/A"
                                        }
                                    </div> */}
                                </div>
                                {showProfileModal && selectTransporterId && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-75 bg-opacity-50">
                                        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto overflow-auto max-h-[90vh]">
                                            <button
                                                className="absolute top-4 right-4 text-gray-600 hover:text-gray-700"
                                                onClick={() => { setShowProfileModal(false); setSelectedTransporterId(null) }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            {/* Profile Component */}
                                            <ProfileComponent
                                                transporterId={selectTransporterId}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>

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
    )
}

export default TruckBoard