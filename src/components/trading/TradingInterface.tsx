import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { TradingMode } from '../../types';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import PriceChart from '../common/PriceChart';
import LoadingSpinner from '../common/LoadingSpinner';
import SpotTrading from './SpotTrading';
import FuturesTrading from './FuturesTrading';
import { RefreshCw } from 'lucide-react';

const TradingInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const coinId = searchParams.get('coin');
  const { user, updateUser } = useAuth();
  const { cryptocurrencies, loading, getCryptoById } = useCrypto();
  const [selectedCoin, setSelectedCoin] = useState(coinId || '');
  const [tradingMode, setTradingMode] = useState<TradingMode>({ type: 'spot' });
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Get currently selected crypto
  const selectedCrypto = selectedCoin ? getCryptoById(selectedCoin) : null;

  useEffect(() => {
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
    navigate(`/trade?coin=${e.target.value}`);
  };

  const handleTradingModeChange = (mode: 'spot' | 'futures') => {
    setTradingMode({ type: mode });
  };

  const refreshData = () => {
    setRefreshing(true);
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
                {cryptocurrencies
                  .filter(crypto => crypto.symbol !== 'USDT')
                  .map((crypto) => (
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
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-white mr-2">
                        {formatCurrency(selectedCrypto.price)}
                      </span>
                      <span className={selectedCrypto.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
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
          
          {/* Trading Interface */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="flex border border-slate-700 rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors ${
                    tradingMode.type === 'spot'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  onClick={() => handleTradingModeChange('spot')}
                >
                  Spot
                </button>
                <button
                  className={`flex-1 py-2 text-center font-medium transition-colors ${
                    tradingMode.type === 'futures'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  onClick={() => handleTradingModeChange('futures')}
                >
                  Futures
                </button>
              </div>
            </div>

            {selectedCrypto && (
              tradingMode.type === 'spot' ? (
                <SpotTrading
                  selectedCrypto={selectedCrypto}
                  onTrade={(type, amount) => {
                    // Handle spot trade
                  }}
                />
              ) : (
                <FuturesTrading
                  selectedCrypto={selectedCrypto}
                  onTrade={(type, amount, leverage) => {
                    // Handle futures trade
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;