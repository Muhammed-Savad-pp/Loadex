import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Common/Navbar/Navbar';
import { XCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { verifyBidPayment } from '../../services/shipper/shipperService';
import toast from 'react-hot-toast';

export default function Failed() {

    
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('transactionId');


    useEffect(() => {

        const paymentFailed = async () => {
            try {
                
            await verifyBidPayment(sessionId, 'failed')

            } catch (error) {
                console.log(error);
                
            }
        }

    })

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />

            <div className="max-w-3xl mx-auto pt-16 pb-24 px-4">
                {/* Failed Message */}
                <div className="text-center mb-12">
                    <div className="inline-flex mb-6 p-4 bg-red-900 rounded-full">
                        <XCircle className="h-16 w-16 text-red-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Payment Failed</h1>
                    <p className="text-lg text-gray-300">
                        We were unable to process your payment.
                    </p>
                </div>


                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-500 transition-colors"
                        onClick={() => navigate('/shipper/bids')}
                    >
                        <RefreshCw size={20} />
                        Try Again
                    </button>

                </div>
            </div>
        </div>
    );
}