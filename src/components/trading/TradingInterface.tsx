import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { processBuyTransaction, processSellTransaction, formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import PriceChart from '../common/PriceChart';
import LoadingSpinner from '../common/LoadingSpinner';
import { AlertCircle, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';

const TradingInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const coinId = searchParams.get('coin');
  const { user, updateUser } = useAuth();
  const { cryptocurrencies, loading, getCryptoById } = useCrypto();
  const [selectedCoin, setSelectedCoin] = useState(coinId || '');
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [mmkRate] = useState(3200); // MMK to USD rate - In production, this should come from an API
  const navigate = useNavigate();

  // Get currently selected crypto
  const selectedCrypto = selectedCoin ? getCryptoById(selectedCoin) : null;
  
  // Find user's asset for this crypto
  const userAsset = user?.assets.find(asset => asset.coinId === selectedCoin);
  
  // Calculate the total cost/value based on amount
  const total = selectedCrypto && amount 
    ? parseFloat(amount) * selectedCrypto.price 
    : 0;
    
  // Determine if user has enough balance/crypto
  const canProceed = tradeType === 'buy' 
    ? user && total > 0 && total <= user.balance 
    : userAsset && parseFloat(amount) > 0 && parseFloat(amount) <= userAsset.amount;

  useEffect(() => {
    // If coinId is in URL, select that coin
    if (coinId && cryptocurrencies.length > 0) {
      const exists = cryptocurrencies.some(crypto => crypto.id === coinId);
      if (exists) {
        setSelectedCoin(coinId);
      } else {
        setSelectedCoin(cryptocurrencies[0].id);
      }
    } else if (cryptocurrencies.length > 0 && !selectedCoin) {
      setSelectedCoin(cryptocurrencies[0].id);
    }
  }, [coinId, cryptocurrencies, selectedCoin]);

  const handleCoinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCoin(e.target.value);
    setAmount('');
    setError('');
    setSuccess('');
    // Update URL
    navigate(`/trade?coin=${e.target.value}`);
  };

  const handleTradeTypeChange = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setAmount('');
    setError('');
    setSuccess('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input with decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handlePercentage = (percentage: number) => {
    if (!selectedCrypto) return;
    
    if (tradeType === 'buy' && user) {
      const maxAmount = user.balance / selectedCrypto.price;
      const newAmount = (maxAmount * percentage).toFixed(6);
      setAmount(newAmount);
    } else if (tradeType === 'sell' && userAsset) {
      const newAmount = (userAsset.amount * percentage).toFixed(6);
      setAmount(newAmount);
    }
  };

  const handleUSDTTransaction = async (type: 'buy' | 'sell') => {
    if (!user || !amount) return;
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    let updatedUser;
    
    if (type === 'buy') {
      updatedUser = processUSDTPurchase(user, amountValue, mmkRate);
      if (!updatedUser) {
        setError('Insufficient MMK balance for this transaction');
        return;
      }
    } else {
      updatedUser = processUSDTSale(user, amountValue, mmkRate);
      if (!updatedUser) {
        setError('Insufficient USDT balance for this transaction');
        return;
      }
    }
    
    updateUser(updatedUser);
    setSuccess(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amountValue} USDT`);
    setAmount('');
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleSubmit = () => {
    if (!user || !selectedCrypto || !amount) return;
    
    // Handle USDT trading separately
    if (selectedCrypto.symbol === 'USDT') {
      handleUSDTTransaction(tradeType);
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    let updatedUser;
    
    if (tradeType === 'buy') {
      updatedUser = processBuyTransaction(user, selectedCrypto, amountValue);
      if (!updatedUser) {
        setError('Insufficient USDT balance for this transaction');
        return;
      }
    } else {
      updatedUser = processSellTransaction(user, selectedCrypto, amountValue);
      if (!updatedUser) {
        setError('Insufficient crypto balance for this transaction');
        return;
      }
    }
    
    updateUser(updatedUser);
    setSuccess(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${amountValue} ${selectedCrypto.symbol}`);
    setAmount('');
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const renderBalances = () => {
    if (!user) return null;

    if (selectedCrypto?.symbol === 'USDT') {
      return (
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-1">
            {tradeType === 'buy' ? 'Available MMK Balance' : 'Available USDT'}
          </p>
          <p className="text-white font-medium">
            {tradeType === 'buy' 
              ? formatMMK(user.balance)
              : `${formatCryptoAmount(user.usdtBalance, 'USDT')} USDT`
            }
          </p>
          {selectedCrypto?.symbol === 'USDT' && (
            <p className="text-gray-400 text-sm mt-1">
              Rate: 1 USDT = {formatMMK(mmkRate)}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-1">
          {tradeType === 'buy' ? 'Available USDT' : 'Available Crypto'}
        </p>
        <p className="text-white font-medium">
          {tradeType === 'buy' 
            ? `${formatCryptoAmount(user.usdtBalance, 'USDT')} USDT`
            : userAsset 
              ? `${formatCryptoAmount(userAsset.amount, userAsset.symbol)} ${userAsset.symbol}`
              : `0 ${selectedCrypto?.symbol || ''}`
          }
        </p>
      </div>
    );
  };

  const refreshData = () => {
    setRefreshing(true);
    // In a real app, this would refresh crypto prices
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Trade Cryptocurrency</h1>
          <button 
            onClick={refreshData}
            className="flex items-center text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-md px-3 py-2 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coin Selector and Chart */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
            <div className="mb-6">
              <label htmlFor="coinSelect" className="block text-sm font-medium text-gray-300 mb-2">
                Select Cryptocurrency
              </label>
              <select
                id="coinSelect"
                value={selectedCoin}
                onChange={handleCoinChange}
                className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {cryptocurrencies.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedCrypto && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center">
                      <img 
                        src={selectedCrypto.image} 
                        alt={selectedCrypto.name} 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <h2 className="text-xl font-bold text-white">{selectedCrypto.name}</h2>
                      <span className="ml-2 text-gray-400">({selectedCrypto.symbol})</span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-2xl font-bold text-white mr-2">
                        {formatCurrency(selectedCrypto.price)}
                      </span>
                      <div className={`flex items-center ${
                        selectedCrypto.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {selectedCrypto.change24h >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(selectedCrypto.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {userAsset && (
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Your Balance</p>
                      <p className="text-white font-medium">
                        {formatCryptoAmount(userAsset.amount, userAsset.symbol)} {userAsset.symbol}
                      </p>
                      <p className="text-gray-400 text-sm">
                        ≈ {formatCurrency(userAsset.amount * selectedCrypto.price)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <PriceChart 
                    symbol={selectedCrypto.symbol}
                    price={selectedCrypto.price}
                    change24h={selectedCrypto.change24h}
                  />
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700 p-3 rounded-md">
                    <p className="text-gray-400 text-xs">Market Cap</p>
                    <p className="text-white">{formatCurrency(selectedCrypto.marketCap)}</p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-md">
                    <p className="text-gray-400 text-xs">Rank</p>
                    <p className="text-white">#{selectedCrypto.rank}</p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-md">
                    <p className="text-gray-400 text-xs">24h Change</p>
                    <p className={selectedCrypto.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {selectedCrypto.change24h.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-slate-700 p-3 rounded-md">
                    <p className="text-gray-400 text-xs">Price</p>
                    <p className="text-white">{formatCurrency(selectedCrypto.price)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Trade Form */}
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto?.symbol}
              </h2>
              
              <div className="flex border border-slate-700 rounded-md overflow-hidden mb-6">
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors ${
                    tradeType === 'buy'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  onClick={() => handleTradeTypeChange('buy')}
                >
                  Buy
                </button>
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors ${
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  onClick={() => handleTradeTypeChange('sell')}
                >
                  Sell
                </button>
              </div>
              
              {user && renderBalances()}
              
              {error && (
                <div className="mb-4 bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-emerald-900/30 border border-emerald-500 rounded-md p-3">
                  <p className="text-sm text-emerald-200">{success}</p>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({selectedCrypto?.symbol})
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => handlePercentage(percentage)}
                      className="bg-slate-700 hover:bg-slate-600 text-gray-300 rounded py-1 text-xs transition-colors"
                    >
                      {percentage * 100}%
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total {tradeType === 'buy' ? 'Cost' : 'Received'}
                </label>
                <div className="bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white">
                  {formatCurrency(total)}
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!canProceed}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  canProceed
                    ? tradeType === 'buy'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto?.symbol}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;