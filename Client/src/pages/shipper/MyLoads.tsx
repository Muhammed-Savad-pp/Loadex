import React, { useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import { Truck, Package, MapPin, Calendar, ChevronDown, Ruler, Box, AlertTriangle, Weight, 
        Expand, FileText, Trash2, Pencil, X } from 'lucide-react';
import UpdateLoadModal from "../../components/shipper/UpdateLoadModal";
import { LoadData, LoadFormData } from "../../interface/interface";
import toast from "react-hot-toast";
import { fetchLoadsForShipper, updateLoad, deleteLoad } from "../../services/load/loadApi";


const MyLoads: React.FC = () => {
    const [loads, setLoads] = useState<LoadData[]>([]);
    const [activeFilter, setActiveFilter] = useState<'All' | 'active' | 'in-Transit'>('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(10);
    const [updateModal, setUpdateModal] = useState<boolean>(false);
    const [selectedUpdateLoad, setSelectedUpdateLoad] = useState<LoadData | null>(null);
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
    const [selectedDeletedLoadId, setSelectedDetedLoadId] = useState<string | null>(null)
    const limit = 3;
    

    useEffect(() => {
        const getLoads = async () => {
            const response: any = await fetchLoadsForShipper(page, limit);
            setLoads(response.loads as LoadData[])
            setTotalPages(response.totalPages);
        }
        getLoads()
    }, [page])

    const filteredLoads = loads.filter(load =>
        activeFilter === 'All' || load.status === activeFilter
    );

    const handleFilterChange = (filter: 'All' | 'active' | 'in-Transit') => {
        setActiveFilter(filter);
        setIsDropdownOpen(false);
    };

    const handleUpdateModalClose = () => {
        setUpdateModal(false);
    };

    const handleUpdateSubmit = async (updatedData: LoadFormData) => {
        const finalData: LoadData = {
            ...updatedData,
            _id: updatedData._id ?? '',
            createdAt: updatedData.createdAt ?? new Date(),
            status: updatedData.status ?? 'active'
        };

        try {

            const response: any = await updateLoad(finalData);
            if (response.success) {
                toast.success(response.message);
                setLoads(prevLoads =>
                    prevLoads.map(load =>
                        load._id === response.updateData?._id ? response.updateData : load
                    )
                )
            } else {
                toast.error(response.message)
            }
            handleUpdateModalClose()

        } catch (error) {
            console.error(error)
        }
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModal(false)
    }

    const handleDelete = async () => {
        try {
            
            const response: any = await deleteLoad(selectedDeletedLoadId as string);
            if(response.success) {
                toast.success(response.message)
                setLoads(prevLoads => 
                    prevLoads.filter(load => load._id !== response.loadData._id)
                )
            }

            setSelectedDetedLoadId(null)
            handleDeleteModalClose()

        } catch (error) {
            console.error(error)
        }
    }

    const hanldeDeleteConformation = (loadId: string) => {
        setIsDeleteModal(true),
        setSelectedDetedLoadId(loadId)
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100 mt-10">
                <ShipperProfileSidebar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex-grow">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="relative p-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center">
                                    <Truck className="mr-2" /> My Loads
                                </h2>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        {activeFilter} Loads
                                        <ChevronDown className="ml-2" size={20} />
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border">
                                            {['All', 'active', 'in-Transit'].map(filter => (
                                                <button
                                                    key={filter}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${activeFilter === filter
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : ''
                                                        }`}
                                                    onClick={() => handleFilterChange(filter as any)}
                                                >
                                                    {filter} Loads
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Load List */}
                            {filteredLoads.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No loads found in this category.
                                </div>
                            ) : (
                                filteredLoads.map(load => (
                                    <div
                                        key={load._id}
                                        className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="bg-gray-100 rounded-lg shadow-md p-2">
                                            <div className="flex justify-end">
                                                {load.status === 'active' && (
                                                    <div className="flex row-auto gap-5">
                                                        <Pencil className="mt-1 h-6 w-6 text-gray-800 cursor-pointer" onClick={() => { setUpdateModal(true), setSelectedUpdateLoad(load) }} />
                                                        <Trash2 className="mt-1 mr-3 text-red-500 cursor-pointer" onClick={() => hanldeDeleteConformation(load._id)} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-12 gap-4 mt-2">
                                                <div className="col-span-4 bg-white shadow rounded-md p-4">
                                                    <div className="flex items-center mb-3">
                                                        <MapPin className="mr-2 text-blue-500" />
                                                        <span className="font-semibold text-lg">
                                                            {load.pickupLocation} → {load.dropLocation}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Package className="mr-2 text-gray-400" />
                                                            <span>Material: {load.material}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Weight className="mr-2 text-gray-400" />
                                                            <span>Quantity: {load.quantity} Toones</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Truck className="mr-2 text-gray-400" />
                                                            <span>Truck Type: {load.truckType}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-span-4 bg-white shadow rounded-md p-4">
                                                    <h3 className="text-md font-semibold mb-3 flex items-center">
                                                        <Ruler className="mr-2 text-blue-500" /> Load Dimensions</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Expand className="mr-2 text-gray-400" />
                                                            <span>Length: {load.length ? load.length : 'NIL'} </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Box className="mr-2 text-gray-400" />
                                                            <span>Height: {load.height ? load.height : 'NIL'} </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Expand className="mr-2 text-gray-400" />
                                                            <span>Breadth: {load.breadth ? load.breadth : 'NIL'} </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pricing and Status */}
                                                <div className="col-span-4 bg-white shadow rounded-md p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <span className="font-bold text-lg">
                                                                ₹{load.transportationRent.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`px-3 py-1 rounded-full text-xs ${load.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : load.status === 'completed'
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-yellow-200 text-yellow-800'
                                                                }`}
                                                        >
                                                            {load.status}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Calendar className="mr-2" />
                                                            Scheduled Date: {new Date(load.scheduledDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Calendar className="mr-2" />
                                                            Created At: {new Date(load.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <FileText className="mr-2" />
                                                            Description: {load.descriptions}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
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

                {isDeleteModal && (
                    <div className="fixed inset-0  bg-opacity-50  backdrop-blur-xs flex items-center justify-center z-50">
                        <div className="bg-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4">
                            <div className="flex items-center justify-between p-4 ">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                    <h3 className="text-lg font-semibold text-white">
                                        Confirm Deletion
                                    </h3>
                                </div>
                                <button
                                    onClick={handleDeleteModalClose}
                                    className="text-white hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <p className="text-white">
                                    Are you sure you want to delete this item? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-3 p-4 rounded-b-lg  bg-gray-700">
                                <button
                                    onClick={handleDeleteModalClose}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {updateModal && selectedUpdateLoad && (
                    <UpdateLoadModal
                        isOpen={updateModal}
                        onClose={handleUpdateModalClose}
                        selectedLoad={selectedUpdateLoad}
                        onSubmit={handleUpdateSubmit}
                    />
                )}

            </div>


        </>
    )
}

export default MyLoads