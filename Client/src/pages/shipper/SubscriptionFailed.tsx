import { XCircle, AlertTriangle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';

function SubscriptionFailed() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br mt-15 from-red-50 to-orange-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Failed header */}
                    <div className="bg-red-500 p-6 text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white">
                            <XCircle className="h-10 w-10 text-red-500" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">Subscription Failed</h2>
                        <p className="text-red-100 mt-1">We couldn't process your subscription</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6 text-center">
                            <p className="text-gray-700">Something went wrong while processing your subscription. Don't worry, no charges were made to your account.</p>
                        </div>

                        {/* Error details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">What Happened?</h3>
                            <div className="flex items-center mb-3">
                                <div className="bg-orange-100 p-2 rounded mr-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-gray-700 font-medium">Payment Issue</p>
                                    <p className="text-gray-500 text-sm">There may be an issue with your payment method</p>
                                </div>
                            </div>
                        </div>

                        {/* What to do next */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">What To Do Next</h3>
                            <ul className="space-y-3">
                                <li className="flex">
                                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">1</span>
                                    </div>
                                    <p className="text-gray-700">Check your payment details and ensure they're up to date</p>
                                </li>
                                <li className="flex">
                                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">2</span>
                                    </div>
                                    <p className="text-gray-700">Verify your billing address matches your card information</p>
                                </li>
                                <li className="flex">
                                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 mr-3 mt-0.5">
                                        <span className="text-blue-600 text-sm font-bold">3</span>
                                    </div>
                                    <p className="text-gray-700">Try again or use a different payment method</p>
                                </li>
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 mb-4">
                            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors duration-200">
                                Try Again
                                <RefreshCw className="h-4 w-4 ml-2" />
                            </button>
                            <button className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center font-medium transition-colors duration-200">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Plans
                            </button>
                        </div>

                        {/* Support */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-start">
                            <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-gray-700 font-medium">Need assistance?</p>
                                <p className="text-gray-600 text-sm">Our support team is ready to help you resolve any issues.</p>
                                <a href="#" className="text-blue-600 hover:underline text-sm font-medium mt-1 inline-block">Contact Support</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    <p>© 2025 Your Company. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}

export default SubscriptionFailed;