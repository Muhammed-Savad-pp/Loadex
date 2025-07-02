import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Common/Navbar/Navbar'
import { Search, Calendar, DollarSign, Eye, Package, CreditCard } from 'lucide-react';
import { fetchPaymentHistory } from '../../services/shipper/shipperService';
import ShipperProfileSidebar from '../../components/shipper/ShipperProfileSidebar';


interface ITransporterPayment {
  _id: string
  transactionId?: string
  bidId?: string
  planId?: string
  shipperId: string
  paymentType: 'bid' | 'subscription'
  amount: number
  paymentStatus: 'pending' | 'success' | 'failed'
  createdAt: Date;
  transactionType: 'credit' | 'debit';
}

type StatusFilter = 'all' | 'success' | 'pending' | 'failed'
type TypeFilter = 'all' | 'bid' | 'subscription'
type DateFilter = 'all' | 'today' | 'week' | 'month'

const PaymentHistory: React.FC = () => {
  // const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [selectedPayment, setSelectedPayment] = useState<ITransporterPayment | null>(null);
  const [paymentDatas, setPaymentDatas] = useState<ITransporterPayment[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(20);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [bidPayments, setBidPayments] = useState<number>(0);
  const [subscriptionPayments, setSubscriptionPayments] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0)
  const limit = 5

  useEffect(() => {

    const PaymentHistory = async () => {
      const response: any = await fetchPaymentHistory(statusFilter, typeFilter, dateFilter, page, limit);
      setPaymentDatas(response.paymentData)
      setTotalPages(response.totalPages);
      setTotalEarnings(response.totalEarnings);
      setBidPayments(response.bidPayments);
      setSubscriptionPayments(response.subscriptionPayment);
      setPendingAmount(response.pendingAmount)
    }

    PaymentHistory();
  }, [statusFilter, typeFilter, dateFilter, page]);
 
  const getStatusBadge = (status: ITransporterPayment['paymentStatus']): JSX.Element => {
    const statusConfig: Record<ITransporterPayment['paymentStatus'], string> = {
      success: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPaymentTypeInfo = (payment: ITransporterPayment) => {
    if (payment.paymentType === 'bid') {
      return {
        label: 'Load Payment',
        description: `Bid ID: ${payment.bidId?.toString().slice(-6)}`,
        icon: <Package className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-100'
      }
    } else {
      return {
        label: 'Subscription',
        description: `Plan: ${payment.planId}`,
        icon: <CreditCard className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-100'
      }
    }
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getPlanDisplayName = (planId?: string): string => {
    if (!planId) return 'N/A'

    const planNames: Record<string, string> = {
      'basic_monthly': 'Basic Monthly Plan',
      'premium_monthly': 'Premium Monthly Plan',
      'basic_yearly': 'Basic Yearly Plan',
      'premium_yearly': 'Premium Yearly Plan'
    }

    return planNames[planId] || planId
  }

  return (
    <>
      <Navbar />
      <div className='flex min-h-screen bg-gray-50 mt-10'>
        <ShipperProfileSidebar />

        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
            <p className="text-gray-600">Track your load payments and subscription transactions</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Load Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{bidPayments}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{subscriptionPayments}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-end">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto ">
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by transaction ID, bid ID, or plan..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div> */}

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  >
                    <option value="all">All Types</option>
                    <option value="bid">Load Payments</option>
                    <option value="subscription">Subscriptions</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentDatas.map((payment) => {
                    const typeInfo = getPaymentTypeInfo(payment)
                    return (
                      <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.transactionId?.toString().slice(-18)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.paymentType === 'bid'
                                ? `Bid: ${payment.bidId?.toString().slice(-8)}`
                                : getPlanDisplayName(payment.planId)
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                            <br />
                            <span className={`text-xs ${payment.transactionType === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{payment.transactionType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            

            {paymentDatas.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
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

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0  backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payment ID</label>
                <p className="text-sm text-gray-900">{selectedPayment._id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="text-sm text-gray-900 break-words whitespace-normal">{selectedPayment.transactionId || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Payment Type</label>
                <div className="mt-1">
                  {(() => {
                    const typeInfo = getPaymentTypeInfo(selectedPayment)
                    return (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {selectedPayment.paymentType === 'bid' && selectedPayment.bidId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bid ID</label>
                  <p className="text-sm text-gray-900">{selectedPayment.bidId.toString()}</p>
                </div>
              )}

              {selectedPayment.paymentType === 'subscription' && selectedPayment.planId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
                  <p className="text-sm text-gray-900">{getPlanDisplayName(selectedPayment.planId)}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedPayment.paymentStatus)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 bg-gray-300 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PaymentHistory  