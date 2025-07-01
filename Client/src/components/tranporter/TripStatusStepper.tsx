import React from 'react';
import { Check, Truck, MapPin, ThumbsUp } from 'lucide-react';

type TripStatus = 'confirmed' | 'inProgress' | 'arrived' | 'completed';

interface TripStatusStepperProps {
  currentStatus: TripStatus;
  onUpdateStatus: (newStatus: TripStatus) => void;
  disabled?: boolean;
  confirmedAt?: Date;
  progressAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
}

const TripStatusStepper: React.FC<TripStatusStepperProps> = ({
  currentStatus,
  onUpdateStatus,
  disabled = false,
  confirmedAt,
  progressAt,
  arrivedAt,
  completedAt,
}) => {
  const statusOrder: TripStatus[] = ['confirmed', 'inProgress', 'arrived', 'completed'];

  // Find the index of the current status
  console.log('current status', currentStatus);

  const currentIndex = Math.abs(statusOrder.indexOf(currentStatus));

  console.log('currentIndex', currentIndex);;


  // Function to check if a step is active
  const isActive = (status: TripStatus) => {
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
  };

  // Function to check if step is complete
  const isComplete = (status: TripStatus) => {
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex < currentIndex;
  };

  // Function to get next status
  const getNextStatus = (): TripStatus | null => {
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  const nextStatus = getNextStatus();

  // Get label for status update button
  const getButtonLabel = () => {
    switch (nextStatus) {
      case 'inProgress':
        return 'Start Trip';
      case 'arrived':
        return 'Mark as Arrived';
      case 'completed':
        return 'Complete Trip';
      default:
        return 'Trip Completed';
    }
  };

  // Status icon and labels mapping
  const statusConfig = {
    confirmed: {
      icon: ThumbsUp,
      label: 'Confirmed',
      description: 'Trip confirmed',
      date: confirmedAt
    },
    inProgress: {
      icon: Truck,
      label: 'In Progress',
      description: 'On the way',
      date: progressAt
    },
    arrived: {
      icon: MapPin,
      label: 'Arrived',
      description: 'At drop location',
      date: arrivedAt
    },
    completed: {
      icon: Check,
      label: 'Completed',
      description: 'Trip completed',
      date: completedAt
    }
  };

const formatDate = (date?: Date): string => {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
  return '';
};

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="font-medium text-lg text-gray-900 mb-4">Trip Status</h3>

      {/* Status Stepper */}
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute ml-5 top-5 left-0 w-220 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Status Steps */}
        <div className="flex justify-between relative z-10">
          {statusOrder.map((status, _) => {
            const StatusIcon = statusConfig[status].icon;
            const active = isActive(status);
            const complete = isComplete(status);

            return (
              <div key={status} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${complete ? 'bg-green-500' : active ? 'bg-green-500' : 'bg-gray-300'
                    } transition-colors duration-300`}
                >
                  {complete ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <StatusIcon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {statusConfig[status].label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statusConfig[status].description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(statusConfig[status].date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Update Button */}
      <div className="mt-8 flex justify-center">
        {nextStatus ? (
          <button
            onClick={() => !disabled && onUpdateStatus(nextStatus)}
            disabled={disabled}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {getButtonLabel()}
          </button>
        ) : (
          <div className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium">
            Trip Completed
          </div>
        )}
      </div>
    </div>
  );
};

export default TripStatusStepper;