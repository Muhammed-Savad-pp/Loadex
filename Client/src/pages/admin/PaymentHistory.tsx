import { Search, Filter, ChevronDown } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/admin/Sidebar';
import { fetchPaymentHistory } from '../../services/admin/adminapi';
import { debounce } from 'lodash';

interface IPaymentData {
    transactionId: string;
    userType: 'shipper' | 'transporter';
    userId: string;
    amount: number;
    tripId?: {
        _id: string
    };
    transactionType: 'credit' | 'debit';
    paymentFor: 'bid' | 'subscription' | 'refund' | 'trip';
    bidId?: {
        _id: string
    };
    subscriptionId?: string;
    paymentStatus: 'pending' | 'success' | 'failed';
    paymentMethod?: 'stripe' | 'wallet';
    createdAt: Date;
    updatedAt: Date;
}

function PaymentHistory() {
    const [paymentDatas, setPaymentDatas] = useState<IPaymentData[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [userTypeFilter, setUserTypeFilter] = useState('all')
    const [paymentForFilter, setPaymentForFilter] = useState('all')
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(20);
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const limit = 6

    const debounceSearch = useCallback(
        debounce((value: string) => {
          setDebouncedSearch(value);
        }, 1000),
        []
      );
    
      const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        debounceSearch(e.target.value)
      }
    

    useEffect(() => {
        const getPaymentDatas = async () => {
            const response: any = await fetchPaymentHistory(debouncedSearch, statusFilter, userTypeFilter, paymentForFilter, page, limit);
            console.log(response, 'res');

            setPaymentDatas(response.paymentData);
            setTotalPages(response.totalPages)
        }
        getPaymentDatas()
    }, [statusFilter, userTypeFilter, paymentForFilter, page, limit, debouncedSearch])


    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
        switch (status) {
            case 'success':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'pending':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'failed':
                return `${baseClasses} bg-red-100 text-red-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getTransactionTypeIcon = (type: string) => {
        return type === 'credit' ? '↗️' : '↙️'
    }


    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Placeholder */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment History</h1>
                    <p className="text-gray-600">Manage and monitor all payment transactions</p>
                </div>

                {/* Header Actions */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by transaction ID"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="success">Success</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                                    <select
                                        value={userTypeFilter}
                                        onChange={(e) => setUserTypeFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="shipper">Shipper</option>
                                        <option value="transporter">Transporter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment For</label>
                                    <select
                                        value={paymentForFilter}
                                        onChange={(e) => setPaymentForFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="trip">Trip</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="bid">Bid</option>
                                        <option value="refund">Refund</option>
                                    </select>
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <div className="flex space-x-2">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="createdAt">Date</option>
                                            <option value="amount">Amount</option>
                                            <option value="paymentStatus">Status</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <ArrowUpDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-green-600 text-xl">💰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredAndSortedData.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-blue-600 text-xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredAndSortedData.filter(p => p.paymentStatus === 'success').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-yellow-600 text-xl">⏳</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredAndSortedData.filter(p => p.paymentStatus === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <span className="text-red-600 text-xl">❌</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredAndSortedData.filter(p => p.paymentStatus === 'failed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Payment Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentDatas.map((payment, _) => (
                                    <tr key={_} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.transactionId.toString().slice(0, 20)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.paymentFor} • {payment.paymentMethod || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.userId}
                                                </div>
                                                <div className="text-sm text-gray-500 capitalize">
                                                    {payment.userType}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-1">
                                                    {getTransactionTypeIcon(payment.transactionType)}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ₹ {payment.amount}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">
                                                        {payment.transactionType}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 capitalize">
                                                {payment.paymentFor}
                                            </div>
                                            {payment.tripId && (
                                                <div className="text-xs text-gray-500">
                                                    Trip: {payment.tripId._id}
                                                </div>
                                            )}
                                            {payment.bidId && (
                                                <div className="text-xs text-gray-500">
                                                    Bid: {payment.bidId._id}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getStatusBadge(payment.paymentStatus)}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(payment.createdAt)}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>



                    {paymentDatas.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-2">No payments found</div>
                            <div className="text-gray-500">Try adjusting your search or filters</div>
                        </div>
                    )}
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

                        {(() => {
                            const startPage = Math.max(1, page - 2);
                            const endPage = Math.min(totalPages, startPage + 4);
                            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
                                .map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-2 mx-1 text-sm rounded-md font-medium border border-gray-300 cursor-pointer
                            ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                        {p}
                                    </button>
                                ));
                        })()}

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
                    ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                            Next
                        </button>
                    </div>
                </div>



            </div>
        </div>
    )
}

export default PaymentHistory