import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-5 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <div className="text-9xl font-bold text-indigo-600">404</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <svg className="w-64 h-64" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="1,6" className="text-indigo-400" />
                  <path d="M50,10 L50,90 M10,50 L90,50" stroke="currentColor" strokeWidth="3" className="text-indigo-500" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
            <p className="text-gray-600 mb-8 max-w-md">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, it happens to the best of us.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={18} className="mr-2" />
                Go Back
              </button>
              
              <button 
                className="flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => window.location.href = '/'}
              >
                <Home size={18} className="mr-2" />
                Home Page
              </button>
            </div>           
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;