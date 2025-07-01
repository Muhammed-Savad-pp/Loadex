import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';

interface WalletPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPayment: (paymentData: PaymentData) => void;
    bidId: string;
    requiredAmount: number;
}

interface PaymentData {
    bidId: string;
    amount: number;
}

const WalletPaymentModal: React.FC<WalletPaymentModalProps> = ({
    isOpen,
    onClose,
    onPayment,
    bidId,
    requiredAmount
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
 

    const handlePayment = async () => {

        setIsProcessing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

            onPayment({
                bidId,
                amount: requiredAmount,
            });

            onClose();
        } catch (error) {
            console.error('Payment failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50  bg-opacity-50 overflow-y-auto px-4 py-10">
            <div className="bg-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Wallet className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-100">Payment</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-5 h-5 text-gray-300" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Bid Information */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Bid ID</span>
                            <span className="text-sm font-mono text-gray-900">{bidId}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Required Amount</span>
                            <span className="text-sm font-semibold text-red-600">₹ {requiredAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    {/* Payment Method */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-200">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setPaymentMethod('wallet')}
                                className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 ${paymentMethod === 'wallet'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                disabled={isProcessing}
                            >
                                <Wallet className="w-4 h-4" />
                                <span className="text-sm font-medium">Wallet</span>
                            </button>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white `}
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>Pay ₹ {requiredAmount.toFixed(2)}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default WalletPaymentModal