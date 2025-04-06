import React, { useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import { Truck, Package, MapPin, Calendar, ChevronDown, Ruler, Box, Weight, Expand } from 'lucide-react';
import { fetchLoads } from "../../services/shipper/shipperService";

interface LoadData {
    _id: string;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    length: string;
    truckType: string;
    transportationRent: string;
    height: string;
    breadth: string;
    status: 'active' | 'in-Transit';
    scheduledDate: Date;
    createdAt: Date;
}

const MyLoads: React.FC = () => {
    const [loads, setLoads] = useState<LoadData[]>([]);
    const [activeFilter, setActiveFilter] = useState<'All' | 'active' | 'in-Transit'>('All');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const getLoads = async () => {
            const response = await fetchLoads();
            console.log(response);
            setLoads(response as LoadData[])
        }
        getLoads()
    }, [])

    const filteredLoads = loads.filter(load =>
        activeFilter === 'All' || load.status === activeFilter
    );

    const handleFilterChange = (filter: 'All' | 'active' | 'in-Transit') => {
        setActiveFilter(filter);
        setIsDropdownOpen(false);
    };

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100">
                <ShipperProfileSidebar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex-grow">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {/* Filter Dropdown */}
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
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                                        activeFilter === filter 
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
                                            <div className="grid grid-cols-12 gap-4">
                                                {/* Location and Basic Info */}
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

                                                {/* Dimensions */}
                                                <div className="col-span-4 bg-white shadow rounded-md p-4">
                                                    <h3 className="text-md font-semibold mb-3 flex items-center">
                                                        <Ruler className="mr-2 text-blue-500" /> Load Dimensions</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Expand className="mr-2 text-gray-400" />
                                                            <span>Length: {load.length ? load.length  : 'NIL'} </span>
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
                                                        <div className={`px-3 py-1 rounded-full text-xs ${
                                                            load.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MyLoads