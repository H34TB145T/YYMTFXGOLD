import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { Wallet, ArrowUpRight, ArrowDownRight, QrCode, AlertCircle } from 'lucide-react';
import QRCode from 'react-qr-code';

const Transactions: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleTransaction = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transactionType === 'withdraw' && value > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (user) {
      const updatedUser = {
        ...user,
        balance: transactionType === 'deposit' 
          ? user.balance + value 
          : user.balance - value
      };
      
      updateUser(updatedUser);
      setSuccess(`Successfully ${transactionType}ed ${formatCurrency(value)}`);
      setAmount('');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };

  const mockWalletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const mockBankDetails = {
    bank: 'Crypto Bank',
    accountName: "FxGold Trading",
    accountNumber: '1234567890',
    routingNumber: '021000021'
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-6">Wallet & Transactions</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Section */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Wallet className="h-6 w-6 text-emerald-500 mr-2" />
                  <h2 className="text-xl font-bold text-white">Your Wallet</h2>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(user?.balance || 0)}</p>
                {(user?.balance || 0) === 0 && (
                  <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-blue-200 text-xs font-medium">Getting Started</p>
                        <p className="text-blue-300 text-xs mt-1">
                          Your account starts with $0. Add funds through deposits to begin trading.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setTransactionType('deposit')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      transactionType === 'deposit'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setTransactionType('withdraw')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      transactionType === 'withdraw'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Withdraw
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                {success && (
                  <p className="text-sm text-emerald-400">{success}</p>
                )}

                <button
                  onClick={handleTransaction}
                  disabled={!amount}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    amount
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {transactionType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
                </button>

                {transactionType === 'deposit' && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition-colors flex items-center justify-center"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {showQR ? 'Hide' : 'Show'} Payment Details
                  </button>
                )}
              </div>

              {showQR && (
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <div className="flex justify-center mb-4">
                    <QRCode value={mockWalletAddress} size={150} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900">Wallet Address:</p>
                    <p className="font-mono text-gray-600 break-all">{mockWalletAddress}</p>
                    <div className="border-t border-gray-200 my-4"></div>
                    <p className="font-medium text-gray-900">Bank Details:</p>
                    <p className="text-gray-600">Bank: {mockBankDetails.bank}</p>
                    <p className="text-gray-600">Account Name: {mockBankDetails.accountName}</p>
                    <p className="text-gray-600">Account Number: {mockBankDetails.accountNumber}</p>
                    <p className="text-gray-600">Routing Number: {mockBankDetails.routingNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
              </div>
              
              {user?.transactions && user.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Asset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {user.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'buy' || transaction.type === 'long'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {transaction.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {transaction.amount.toFixed(6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-white">{transaction.coinSymbol}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {formatCurrency(transaction.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {transaction.type === 'buy' || transaction.type === 'long' ? (
                                <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                              )}
                              <span className={transaction.type === 'buy' || transaction.type === 'long' ? 'text-red-400' : 'text-emerald-400'}>
                                {formatCurrency(transaction.total)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">No transactions yet</p>
                  <p className="text-gray-500 text-sm">
                    Start trading cryptocurrencies to see your transaction history here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;