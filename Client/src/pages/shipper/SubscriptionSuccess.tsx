import { Check, Calendar, Gift, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subscriptionSuccess } from '../../services/shipper/shipperService';

function SubscriptionSuccess() {

    const [searchParams] = useSearchParams();
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [planName, setPlanName] = useState<string>('');

    const navigate = useNavigate()

    useEffect(() => {
        const finalizeSubscription = async () => {

            const sessionId = searchParams.get('session_id');
            const planId = searchParams.get('planId');

            if (!sessionId) return;
            if (!planId) return;

            try {

                const response: any = await subscriptionSuccess(sessionId, planId);
                if (response.success) {
                    setEndDate(new Date(response.endDate));
                    setPlanName(response.planName)
                    toast.success(response.message)
                } else {
                    toast.error(response.message)
                }

            } catch (error) {
                console.error(error);
                toast.error('Subscription failed')
            }
        }

        finalizeSubscription();
    }, [])

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 mt-15">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Success header */}
                    <div className="bg-green-500 p-6 text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white">
                            <Check className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white">Subscription Successful!</h2>
                        <p className="text-green-100 mt-1">Thank you for subscribing to our service</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">


                        {/* Subscription details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Subscription Details</h3>
                            <div className="flex items-center mb-3">
                                <div className="bg-blue-100 p-2 rounded mr-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-gray-700 font-medium"> {planName} Plan</p>
                                    {endDate && (
                                        <p className="text-gray-500 text-sm">
                                            Next billing date: {endDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}

                                </div>
                            </div>

                        </div>

                        {/* What's Next */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">What's Next?</h3>
                            <div className="flex items-center mb-3">
                                <div className="bg-purple-100 p-2 rounded mr-3">
                                    <Gift className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-gray-700">Explore your premium benefits</p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 mb-4">
                            <button onClick={() => navigate('/shipper/profile')}
                             className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors duration-200">
                                Go to Dashboard
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                            <button className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center font-medium transition-colors duration-200">
                                View Billing Details
                            </button>
                        </div>

                        {/* Support */}
                        <div className="text-center text-gray-500 text-sm mt-4">
                            <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a></p>
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

export default SubscriptionSuccess;