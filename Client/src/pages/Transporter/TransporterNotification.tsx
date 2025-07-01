// import React, { useEffect, useState } from 'react';
// import { X, Bell, Truck, Package, Clock, Check, CheckCheck } from 'lucide-react';
// import { fetchNotifcations, updateNotificationAsRead, deleteNotification } from '../../services/transporter/transporterApi';

// export interface INotification extends Document {
//   _id: string;
//   userId: string;
//   userType: 'shipper' | 'transporter';
//   title: string;
//   message: string;
//   isRead: boolean;
//   createdAt: Date;
// }

// type FilterType = 'all' | 'unread' | 'read';

// const TransporterNotification: React.FC = () => {
//   const [notificationList, setNotificationList] = useState<INotification[]>([]);
//   const [filter, setFilter] = useState<FilterType>('all');

//   useEffect(() => {
//     const getNotifications = async () => {
//       try {

//         const response = await fetchNotifcations(filter);
//         setNotificationList(response as INotification[])

//       } catch (error) {
//         console.log(error)
//       }
//     }

//     getNotifications()
//   }, [])

//   const filteredNotifications = notificationList.filter(notif => {
//     if (filter === 'unread') return !notif.isRead;
//     if (filter === 'read') return notif.isRead;
//     return true; // for 'all'
//   });

//   const unreadCount = notificationList.filter(n => !n.isRead).length;

//   const markAsRead = async (id: string) => {
//     try {

//       const response: any = await updateNotificationAsRead(id);
//       if (response.success && response.notificationData) {
//         setNotificationList(prev =>
//           prev.map(n => n._id === id ? { ...n, ...response.notificationData } : n)
//         );
//       }
//     } catch (error) {
//       console.error(error)
//     }
//   };

//   const deleteNotificationById = async (id: string) => {
//     try {

//       const response: any = await deleteNotification(id);
//       if(response.success) {
//         setNotificationList(prev => prev.filter(n => n._id !== id));
//       }
//     } catch (error) {
//       console.error(error)
//     }
//   };

//   const formatTimeAgo = (date: Date | string): string => {
//     const parsedDate = typeof date === 'string' ? new Date(date) : date;
//     const now = new Date();
//     const seconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
//     if (seconds < 60) return 'Just now';
//     if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
//     if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
//     return `${Math.floor(seconds / 86400)}d ago`;
//   };

//   return (
//     <div className="absolute right-0 top-12 w-[350px] max-h-[400px] bg-white shadow-lg rounded-xl overflow-hidden z-50 border">
//       <div className="flex items-center justify-between px-4 py-3 border-b">
//         <div className="flex items-center gap-2">
//           <Bell className="w-5 h-5 text-gray-600" />
//           <span className="font-semibold">Notifications</span>
//           {unreadCount > 0 && (
//             <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
//               {unreadCount}
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="px-4 py-2 border-b flex justify-around text-sm text-gray-600">
//         {(['all', 'unread', 'read'] as FilterType[]).map((type) => (
//           <button
//             key={type}
//             onClick={() => setFilter(type)}
//             className={`capitalize px-3 py-1 rounded-full transition-colors ${filter === type ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
//               }`}
//           >
//             {type}
//           </button>
//         ))}
//       </div>

//       <div className="overflow-y-auto max-h-[320px] divide-y">
//         {filteredNotifications.length === 0 ? (
//           <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
//         ) : (
//           filteredNotifications.map(notification => (
//             <div
//               key={notification._id}
//               className={`p-3 text-sm ${!notification.isRead ? 'bg-blue-50' : ''}`}
//             >
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex justify-between items-center">
//                     <span className="font-medium">{notification.title}</span>
//                     <span className="text-xs text-gray-400 flex items-center gap-1">
//                       <Clock className="w-3 h-3" />
//                       {formatTimeAgo(notification.createdAt)}
//                     </span>
//                   </div>
//                   <p className="text-gray-600">{notification.message}</p>
//                 </div>
//               </div>
//               <div className="flex justify-between mt-2 text-xs text-blue-600">
//                 {!notification.isRead && (
//                   <button onClick={() => markAsRead(notification._id)} className="hover:underline">
//                     Mark as read
//                   </button>
//                 )}
//                 <button onClick={() => deleteNotificationById(notification._id)} className="text-red-600 hover:underline">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransporterNotification;

import React, { useEffect, useState } from 'react';
import {  Bell, Truck, Package, Clock, CheckCheck, Trash2 } from 'lucide-react';
import { fetchNotifcations, updateNotificationAsRead, deleteNotification } from '../../services/transporter/transporterApi';

export interface INotification extends Document {
  _id: string;
  userId: string;
  userType: 'shipper' | 'transporter';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

type FilterType = 'all' | 'unread' | 'read';

const TransporterNotification: React.FC = () => {
  const [notificationList, setNotificationList] = useState<INotification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await fetchNotifcations(filter);
        setNotificationList(response as INotification[])
      } catch (error) {
        console.log(error)
      }
    }
    getNotifications()
  }, [])

  const filteredNotifications = notificationList.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const response: any = await updateNotificationAsRead(id);
      if (response.success && response.notificationData) {
        setNotificationList(prev =>
          prev.map(n => n._id === id ? { ...n, ...response.notificationData } : n)
        );
      }
    } catch (error) {
      console.error(error)
    }
  };

  const deleteNotificationById = async (id: string) => {
    try {
      const response: any = await deleteNotification(id);
      if(response.success) {
        setNotificationList(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error(error)
    }
  };

  const formatTimeAgo = (date: Date | string): string => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getNotificationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('delivery') || lowerTitle.includes('delivered')) {
      return <Package className="w-4 h-4 text-green-500" />;
    }
    if (lowerTitle.includes('pickup') || lowerTitle.includes('transport')) {
      return <Truck className="w-4 h-4 text-blue-500" />;
    }
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="absolute right-0 top-12 w-[380px] max-h-[500px] bg-white shadow-2xl rounded-2xl overflow-hidden z-50 border-0 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Notifications</h3>
              <p className="text-blue-100 text-sm">{notificationList.length} total notifications</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
              {unreadCount} new
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === type 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[340px]">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center font-medium">No notifications found</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              {filter === 'unread' ? 'All caught up!' : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`group relative p-4 hover:bg-gray-50 transition-colors duration-200 ${
                  !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.title)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotificationById(notification._id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterNotification;