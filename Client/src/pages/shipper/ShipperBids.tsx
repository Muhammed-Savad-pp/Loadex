// import React, { useEffect, useState } from "react";
// import Navbar from "../../components/Common/Navbar/Navbar";
// import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
// import { checkoutSession, fetchBids, updateBidStatus } from "../../services/shipper/shipperService";
// import toast from "react-hot-toast";
// import Footer from "../../components/Common/footer/Footer";
// import { loadStripe } from "@stripe/stripe-js";
// const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHEBLE_KEY;


// interface IBids {
//     _id: string;
//     shipperId: string;
//     transporterId: {
//         _id: string;
//         transporterName: string;
//         profileImage?: string;
//     };
//     loadId: {
//         _id: string;
//         pickupLocation: string;
//         dropLocation: string;
//         material: string;
//         quantity: string;
//         scheduledDate: Date;
//     };
//     truckId: {
//         _id: string;
//         truckNo: string;
//         truckType: string;
//         capacity: string;
//     };
//     price: string;
//     status: string;
//     bidDate: Date;
//     shipperPayment: boolean;
//     transporterPayment: boolean;
// }

// const formatDate = (dateString: Date | string): string => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// };

// const getStatusStyle = (status: string): { bgColor: string, textColor: string } => {
//     switch (status.toLowerCase()) {
//         case 'requested':
//             return { bgColor: 'bg-amber-100', textColor: 'text-amber-800' };
//         case 'accepted':
//             return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
//         case 'rejected':
//             return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
//         default:
//             return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
//     }
// };

// const ShipperBids: React.FC = () => {
//     const [loading, setLoading] = useState<boolean>(false);
//     const [bids, setBids] = useState<IBids[]>([]);
//     const [page, setPage] = useState<number>(1);
//     const [totalPages, setTotalPages] = useState<number>(20);
//     const limit = 3;

//     useEffect(() => {
//         const findBids = async () => {
//             try {
//                 setLoading(true);
//                 const response: any = await fetchBids(page, limit);
//                 console.log(response);
//                 setBids(response.bidData);
//                 setTotalPages(response.totalPages)
//             } catch (error) {
//                 console.error(error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         findBids();
//     }, []);


//     const handleStatus = async (bidId: string, status: string) => {
//         try {
//             if (status == 'accepted') {
//                 const stripe = await loadStripe(stripePublicKey);
//                 const response: any = await checkoutSession(bidId);

//                 if (response.success && stripe) {
//                     await stripe.redirectToCheckout({ sessionId: response.sessionId })
//                 } else {
//                     toast.error('Stripe session failed.')
//                 }
//             } else {

//                 const response: any = await updateBidStatus(bidId, status);
//                 if (response.success) {
//                     toast.success(response.message);
//                 } else {
//                     toast.error(response.message)
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     return (
//         <>
//             <Navbar />
//             <div className="flex min-h-screen bg-gray-100 mt-10">
//                 <ShipperProfileSidebar />
//                 <div className="flex-1 p-9 bg-gray-100">
//                     <div className="bg-white rounded-lg shadow-md p-7">
//                         <h1 className="text-2xl font-bold text-center border-b pb-2 mb-4">My Bids</h1>
//                         {loading && (
//                             <div className="text-center py-8">
//                                 <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
//                                 <p className="mt-2 text-gray-600">Loading bids...</p>
//                             </div>
//                         )}

//                         {!loading && bids.length === 0 && (
//                             <div className="text-center py-12 bg-gray-50 rounded-lg">
//                                 <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                                 </svg>
//                                 <p className="mt-2 text-lg font-medium text-gray-600">No bids found</p>
//                                 <p className="text-gray-500">No transporters have placed bids on your loads yet.</p>
//                             </div>
//                         )}

//                         <div className="space-y-4">
//                             {!loading && bids.map(bid => {
//                                 const statusStyle = getStatusStyle(bid.status);

//                                 return (
//                                     <div key={bid._id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:shadow-md transition-shadow">
//                                         <div className="flex flex-col md:flex-row justify-between gap-3">
//                                             <div className="flex-1 space-y-3 w-full">
//                                                 {/* Header with profile and status */}
//                                                 <div className="flex items-center justify-between">
//                                                     <div className="flex items-center">
//                                                         {/* Profile image container - reduced size */}
//                                                         <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
//                                                             <img
//                                                                 src={bid.transporterId.profileImage || "/api/placeholder/48/48"}
//                                                                 alt="Profile"
//                                                                 className="h-full w-full object-cover"
//                                                             />
//                                                         </div>
//                                                         <div className="ml-3">
//                                                             <h3 className="font-semibold text-lg">{bid.transporterId.transporterName}</h3>
//                                                         </div>
//                                                     </div>
//                                                     {
//                                                         bid.shipperPayment && !bid.transporterPayment ?
//                                                             <div className="text-yellow-600 font-semibold">
//                                                                 Waiting for transporter to complete payment to confirm the trip.
//                                                             </div>
//                                                             : ''
//                                                     }

//                                                     <div className={`px-2 py-0.5 ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full text-xs font-medium`}>
//                                                         {bid.status}
//                                                     </div>
//                                                 </div>

//                                                 {/* Bid Details - Compact Layout */}
//                                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 border-t border-b border-gray-100 text-sm">
//                                                     <div>
//                                                         <span className="text-xs text-gray-500">Bid Amount</span>
//                                                         <p className="font-bold text-green-700">₹{bid.price}</p>
//                                                     </div>
//                                                     <div>
//                                                         <span className="text-xs text-gray-500">Vehicle</span>
//                                                         <p className="font-medium truncate">{bid.truckId.truckType} • {bid.truckId.truckNo}</p>
//                                                     </div>
//                                                     <div>
//                                                         <span className="text-xs text-gray-500">Capacity</span>
//                                                         <p className="font-medium">{bid.truckId.capacity}</p>
//                                                     </div>
//                                                     <div className="text-right md:text-left">
//                                                         <span className="text-xs text-gray-500">Bid Date</span>
//                                                         <p className="font-medium">{formatDate(bid.bidDate || new Date())}</p>
//                                                     </div>
//                                                 </div>

//                                                 {/* Combined row with Location, Material Details, and Buttons */}
//                                                 <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
//                                                     {/* From-To Location */}
//                                                     <div className="flex items-start space-x-2">
//                                                         <div className="flex flex-col items-center">
//                                                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                                                             <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
//                                                             <div className="w-2 h-2 rounded-full bg-red-500"></div>
//                                                         </div>
//                                                         <div className="space-y-2 text-sm">
//                                                             <div>
//                                                                 <p className="text-xs text-gray-500">From</p>
//                                                                 <p className="font-medium">{bid.loadId.pickupLocation}</p>
//                                                             </div>
//                                                             <div>
//                                                                 <p className="text-xs text-gray-500">To</p>
//                                                                 <p className="font-medium">{bid.loadId.dropLocation}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex gap-3 md:gap-6 text-sm w-full justify-start ml-33">
//                                                         <div className="min-w-[90px]">
//                                                             <p className="text-xs text-gray-500">Material</p>
//                                                             <p className="font-medium">{bid.loadId.material}</p>
//                                                         </div>
//                                                         <div className="min-w-[90px]">
//                                                             <p className="text-xs text-gray-500">Quantity</p>
//                                                             <p className="font-medium">{bid.loadId.quantity}</p>
//                                                         </div>
//                                                         <div className="min-w-[120px]">
//                                                             <p className="text-xs text-gray-500">Delivery Date</p>
//                                                             <p className="font-medium">{formatDate(bid.loadId.scheduledDate)}</p>
//                                                         </div>
//                                                     </div>

//                                                     {
//                                                         bid.status === 'requested' && !bid.shipperPayment ?
//                                                             <div className="flex space-x-2">
//                                                                 <button
//                                                                     onClick={() => handleStatus(bid._id, 'accepted')}
//                                                                     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
//                                                                 >
//                                                                     Accept
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={() => handleStatus(bid._id, 'rejected')}
//                                                                     className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
//                                                                 >
//                                                                     Reject
//                                                                 </button>
//                                                             </div> :
//                                                             ''

//                                                     }

//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}

//                             <div className="flex justify-center mt-6">
//                                 <div className="inline-flex rounded-md shadow-sm">
//                                     <button
//                                         onClick={() => setPage(page - 1)}
//                                         disabled={page === 1}
//                                         className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
//                                     ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
//                                         Prev
//                                     </button>
//                                     {Array.from({ length: totalPages }, (_, i) => i + 1)
//                                         .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
//                                         .map((p) => (
//                                             <button className={`px-3 py-2 ml-1  mr-1 text-sm rounded-md font-medium border-t border-b border-gray-300 cursor-pointer
//                                             ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
//                                                 {p}
//                                             </button>
//                                         ))
//                                     }
//                                     <button
//                                         onClick={() => setPage(page + 1)}
//                                         disabled={page === totalPages}
//                                         className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
//                                         ${page === totalPages ? 'bg-gray-100 text-gray-400 not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}'}`}>
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//         </>
//     );
// };

// export default ShipperBids;

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ShipperProfileSidebar from "../../components/shipper/ShipperProfileSidebar";
import { checkoutSession, fetchBids, updateBidStatus } from "../../services/shipper/shipperService";
import toast from "react-hot-toast";
import Footer from "../../components/Common/footer/Footer";
import { loadStripe } from "@stripe/stripe-js";
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHEBLE_KEY;


interface IBids {
    _id: string;
    shipperId: string;
    transporterId: {
        _id: string;
        transporterName: string;
        profileImage?: string;
    };
    loadId: {
        _id: string;
        pickupLocation: string;
        dropLocation: string;
        material: string;
        quantity: string;
        scheduledDate: Date;
    };
    truckId: {
        _id: string;
        truckNo: string;
        truckType: string;
        capacity: string;
        truckImage: string;
    };
    price: string;
    status: string;
    bidDate: Date;
    shipperPayment: boolean;
    transporterPayment: boolean;
}

type FilterType = 'all' | 'requested' | 'accepted' | 'rejected' | 'expired';

const formatDate = (dateString: Date | string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusStyle = (status: string): { bgColor: string, textColor: string } => {
    switch (status.toLowerCase()) {
        case 'requested':
            return { bgColor: 'bg-amber-100', textColor: 'text-amber-800' };
        case 'accepted':
            return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
        case 'rejected':
            return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
        case 'expired':
            return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
        default:
            return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
};

const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
        case 'all':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
        case 'requested':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'accepted':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'rejected':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'expired':
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            );
        default:
            return null;
    }
};

const ShipperBids: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [bids, setBids] = useState<IBids[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(20);
    const limit = 3;

    useEffect(() => {
        const findBids = async () => {
            try {
                setLoading(true);
                const response: any = await fetchBids(page, limit, activeFilter);
                console.log(response);
                setBids(response.bidData);
                setTotalPages(response.totalPages)
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        findBids();
    }, [page, activeFilter]);

    const filterBids = (filter: FilterType) => {
        setActiveFilter(filter);   
    };


    const handleStatus = async (bidId: string, status: string) => {
        try {
            if (status == 'accepted') {
                const stripe = await loadStripe(stripePublicKey);
                const response: any = await checkoutSession(bidId);

                if (response.success && stripe) {
                    await stripe.redirectToCheckout({ sessionId: response.sessionId })
                } else {
                    toast.error(response.message)
                    window.location.reload()
                }
            } else {

                const response: any = await updateBidStatus(bidId, status);
                if (response.success) {
                    toast.success(response.message);
                } else {
                    toast.error(response.message)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100 mt-10">
                <ShipperProfileSidebar />
                <div className="flex-1 p-9 bg-gray-100">
                    <div className="bg-white rounded-lg shadow-md p-7">
                        <h1 className="text-2xl font-bold text-center border-b pb-2 mb-6">My Bids</h1>
                        <div className="mb-6">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                        </svg>
                                        Filter Bids
                                    </h3>
                                    
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {(['all', 'requested', 'accepted', 'rejected', 'expired'] as FilterType[]).map((filter) => {
                                        const isActive = activeFilter === filter;
                                        
                                        return (
                                            <button
                                                key={filter}
                                                onClick={() => filterBids(filter)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-white text-green-700 shadow-md border-2 border-green-200 transform scale-105'
                                                        : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200'
                                                }`}
                                            >
                                                <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
                                                    {getFilterIcon(filter)}
                                                </span>
                                                <span className="capitalize font-semibold">{filter}</span>
                                             
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {loading && (
                            <div className="text-center py-8">
                                <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto animate-spin"></div>
                                <p className="mt-2 text-gray-600">Loading bids...</p>
                            </div>
                        )}

                        {!loading && bids.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <p className="mt-2 text-lg font-medium text-gray-600">
                                    {activeFilter === 'all' ? 'No bids found' : `No ${activeFilter} bids found`}
                                </p>
                                <p className="text-gray-500">
                                    {activeFilter === 'all' 
                                        ? 'No transporters have placed bids on your loads yet.' 
                                        : `Try selecting a different filter to see more bids.`
                                    }
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {!loading && bids.map(bid => {
                                const statusStyle = getStatusStyle(bid.status);

                                return (
                                    <div key={bid._id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between gap-3">
                                            <div className="flex-1 space-y-3 w-full">
                                                {/* Header with profile and status */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {/* Profile image container - reduced size */}
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={bid.transporterId.profileImage || "/api/placeholder/48/48"}
                                                                alt="Profile"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="font-semibold text-lg">{bid.transporterId.transporterName}</h3>
                                                        </div>
                                                    </div>
                                                    {
                                                        bid.shipperPayment && !bid.transporterPayment ?
                                                            <div className="text-yellow-600 font-semibold">
                                                                Waiting for transporter to complete payment to confirm the trip.
                                                            </div>
                                                            : ''
                                                    }

                                                    <div className={`px-2 py-0.5 ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full text-xs font-medium`}>
                                                        {bid.status}
                                                    </div>
                                                </div>

                                                {/* Bid Details - Compact Layout */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-2 border-t border-b border-gray-100 text-sm">
                                                    <div>
                                                        <span className="text-xs text-gray-500">Bid Amount</span>
                                                        <p className="font-bold text-green-700">₹{bid.price}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Vehicle</span>
                                                        <p className="font-medium truncate">{bid.truckId.truckType} • {bid.truckId.truckNo}</p>
                                                    </div>
                                                    <div className=" flex">
                                                        <img className="w-26 h-20 object-cover rounded-md ml-15" src={bid.truckId.truckImage} alt="truckImage" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-gray-500">Capacity</span>
                                                        <p className="font-medium">{bid.truckId.capacity}</p>
                                                    </div>
                                                    
                                                    <div className="text-right md:text-left">
                                                        <span className="text-xs text-gray-500">Bid Date</span>
                                                        <p className="font-medium">{formatDate(bid.bidDate || new Date())}</p>
                                                    </div>
                                                </div>

                                                {/* Combined row with Location, Material Details, and Buttons */}
                                                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                                                    {/* From-To Location */}
                                                    <div className="flex items-start space-x-2">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            <div className="w-0.5 h-10 bg-gray-300 my-1"></div>
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                        </div>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <p className="text-xs text-gray-500">From</p>
                                                                <p className="font-medium">{bid.loadId.pickupLocation}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">To</p>
                                                                <p className="font-medium">{bid.loadId.dropLocation}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 md:gap-6 text-sm w-full justify-start ml-33">
                                                        <div className="min-w-[90px]">
                                                            <p className="text-xs text-gray-500">Material</p>
                                                            <p className="font-medium">{bid.loadId.material}</p>
                                                        </div>
                                                        <div className="min-w-[90px]">
                                                            <p className="text-xs text-gray-500">Quantity</p>
                                                            <p className="font-medium">{bid.loadId.quantity}</p>
                                                        </div>
                                                        <div className="min-w-[120px]">
                                                            <p className="text-xs text-gray-500">Delivery Date</p>
                                                            <p className="font-medium">{formatDate(bid.loadId.scheduledDate)}</p>
                                                        </div>
                                                    </div>

                                                    {
                                                        bid.status === 'requested' && !bid.shipperPayment ?
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleStatus(bid._id, 'accepted')}
                                                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatus(bid._id, 'rejected')}
                                                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div> :
                                                            ''

                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

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
            </div>
            <Footer />
        </>
    );
};

export default ShipperBids;