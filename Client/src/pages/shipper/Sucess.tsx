import { useEffect } from 'react';
import Navbar from '../../components/Common/Navbar/Navbar';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { verifyBidPayment } from '../../services/shipper/shipperService';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Success() {

  const navigate = useNavigate()

  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('transactionId');

  useEffect(() => {

    const paymentSuccess = async () => {
      try {

        await verifyBidPayment( sessionId , 'success')
        
      } catch (error) {
        console.log(error);
      }
    }

    paymentSuccess();

  }, [])
 

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-3xl mx-auto pt-16 pb-24 px-4">
        <div className="text-center mb-12">
          <div className="inline-flex mb-6 p-4 bg-green-800 rounded-full"> 
            <CheckCircle className="h-16 w-16 text-green-400" /> 
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1> 
          <p className="text-lg text-gray-300"> 
           Thank you! Your trip request has been received and is now being processed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-500 transition-colors"
            onClick={() => navigate('/shipper/bids')}
          >
            <ShoppingBag size={20} />
            View bid
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default Success;