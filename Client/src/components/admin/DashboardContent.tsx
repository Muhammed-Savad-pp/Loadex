import React from 'react';
// import { LineChart, Line, ResponsiveContainer } from 'recharts';

const DashboardContent = () => {
  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 200 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 250 },
    { name: 'Apr', value: 350 },
    { name: 'May', value: 320 },
    { name: 'Jun', value: 400 },
    { name: 'Jul', value: 380 },
  ];
  
  const tripsData = [
    { name: 'Jan', value: 50 },
    { name: 'Feb', value: 70 },
    { name: 'Mar', value: 60 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 100 },
    { name: 'Jun', value: 85 },
    { name: 'Jul', value: 110 },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-indigo-600 p-3 rounded-lg mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Users</p>
            <h2 className="text-2xl font-bold">321</h2>
          </div>
          <div className="ml-auto h-12 w-24">
            {/* <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer> */}
          </div>
        </div>

        {/* Loads Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div>
            <p className="text-sm text-gray-500">Loads</p>
            <h2 className="text-2xl font-bold">682</h2>
          </div>
          <div className="ml-auto h-12 w-24">
            {/* <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer> */}
          </div>
        </div>

        {/* Completed Trips Card */}
        <div className="bg-indigo-500 p-6 rounded-lg shadow-sm flex items-center">
          <div>
            <p className="text-sm text-indigo-100">Completed Trips</p>
            <h2 className="text-2xl font-bold text-white">540</h2>
          </div>
          <div className="ml-auto h-12 w-24">
            {/* <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripsData}>
                <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer> */}
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue</p>
            <h2 className="text-2xl font-bold">$350.40</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;