import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';
import { fetchTransporters } from '../../services/shipper/shipperService';
import ProfileComponent from '../../components/shipper/ProfileComponent';


interface ITransporter {
    _id: string;
    transporterName: string;
    email: string;
    profileImage: string;
}

const Directory: React.FC = () => {

    const [transporter, setTransporter] = useState<ITransporter[]>([]);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredTransporter, setFilteredTransporter] = useState<ITransporter[]>(transporter);
    const [selectTransporterId, setSelectedTransporterId] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(10);
    const limit = 5


    useEffect(() => {
        const getShippers = async () => {
            const response: any = await fetchTransporters(page, limit);
            setTransporter(response.transporters as ITransporter[]);
            setTotalPages(response.totalPages);
        }
        getShippers()
    }, [page])

    // Filter shippers based on search term only
    useEffect(() => {
        const results = transporter.filter(transporter =>
            transporter.transporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transporter.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredTransporter(results);
    }, [searchTerm, transporter]);

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 min-h-screen mt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center">
                                <Users className="h-6 w-6 text-blue-600 mr-2" />
                                <h1 className="text-xl font-semibold text-gray-900">Transporter Directory</h1>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-64 lg:w-96">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Search transporters..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Shipper List */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Profile
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransporter.length > 0 ? (
                                        filteredTransporter.map((transporter) => (
                                            <tr key={transporter._id} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <img className="h-10 w-10 rounded-full object-cover" src={transporter.profileImage} alt={transporter.transporterName} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{transporter.transporterName}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm">{transporter.email}</p>
                                                </td>
                                                <td>
                                                    <button onClick={() => { setShowProfileModal(true); setSelectedTransporterId(transporter._id) }} className='bg-green-600 px-3 py-1 text-white rounded-lg'>View</button>
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
                                                </td>


                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users className="h-10 w-10 text-gray-400 mb-2" />
                                                    <p>No shippers found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                                        ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}'}`}>
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

export default Directory;