import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import { Wallet, ArrowUpRight, ArrowDownRight, AlertCircle, Copy, CheckCircle, Send, DollarSign } from 'lucide-react';

const Transactions: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDepositDetails, setShowDepositDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  // Admin USDT wallet addresses for deposits
  const adminUSDTWallets = {
    TRC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
    ERC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
    BEP20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'
  };

  // Admin BTC and ETH wallet addresses
  const adminBTCWallet = 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq';
  const adminETHWallet = '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleWithdrawalAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalAddress(e.target.value);
    setError('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeposit = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (value < 10) {
      setError('Minimum deposit amount is $10 USDT');
      return;
    }

    setShowDepositDetails(true);
  };

  const handleWithdraw = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (value > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (value < 10) {
      setError('Minimum withdrawal amount is $10');
      return;
    }

    if (!withdrawalAddress) {
      setError('Please enter your USDT wallet address to receive funds');
      return;
    }

    // Create withdrawal order for admin approval
    setSuccess(`Withdrawal request for ${formatCurrency(value)} submitted. Admin will process your request within 24 hours. Funds will be sent to ${withdrawalAddress}`);
    setAmount('');
    setWithdrawalAddress('');
    
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  const confirmDeposit = () => {
    const value = parseFloat(amount);
    setSuccess(`Deposit order for ${formatCurrency(value)} USDT submitted. Your balance will be updated after admin confirmation.`);
    setAmount('');
    setShowDepositDetails(false);
    
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  // Calculate portfolio value from crypto assets
  const portfolioValue = user?.assets?.reduce((total, asset) => {
    // This would normally use real-time prices, but for demo we'll use purchase price
    return total + (asset.amount * asset.purchasePrice);
  }, 0) || 0;

  if (showDepositDetails) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Send className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Complete Your Deposit</h3>
              <p className="text-gray-400">Send USDT to our admin wallet to fund your account</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3">Deposit Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(parseFloat(amount))} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Account:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Time:</span>
                  <span className="text-white">10-30 minutes after confirmation</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                USDT Address to deposit your account
              </h4>
              
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Send <strong>{formatCurrency(parseFloat(amount))} USDT</strong> to any of these addresses:</p>
                
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-emerald-400 mb-1">USDT (TRC20) - Recommended</p>
                        <p className="text-white font-mono text-sm break-all">{adminUSDTWallets.TRC20}</p>
                        <p className="text-xs text-gray-400 mt-1">Network: Tron (TRC20) • Low fees</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(adminUSDTWallets.TRC20)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-400 mb-1">USDT (ERC20)</p>
                        <p className="text-white font-mono text-sm break-all">{adminUSDTWallets.ERC20}</p>
                        <p className="text-xs text-gray-400 mt-1">Network: Ethereum (ERC20) • Higher fees</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(adminUSDTWallets.ERC20)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-yellow-400 mb-1">USDT (BEP20)</p>
                        <p className="text-white font-mono text-sm break-all">{adminUSDTWallets.BEP20}</p>
                        <p className="text-xs text-gray-400 mt-1">Network: BSC (BEP20) • Medium fees</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(adminUSDTWallets.BEP20)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Bitcoin (BTC) Address
              </h4>
              
              <div className="bg-slate-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-mono text-sm break-all">{adminBTCWallet}</p>
                    <p className="text-xs text-gray-400 mt-1">Bitcoin Mainnet</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminBTCWallet)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Ethereum (ETH) Address
              </h4>
              
              <div className="bg-slate-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-mono text-sm break-all">{adminETHWallet}</p>
                    <p className="text-xs text-gray-400 mt-1">Ethereum Mainnet</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminETHWallet)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <h4 className="text-emerald-400 font-medium mb-2">⚠️ Important Deposit Instructions:</h4>
              <ul className="text-emerald-300 text-sm space-y-1">
                <li>• Send exactly: <strong>{formatCurrency(parseFloat(amount))} USDT</strong></li>
                <li>• Use the correct network to avoid loss of funds</li>
                <li>• Your balance will be updated after admin confirmation</li>
                <li>• Processing time: 10-30 minutes after payment confirmation</li>
                <li>• Keep your transaction hash for reference</li>
                <li>• Contact support if you need assistance</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDepositDetails(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md px-4 py-3 font-medium transition-colors"
              >
                Back to Wallet
              </button>
              <button
                onClick={confirmDeposit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-3 font-medium transition-colors"
              >
                I've Sent USDT
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                Need help? Contact support at <span className="text-emerald-400">admin@fxgold.shop</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

              {/* Balance Overview */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(user?.balance || 0)}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Crypto Assets Value</p>
                  <p className="text-xl font-medium text-emerald-400">{formatCurrency(portfolioValue)}</p>
                </div>
                
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                  <p className="text-xl font-bold text-white">{formatCurrency((user?.balance || 0) + portfolioValue)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Minimum: $10 • Maximum: $50,000
                  </p>
                </div>

                {transactionType === 'withdraw' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your USDT Wallet Address
                    </label>
                    <input
                      type="text"
                      value={withdrawalAddress}
                      onChange={handleWithdrawalAddressChange}
                      className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your USDT wallet address"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Funds will be sent to this address after admin approval
                    </p>
                  </div>
                )}

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
                  <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-emerald-200">{success}</p>
                  </div>
                )}

                <button
                  onClick={transactionType === 'deposit' ? handleDeposit : handleWithdraw}
                  disabled={!amount || (transactionType === 'withdraw' && !withdrawalAddress)}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    amount && (transactionType !== 'withdraw' || withdrawalAddress)
                      ? transactionType === 'deposit'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {transactionType === 'deposit' ? 'Deposit USDT' : 'Request Withdrawal'}
                </button>
              </div>

              {/* How it works */}
              <div className="mt-6 bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  How {transactionType === 'deposit' ? 'Deposits' : 'Withdrawals'} Work
                </h3>
                {transactionType === 'deposit' ? (
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Send USDT to our admin wallet address</li>
                    <li>• Admin confirms your payment</li>
                    <li>• Your balance is updated automatically</li>
                    <li>• Start trading cryptocurrencies</li>
                  </ul>
                ) : (
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Submit withdrawal request with your wallet address</li>
                    <li>• Admin reviews and approves</li>
                    <li>• Funds sent to your provided wallet address</li>
                    <li>• Processing time: 24-48 hours</li>
                  </ul>
                )}
              </div>
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
                            {formatCryptoAmount(transaction.amount, transaction.coinSymbol)}
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
                    Start by depositing USDT to fund your account, then trade cryptocurrencies to see your transaction history here.
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