import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Common/Navbar/Navbar';
import ProfileSidebar from '../../components/tranporter/ProfileSidebar';
import { fetchWalletData } from '../../services/transporter/transporterApi';

// Type definitions
interface WalletState {
  balance: number;
}



const Wallet: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    balance: 0
  });


  useEffect(() => {
    const getWalletData = async () => {
        const response = await fetchWalletData();
        console.log(response , 'res');
        
        setWalletState(response as WalletState)
    }

    getWalletData()
 
  }, [])

  console.log(walletState);
  



  // const [addAmount, setAddAmount] = useState<string>('');
  // const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  // const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message] = useState<string>('');

  // const handleAddMoney = async (): Promise<void> => {
  //   const amount = parseFloat(addAmount);
  //   if (amount <= 0) {
  //     setMessage('Please enter a valid amount');
  //     return;
  //   }

  //   setIsProcessing(true);
  //   setMessage('');

  //   // Simulate API call
  //   setTimeout(() => {
  //     setWalletState(prev => ({
  //       balance: prev.balance + amount
  //     }));
  //     setAddAmount('');
  //     setMessage(`₹${amount} added successfully!`);
  //     setIsProcessing(false);
      
  //     // Clear message after 3 seconds
  //     setTimeout(() => setMessage(''), 3000);
  //   }, 1000);
  // };

  // const handleWithdrawMoney = async (): Promise<void> => {
  //   const amount = parseFloat(withdrawAmount);
  //   if (amount <= 0) {
  //     setMessage('Please enter a valid amount');
  //     return;
  //   }

  //   if (amount > walletState.balance) {
  //     setMessage('Insufficient balance');
  //     return;
  //   }

  //   setIsProcessing(true);
  //   setMessage('');

  //   // Simulate API call
  //   setTimeout(() => {
  //     setWalletState(prev => ({
  //       balance: prev.balance - amount
  //     }));
  //     setWithdrawAmount('');
  //     setMessage(`₹${amount} withdrawn successfully!`);
  //     setIsProcessing(false);
      
  //     // Clear message after 3 seconds
  //     setTimeout(() => setMessage(''), 3000);
  //   }, 1000);
  // };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <>
      <Navbar />
      <div className='flex min-h-screen bg-gray-50 mt-12'>
        <ProfileSidebar />
        <div className='flex-1 p-6 ml-4'>
          <div className='max-w-4xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Wallet</h1>
              <p className='text-gray-600'>Manage your wallet balance</p>
            </div>

            {/* Balance Card */}
            <div className='bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-medium text-blue-100 mb-2'>Current Balance</h2>
                  <p className='text-4xl font-bold mb-4'>
                    {formatCurrency(walletState.balance)}
                  </p>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='text-blue-100 text-sm'>Wallet Active</span>
                  </div>
                </div>
                <div className='w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                  <span className='text-4xl'>💰</span>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Action Cards */}
            {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow'>
                <div className='flex items-center mb-6'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4'>
                    <span className='text-2xl'>➕</span>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>Add Money</h3>
                    <p className='text-gray-600 text-sm'>Top up your wallet</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Enter Amount
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
                        ₹
                      </span>
                      <input
                        type='number'
                        placeholder='0.00'
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg'
                        disabled={isProcessing}
                        min='1'
                        step='0.01'
                      />
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {[100, 500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setAddAmount(amount.toString())}
                        className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                        disabled={isProcessing}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAddMoney}
                    disabled={!addAmount || parseFloat(addAmount) <= 0 || isProcessing}
                    className='w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center'
                  >
                    {isProcessing ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Processing...
                      </>
                    ) : (
                      'Add Money'
                    )}
                  </button>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow'>
                <div className='flex items-center mb-6'>
                  <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4'>
                    <span className='text-2xl'>💸</span>
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>Withdraw Money</h3>
                    <p className='text-gray-600 text-sm'>Transfer to your bank</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Enter Amount
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
                        ₹
                      </span>
                      <input
                        type='number'
                        placeholder='0.00'
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg'
                        disabled={isProcessing}
                        min='1'
                        max={walletState.balance}
                        step='0.01'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      Available: {formatCurrency(walletState.balance)}
                    </p>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {[100, 500, 1000].filter(amount => amount <= walletState.balance).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setWithdrawAmount(amount.toString())}
                        className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                        disabled={isProcessing}
                      >
                        ₹{amount}
                      </button>
                    ))}
                    {walletState.balance > 1000 && (
                      <button
                        onClick={() => setWithdrawAmount(walletState.balance.toString())}
                        className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium'
                        disabled={isProcessing}
                      >
                        All
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleWithdrawMoney}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletState.balance || isProcessing}
                    className='w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center'
                  >
                    {isProcessing ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Processing...
                      </>
                    ) : (
                      'Withdraw Money'
                    )}
                  </button>
                </div>
              </div>
            </div> */}

            {/* Security Notice */}
            <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-start'>
                <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5'>
                  <span className='text-blue-600 text-sm'>🔒</span>
                </div>
                <div>
                  <h4 className='font-medium text-blue-900 mb-1'>Secure Transactions</h4>
                  <p className='text-blue-700 text-sm'>
                    All transactions are encrypted and secure. Money will be processed instantly to your wallet or bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wallet;