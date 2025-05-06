import { useEffect, useState } from 'react';
import Navbar from '../../components/Common/Navbar/Navbar';
import ProfileSidebar from '../../components/tranporter/ProfileSidebar';
import { fetchTrips, updateTripStatus } from '../../services/transporter/transporterApi';
import { ChevronDown, ChevronUp, MapPin, Calendar, Truck, Loader, Copy, CheckCircle } from 'lucide-react';
import TripStatusStepper from '../../components/tranporter/TripStatusStepper';
import ProfileComponent from '../../components/tranporter/ProfileComponent';


interface ITripData {
  _id: string; // Added ID for updating
  shipperId: {
    _id: string;
    shipperName: string;
    phone: string;
    companyName: string;
    profileImage: string
  };
  transporterId: {
    _id: string;
    transporterName: string;
  };
  loadId: {
    _id: string;
    breadth: string;
    distanceInKm: number;
    dropLocation: string;
    height: string;
    length: string;
    material: string;
    pickupLocation: string;
    quantity: string;
    scheduledDate: Date;
  };
  truckId: {
    capacity: string;
    driverMobileNo: string;
    driverName: string;
    truckNo: string;
    truckType: string;
  };
  tripStatus: string;
  price: string;
  createdAt: Date;
}

type TripStatus = 'confirmed' | 'inProgress' | 'arrived' | 'completed';

const statusColors = {
  confirmed: 'bg-yellow-100 text-yellow-800',
  inProgress: 'bg-blue-100 text-blue-800',
  arrived: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const StatusBadge = ({ status }: { status: string }) => {
  let displayText = status;
  let colorClass = statusColors.confirmed;

  switch (status.toLowerCase()) {
    case 'completed':
      colorClass = statusColors.completed;
      break;

    case 'inprogress':
    case 'in progress':
      displayText = 'In Progress';
      colorClass = statusColors.inProgress;
      break;
    case 'arrived':
      colorClass = statusColors.arrived;
      break;
    default:
      colorClass = statusColors.confirmed;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
      {displayText}
    </span>
  );
};

const TripCard = ({ trip, onStatusUpdate }: { trip: ITripData; onStatusUpdate: (tripId: string, newStatus: TripStatus) => Promise<void> }) => {

  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  // Handle status update
  const handleStatusUpdate = async (newStatus: TripStatus) => {
    try {
      setUpdating(true);
      await onStatusUpdate(trip._id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCopy = async () => {
    try {

      await navigator.clipboard.writeText(trip.shipperId.phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000)

    } catch (error) {
      console.log('Failed to copy text:', error);

    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 transition-all duration-300">
        {/* Summary Card (Always Visible) */}
        <div
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Left Content */}
          <div className="flex items-center">
            <div className="mr-3">
              {trip.tripStatus.toLowerCase() === 'completed' ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <Truck className="w-10 h-10 text-blue-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-lg text-gray-900">
                  {trip.loadId.pickupLocation} to {trip.loadId.dropLocation}
                </h3>
                <StatusBadge status={trip.tripStatus} />
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(trip.loadId.scheduledDate)}</span>
                <span className="mx-2">•</span>
                <span>{trip.loadId.distanceInKm} km</span>
                <span className="mx-2">•</span>
                <span>₹ {trip.price}</span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
            {/* Status Stepper - NEW ADDITION */}
            <TripStatusStepper
              currentStatus={trip.tripStatus.toLowerCase() as TripStatus}
              onUpdateStatus={handleStatusUpdate}
              disabled={updating || trip.tripStatus.toLowerCase() === 'completed' || trip.tripStatus.toLowerCase() === 'cancelled'}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Shipment Details</h4>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Company Name</p>
                        <p className="font-medium">{trip.shipperId.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Material</p>
                        <p className="font-medium">{trip.loadId.material}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-medium">{trip.loadId.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dimensions</p>
                        <p className="font-medium">{trip.loadId.length}L × {trip.loadId.breadth}B × {trip.loadId.height}H</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Location Details</h4>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="mb-2">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup Location</p>
                          <p className="font-medium">{trip.loadId.pickupLocation}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Drop Location</p>
                          <p className="font-medium">{trip.loadId.dropLocation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Truck Details</h4>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Truck Number</p>
                        <p className="font-medium">{trip.truckId.truckNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Truck Type</p>
                        <p className="font-medium">{trip.truckId.truckType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Capacity</p>
                        <p className="font-medium">{trip.truckId.capacity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Driver Details</h4>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Driver Name</p>
                        <p className="font-medium">{trip.truckId.driverName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Mobile Number</p>
                        <p className="font-medium">{trip.truckId.driverMobileNo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Shipper Details */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Shipper</h4>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className='grid grid-cols-2 '>
                      <div>
                        <p className='text-xs text-gray-500'>ShipperName</p>
                        <div className='flex row mt-2 cursor-pointer' onClick={() => setShowProfileModal(true)}>
                          <img src={trip.shipperId.profileImage} alt="ProfileImage" className='w-10 h-10 bg-sky-400 rounded-full' />
                          <p className="font-medium ml-2 mt-2">{trip.shipperId.shipperName}</p>
                        </div>
                      </div>
                      <div className='ml-10'>
                        <p className='text-xs text-gray-500'>Mobile Number</p>
                        <div className='flex items-center gap-2 font-medium'>
                          <p>{trip.shipperId.phone}</p>
                          <Copy className='w-4 h-4 text-gray-600 cursor-pointer' onClick={handleCopy} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-gray-500">Trip created on {formatDate(trip.createdAt)}</p>
                  </div>

                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
                      Contact Shipper
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            <ProfileComponent
              shipperId={trip.shipperId._id}
            />
          </div>
        </div>
      )}
    </>

  );
};

export default function Trips() {
  const [tripData, setTripData] = useState<ITripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');



  useEffect(() => {
    const getTrips = async () => {
      try {
        setLoading(true);
        const response = await fetchTrips();
        setTripData(response as ITripData[]);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    };

    getTrips();
  }, []);

  console.log(tripData, 'tr');


  // Handle trip status update
  const handleStatusUpdate = async (tripId: string, newStatus: TripStatus) => {
    try {
      // Call API to update status
      await updateTripStatus(tripId, newStatus);

      // Update local state
      setTripData(prevTrips =>
        prevTrips.map(trip =>
          trip._id === tripId ? { ...trip, tripStatus: newStatus } : trip
        )
      );
    } catch (error) {
      console.error("Failed to update trip status:", error);
      throw error;
    }
  };

  // Filter trips based on status
  const filteredTrips = tripData?.filter(trip => {
    if (filter === 'all') return true;
    return trip.tripStatus.toLowerCase() === filter.toLowerCase();
  });

  return (
    <>
      <Navbar />

      <div className='flex min-h-screen bg-gray-100'>
        <ProfileSidebar />

        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
            <p className="text-gray-600">Manage and track all your transportation trips</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilter('all')}
            >
              All Trips
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'confirmed' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'inProgress' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilter('inProgress')}
            >
              In Progress
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'arrived' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilter('arrived')}
            >
              Arrived
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>

          {/* Trip List */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading your trips...</p>
              </div>
            ) : filteredTrips && filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <TripCard
                  key={trip._id || index}
                  trip={trip}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Truck className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600">
                  {filter !== 'all'
                    ? `You don't have any ${filter} trips at the moment.`
                    : "You haven't created any trips yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}