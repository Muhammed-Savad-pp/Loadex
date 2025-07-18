import { useEffect, useState } from 'react';
import { Eye, Phone, Mail, Truck, MapPin, Package, CreditCard, X, Check, Clock, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import { fetchTrips, sendTripAmountToTransporter } from '../../services/admin/adminapi';
import toast from 'react-hot-toast';



interface ITrips {
  _id: string;
  transporterId: {
    _id: string;
    transporterName: string;
    profileImage: string;
    phone: string;
    email: string;
  };
  shipperId: {
    _id: string;
    shipperName: string;
    profileImage: string;
    phone: string;
    email: string;
  };
  loadId: {
    _id: string;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    scheduledDate: Date;
    distanceInKm: number;
  };
  truckId: {
    _id: string;
    truckOwnerName: string;
    truckOwnerMobileNo: string;
    truckNo: string;
    truckType: string;
    driverName: string;
    driverMobileNo: string;
  };
  price: string;
  tripStatus: string;
  confirmedAt: Date;
  progressAt: Date | null;
  arrivedAt: Date | null;
  completedAt: Date | null;
  adminPayment: boolean
}

function Trips() {
  const [trips, setTrips] = useState<ITrips[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<ITrips | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const limit = 5;

  console.log(search);
  console.log(filterStatus);


  useEffect(() => {
    const getTrips = async () => {
      const response: any = await fetchTrips(page, limit, search, filterStatus);
      setTrips(response.tripsData);
      setTotalPages(response.totalPages)
    }

    getTrips()
  }, [page, limit, search, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'arrived': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Truck className="w-4 h-4" />;
      case 'arrived': return <MapPin className="w-4 h-4" />;
      case 'completed': return <Check className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    // Simulate payment processing
    // setTimeout(() => {
    //   setPaymentProcessing(false);
    //   setShowPaymentModal(false);
    //   alert('Payment processed successfully!');
    // }, 2000);

    try {

      const response: any = await sendTripAmountToTransporter(selectedTrip?._id as string, selectedTrip?.price as string);
      if (response.success) {
        toast.success(response.message);
        setPaymentProcessing(false);
        setShowPaymentModal(false)
      }

    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className=" flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage all transportation trips</p>
        </div>

        {/* Trips Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden w-full">
          <div className="px-6 py-4 border-b border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search by truck/material"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
            </select>
          </div>


          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-fixed divide-y divide-gray-200 w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 min-h-[400px]">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    {/* Truck + Load */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trip.truckId.truckNo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trip.loadId.material} • {trip.loadId.quantity}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Pickup & Drop */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trip.loadId.pickupLocation}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {trip.loadId.dropLocation}
                      </div>
                      <div className="text-xs text-gray-400">
                        {trip.loadId.distanceInKm} km
                      </div>
                    </td>

                    {/* Trip Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(trip.tripStatus)}`}>
                        {getStatusIcon(trip.tripStatus)}
                        <span className="ml-1">{trip.tripStatus.replace('-', ' ')}</span>
                      </span>
                      {trip.tripStatus === 'completed' && !trip.adminPayment && (
                        <span className="inline-flex items-center text-red-500 bg-red-200 px-2.5 py-0.5 rounded-full text-xs ml-1">Pay Rent</span>
                      )}
                    </td>

                    {/* Transporter Info - Moved Right */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={trip.transporterId.profileImage}
                          alt=""
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {trip.transporterId.transporterName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trip.transporterId.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price - Moved Right */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {trip.price}
                      </div>
                    </td>

                    {/* View Details Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTrip(trip)}
                        className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>

                ))}
              </tbody>
            </table>
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

        {/* Trip Details Modal */}
        {selectedTrip && (
          <div className="fixed inset-0  backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5  w-11/12 max-w-4xl shadow-lg rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-6 ">
                <h3 className="text-2xl font-bold text-gray-900">Trip Details</h3>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trip Status & Timeline */}
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Trip Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium">Confirmed</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedTrip.confirmedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {selectedTrip.progressAt && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">In Progress</p>
                          <p className="text-sm text-gray-500">
                            {new Date(selectedTrip.progressAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTrip.arrivedAt && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Arrived</p>
                          <p className="text-sm text-gray-500">
                            {new Date(selectedTrip.arrivedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTrip.completedAt && (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Completed</p>
                          <p className="text-sm text-gray-500">
                            {new Date(selectedTrip.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Load Information */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Load Information
                  </h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Material:</span> {selectedTrip.loadId.material}</p>
                    <p><span className="font-medium">Quantity:</span> {selectedTrip.loadId.quantity}</p>
                    <p><span className="font-medium">Pickup:</span> {selectedTrip.loadId.pickupLocation}</p>
                    <p><span className="font-medium">Drop:</span> {selectedTrip.loadId.dropLocation}</p>
                    <p><span className="font-medium">Distance:</span> {selectedTrip.loadId.distanceInKm} km</p>
                    <p><span className="font-medium">Scheduled:</span> {new Date(selectedTrip.loadId.scheduledDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Transporter Details */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Transporter Details</h4>
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedTrip.transporterId.profileImage}
                      alt=""
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-medium">{selectedTrip.transporterId.transporterName}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedTrip.transporterId.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedTrip.transporterId.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipper Details */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Shipper Details</h4>
                  <div className="flex items-center mb-4">
                    <img
                      src={selectedTrip.shipperId.profileImage}
                      alt=""
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-medium">{selectedTrip.shipperId.shipperName}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedTrip.shipperId.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedTrip.shipperId.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Truck Details */}
                <div className="bg-yellow-50 p-6 rounded-lg lg:col-span-2">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Truck & Driver Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Truck Information</h5>
                      <p><span className="font-medium">Owner:</span> {selectedTrip.truckId.truckOwnerName}</p>
                      <p><span className="font-medium">Contact:</span> {selectedTrip.truckId.truckOwnerMobileNo}</p>
                      <p><span className="font-medium">Truck No:</span> {selectedTrip.truckId.truckNo}</p>
                      <p><span className="font-medium">Type:</span> {selectedTrip.truckId.truckType}</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Driver Information</h5>
                      <p><span className="font-medium">Name:</span> {selectedTrip.truckId.driverName}</p>
                      <p><span className="font-medium">Contact:</span> {selectedTrip.truckId.driverMobileNo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-bold text-green-800">Trip Price: {selectedTrip.price}</h4>
                    <p className="text-green-600">
                      Status: <span className="capitalize">{selectedTrip.tripStatus.replace('-', ' ')}</span>
                    </p>
                  </div>
                  {selectedTrip.tripStatus === 'completed' && !selectedTrip.adminPayment && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay Transporter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedTrip && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 overflow-y-auto h-full w-full z-60">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-900">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-white mt-4">
                  Process Payment
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-white">
                    Pay {selectedTrip.price} to {selectedTrip.transporterId.transporterName}
                  </p>
                  <p className="text-sm text-white mt-2">
                    Trip: {selectedTrip.truckId.truckNo}
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                    className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                  >
                    {paymentProcessing ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trips;