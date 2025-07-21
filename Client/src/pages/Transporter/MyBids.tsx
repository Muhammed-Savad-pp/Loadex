import React, { useEffect, useState } from "react";
import Navbar from "../../components/Common/Navbar/Navbar";
import ProfileSidebar from "../../components/tranporter/ProfileSidebar";
import { bidCheckoutSession, fetchBids, fetchActiveTruck, updateBid, deleteBid, bidPaymentByWallet } from "../../services/transporter/transporterApi";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { Pencil, X, Trash2, AlertTriangle } from 'lucide-react';
import WalletPaymentModal from "../../components/tranporter/WalletPaymentModal";
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHEBLE_KEY;


interface IBids {
    _id: string;
    shipperId: {
        _id: string;
        shipperName: string;
        profileImage: string
    };
    transporterId: string
    loadId: {
        _id: string;
        pickupLocation: string;
        dropLocation: string;
        material: string;
        quantity: string;
        scheduledDate: Date;
        estimatedDistance?: string;
    };
    truckId: {
        _id: string;
        truckNo: string;
        truckType: string;
        capacity: string;
    };
    price: string;
    status: string;
    createAt: Date;
    shipperPayment: boolean;
    transporterPayment: boolean;
}

interface IActiveTruck {
    _id: string;
    truckNo: string;
}

interface IFormData {
    truckId: string;
    price: string;
}

interface IFormError {
    truckNo: string;
    price: string;
}

type FilterType = 'all' | 'requested' | 'accepted' | 'rejected' | 'expired';

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

const MyBids: React.FC = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [bids, setBids] = useState<IBids[]>([]);
    const [isUpdateModal, setUpdateModal] = useState<boolean>(false);
    const [selectedBid, setSelectedBid] = useState<IBids | null>(null);
    const [availableTrucks, setAvailableTrucks] = useState<IActiveTruck[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(50)
    const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
    const [deleteBidId, setDeleteBidId] = useState<string | null>(null);
    const [showPaymentSelection, setShowPaymentSelection] = useState<boolean>(false);
    const [paymentBidId, setPaymentBidId] = useState<string>('');
    const [formError, setFormError] = useState<IFormError>();
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [walletPaymentModalOpen, setWalletPaymentModalOpen] = useState<boolean>(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0)
    const [formData, setFormData] = useState<IFormData>({
        truckId: '',
        price: ''
    })
    const limit = 3;


    useEffect(() => {
        const findAllBids = async () => {
            try {

                setLoading(true)
                const response: any = await fetchBids(page, limit, activeFilter);
                setBids(response.bidDatas);
                setTotalPages(response.totalPages);

                const availableTrucks = await fetchActiveTruck();
                setAvailableTrucks(availableTrucks as IActiveTruck[])

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false)
            }
        }

        findAllBids()
    }, [page, activeFilter])

    console.log(bids);


    useEffect(() => {
        if (selectedBid) {
            setFormData({
                truckId: selectedBid.truckId._id,
                price: selectedBid.price
            })
        }

    }, [selectedBid])

    const getStatusStyle = (status: string): { bgColor: string, textColor: string } => {
        switch (status.toLowerCase()) {
            case 'requested':
                return { bgColor: 'bg-amber-100', textColor: 'text-amber-800' };
            case 'accepted':
                return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
            case 'rejected':
                return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
            case 'expired':
                return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
            default:
                return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
        }
    };

    const formatDate = (dateString: Date | string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const paymentByStripe = async () => {
        try {

            const stripe = await loadStripe(stripePublicKey);

            const response: any = await bidCheckoutSession(paymentBidId);
            if (response.success && stripe) {
                await stripe.redirectToCheckout({ sessionId: response.sessionId })
            } else {
                toast.error(response.message);
                window.location.reload()
            }

            setShowPaymentSelection(false);
            setPaymentBidId('')

        } catch (error) {
            console.log(error)
        }
    }


    const paymentByWallet = async () => {
        setWalletPaymentModalOpen(true)
       
    }

    const handlePayment = async (bidId: string, amount: string) => {
        setShowPaymentSelection(true);
        setPaymentBidId(bidId);
        const numbericNumber = Number(amount)
        setPaymentAmount(numbericNumber);
    }

    const handleWalletPaymnet = async () => {
         try {

            const response: any = await bidPaymentByWallet(paymentBidId);
            if (response.success) {
                toast.success(response.message);
                const bids: any = await fetchBids(page, limit, activeFilter);
                setBids(bids.bidDatas);
                setTotalPages(bids.totalPages);
            } else {
                toast.error(response.message)
            }

            setShowPaymentSelection(false);
            setPaymentBidId('')

        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdateModal = async (bid: IBids) => {
        setUpdateModal(true);
        setSelectedBid(bid);
    }

    const onClose = () => {
        setUpdateModal(false)
        setSelectedBid(null)
    }

    const validateForm = (formData: IFormData) => {

        const errors: Partial<IFormData> = {};

        if (!formData.price.trim()) errors.price = 'Transportection Cost is required'
        if (Number(formData.price) < 0) errors.price = 'Negative Number is accept.'
        if (!formData.truckId.trim()) errors.truckId = 'Truck is required';

        return errors;
    }

    const handleUpdateBid = async (e: React.FormEvent) => {
        e.preventDefault()

        const validateErrors = validateForm(formData);
        setFormError(validateErrors as IFormError)

        if (Object.keys(validateErrors).length > 0) {
            toast.error('Please fix the error before the submit')
            return;
        }

        try {

            const response: any = await updateBid(selectedBid?._id as string, formData.truckId, formData.price)
            if (response.success) {
                toast.success(response.message);
                const bids: any = await fetchBids(page, limit, activeFilter);
                setBids(bids.bidDatas);
                setTotalPages(bids.totalPages)
            } else {
                toast.error(response.message)
            }

            onClose()
            setSelectedBid(null)

        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteModal = (bidId: string) => {
        setIsDeleteModal(true);
        setDeleteBidId(bidId);
    }

    const handleDeleteModalClose = () => {
        setIsDeleteModal(false)
        setDeleteBidId(null)
    }

    const handleDelete = async () => {
        try {

            const response: any = await deleteBid(deleteBidId as string);
            if (response.success) {
                toast.success(response.message);
                setBids(prev =>
                    prev.filter(bid => bid._id !== response.BidData._id)
                )
            }

            handleDeleteModalClose()

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100 mt-10">
                <ProfileSidebar />
                <div className="flex-1 p-9 bg-gray-100">
                    <div className="bg-white rounded-lg shadow-md p-7">
                        <h1 className="text-2xl font-bold text-center border-b pb-2 mb-4">My Bids</h1>

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
                                                onClick={() => setActiveFilter(filter)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
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

                        {!loading && bids.length === 0 &&
                            (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <p className="mt-2 text-lg font-medium text-gray-600">No bids found</p>
                                    <p className="text-gray-500">No transporters have placed bids on your loads yet.</p>
                                </div>
                            )}

                        <div className="space-y-4">
                            {!loading && bids.map(bid => {
                                const statusStyle = getStatusStyle(bid.status);

                                return (
                                    <div key={bid._id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-3 hover:shadow-md transition-shadow">
                                        {/* Header Section */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={bid.shipperId.profileImage}
                                                        alt="Profile"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-2">
                                                    <h3 className="font-semibold text-base">{bid.shipperId.shipperName}</h3>
                                                </div>
                                            </div>

                                            <div className={`px-2 py-1 ${statusStyle.bgColor} ${statusStyle.textColor} rounded-full text-xs font-medium`}>
                                                {bid.status}
                                            </div>
                                            {bid.status === 'requested' && (
                                                <div className="flex row-auto gap-2">
                                                    <Pencil onClick={() => handleUpdateModal(bid)} className="text-blue-700 mr-2 cursor-pointer" />
                                                    <Trash2 className="text-red-400 cursor-pointer" onClick={() => handleDeleteModal(bid._id)} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Notification */}
                                        {bid.shipperPayment && !bid.transporterPayment && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded-lg mb-3 font-medium">
                                                {bid.shipperId?.shipperName} has paid. Please pay commission to confirm trip.
                                            </div>
                                        )}

                                        {/* Main Content */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-sm">
                                            <div>
                                                <span className="text-xs text-gray-500">Bid Amount</span>
                                                <p className="font-bold text-green-700">₹{bid.price}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Vehicle</span>
                                                <p className="font-medium truncate">{bid.truckId.truckType} • {bid.truckId.truckNo}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Capacity</span>
                                                <p className="font-medium">{bid.truckId.capacity}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Bid Date</span>
                                                <p className="font-medium">{formatDate(bid.createAt || new Date())}</p>
                                            </div>
                                        </div>

                                        {/* Route and Details Section */}
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                            {/* Route Visualization */}
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <div className="w-0.5 h-6 bg-gray-300 my-0.5"></div>
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                </div>
                                                <div className="space-y-1 text-sm min-w-0">
                                                    <div>
                                                        <p className="text-xs text-gray-500">From</p>
                                                        <p className="font-medium truncate">{bid.loadId.pickupLocation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">To</p>
                                                        <p className="font-medium truncate">{bid.loadId.dropLocation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Material Details */}
                                            <div className="flex gap-4 text-sm flex-wrap lg:flex-nowrap">
                                                <div className="min-w-[80px]">
                                                    <p className="text-xs text-gray-500">Material</p>
                                                    <p className="font-medium">{bid.loadId.material}</p>
                                                </div>
                                                <div className="min-w-[80px]">
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="font-medium">{bid.loadId.quantity}</p>
                                                </div>
                                                <div className="min-w-[100px]">
                                                    <p className="text-xs text-gray-500">Delivery Date</p>
                                                    <p className="font-medium">{formatDate(bid.loadId.scheduledDate)}</p>
                                                </div>
                                            </div>

                                            {/* Payment Button */}
                                            {bid.shipperPayment && !bid.transporterPayment && (
                                                <div className="flex-shrink-0">
                                                    <button
                                                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                                                        onClick={() => handlePayment(bid._id, bid.price)}
                                                    >
                                                        Pay Commission
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* { Pagination} */}
                        <div className="flex justify-center mt-6 mr-5">
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

                {isUpdateModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm transition-all">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
                                    {/* Header */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Update Bid</h2>
                                                <p className="text-sm text-gray-600 mt-1">Modify your bid details and truck assignment</p>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                                                type="button"
                                            >
                                                <X className="h-6 w-6 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Bid Summary Card */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm">
                                                        <img
                                                            src={selectedBid?.shipperId.profileImage || "/api/placeholder/40/40"}
                                                            alt="Shipper Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="font-semibold text-lg text-gray-900">{selectedBid?.shipperId.shipperName}</h3>
                                                        <p className="text-sm text-gray-600">Bid ID: {selectedBid?._id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">₹{selectedBid?.price}</p>
                                                    <p className="text-xs text-gray-500">Current Bid Amount</p>
                                                </div>
                                            </div>

                                            {/* Route Information */}
                                            <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">FROM</p>
                                                        <p className="font-semibold text-gray-800">{selectedBid?.loadId.pickupLocation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">TO</p>
                                                        <p className="font-semibold text-gray-800">{selectedBid?.loadId.dropLocation}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Material</p>
                                                        <p className="font-medium">{selectedBid?.loadId.material}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Quantity</p>
                                                        <p className="font-medium">{selectedBid?.loadId.quantity}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Delivery Date</p>
                                                        <p className="font-medium">{formatDate(selectedBid?.loadId.scheduledDate || new Date())}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Distance</p>
                                                        <p className="font-medium">{selectedBid?.loadId.estimatedDistance || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Update Form */}
                                        <form onSubmit={handleUpdateBid} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Select Truck <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={formData.truckId}
                                                        onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        required
                                                    >
                                                        {availableTrucks?.map((truck) => (
                                                            <option key={truck._id} value={truck._id}>
                                                                {truck.truckNo.toUpperCase()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formError?.truckNo && (
                                                        <p className="text-sm mt-1 text-red-600">{formError.truckNo}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">Current: {selectedBid?.truckId.truckNo} - {selectedBid?.truckId.truckType}</p>
                                                </div>

                                                {/* Bid Amount */}
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Bid Amount (₹) <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                                        <input
                                                            type="number"
                                                            value={formData.price}
                                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                            placeholder="Enter bid amount"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                        {formError?.price && (
                                                            <p className="text-sm text-red-600 mt-1">{formError.price}</p>
                                                        )}

                                                    </div>
                                                </div>

                                            </div>
                                            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : (
                                                        <span>Update Bid</span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showPaymentSelection && (
                    <div className="fixed inset-0 z-50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md animate-fadeIn">
                            <h2 className="text-xl font-semibold mb-4 text-center">Choose Payment Method</h2>

                            <div className="space-y-4">
                                <button
                                    onClick={paymentByStripe}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    Pay with Stripe
                                </button>

                                <button
                                    onClick={paymentByWallet}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                                >
                                    Pay with Wallet
                                </button>
                            </div>

                            <button
                                onClick={() => setShowPaymentSelection(false)}
                                className="mt-6 w-full px-4 py-2 text-sm text-gray-600 hover:text-black"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                { walletPaymentModalOpen && (
                    <WalletPaymentModal
                        isOpen={walletPaymentModalOpen}
                        onClose={() => setWalletPaymentModalOpen(false)}
                        onPayment={handleWalletPaymnet}
                        bidId={paymentBidId}
                        requiredAmount={paymentAmount}
                    />
                )}

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



            </div>
        </>
    )

}

export default MyBids