import { useEffect, useState } from 'react';
import { Check, Calendar, Clock } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHEBLE_KEY;
import ProfileSidebar from '../../components/tranporter/ProfileSidebar';
import { getTransporterProfile, fetchTransporterPlans, createCheckoutSubscription } from '../../services/transporter/transporterApi';

interface ITransporter {
  subscription: {
    planId: string;
    planName: string;
    endDate: string;
    startDate: string;
    isActive: boolean;
  }
}

interface IPlans {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
}

function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState<IPlans[]>([]);
  const [transporter, setTransporter] = useState<ITransporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch shipper profile to check subscription status
        const transporterResponse: any = await getTransporterProfile();
        setTransporter(transporterResponse.transporterData);

        // Fetch available plans regardless of subscription status
        const plansResponse: any = await fetchTransporterPlans();
        setPlans(plansResponse.subscriptionPlans as IPlans[]);

        // If user has an active subscription, select that plan by default
        if (transporterResponse.transporterData?.subscription?.planId) {
          setSelectedPlan(transporterResponse.transporterData.subscription.planId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async () => {
    try {
      const stripe = await loadStripe(stripePublicKey);
      const response: any = await createCheckoutSubscription(selectedPlan);

      if (response.success && stripe) {
        await stripe.redirectToCheckout({ sessionId: response.sessionId });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate checkout process.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDateString: string) => {
    const endDate = new Date(endDateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className='flex min-h-screen bg-gray-50 mt-10'>
          <ProfileSidebar />
          <div className="flex-1 w-full bg-gray-100 min-h-screen py-12 px-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscription details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='flex min-h-screen bg-gray-50 mt-10'>
        <ProfileSidebar />
        <div className="flex-1 w-full bg-gray-100 min-h-screen py-12 px-12">
          <div className="max-w-6xl mx-auto">
            {transporter?.subscription?.isActive && !showUpgrade ? (
              // Active subscription view
              <div className="mb-12">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Current Subscription</h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    View details about your current subscription plan and status
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-indigo-600">{transporter.subscription.planName} Plan</h2>
                    <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">Start Date</span>
                      </div>
                      <p className="text-lg font-semibold">{formatDate(transporter.subscription.startDate)}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-700 font-medium">End Date</span>
                      </div>
                      <p className="text-lg font-semibold">{formatDate(transporter.subscription.endDate)}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-700 font-medium">Time Remaining</span>
                    </div>

                    {transporter.subscription.endDate && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, calculateDaysRemaining(transporter.subscription.endDate) / 30 * 100))}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {calculateDaysRemaining(transporter.subscription.endDate)} days remaining
                        </p>
                      </>
                    )}
                  </div>

                  {/* <div className="flex justify-center space-x-4">
                                        <button 
                                            onClick={() => setShowUpgrade(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium transition-colors duration-200"
                                        >
                                            Upgrade/Change Plan
                                        </button>
                                    </div> */}
                </div>
              </div>
            ) : (
              // Plans selection view
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {showUpgrade ? "Upgrade Your Subscription" : "Choose Your Subscription Plan"}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Select the plan that best suits your logistics needs and scale your operations efficiently
                  </p>
                  {showUpgrade && (
                    <button
                      onClick={() => setShowUpgrade(false)}
                      className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      ← Back to current subscription
                    </button>
                  )}
                </div>

                <div className="flex flex-nowrap overflow-x-auto pb-6 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl min-w-[300px] flex-1
                                            ${selectedPlan === plan.id ? 'ring-2 ring-indigo-500' : ''}
                                            ${transporter?.subscription?.planId === plan.id ? 'bg-indigo-50' : 'bg-white'}`}
                    >
                      {transporter?.subscription?.planId === plan.id && (
                        <div className="bg-indigo-600 py-1.5 px-4 text-center">
                          <span className="text-white text-sm font-medium">Current Plan</span>
                        </div>
                      )}

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                        <div className="mb-6">
                          <div className="flex items-end">
                            <span className="text-3xl font-bold text-indigo-600">{plan.currency} {plan.price}</span>
                            <span className="text-gray-500 ml-2">/ {plan.duration}</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <ul className="space-y-4">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                                  <Check className="h-5 w-5" />
                                </div>
                                <span className="ml-3 text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`w-full py-3 px-6 rounded-lg transition-colors duration-200 font-medium
                                                    ${selectedPlan === plan.id
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPlan && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleSubscribe} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-medium shadow-md transition-colors duration-200 flex items-center mx-auto"
                    >
                      {transporter?.subscription?.isActive ? 'Change Subscription' : 'Buy Now'}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                      You can upgrade or downgrade your plan at any time
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Subscription;