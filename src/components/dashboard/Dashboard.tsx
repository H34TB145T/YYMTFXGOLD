import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { calculatePortfolioValue, formatCurrency } from '../../utils/helpers';
import CryptoCard from '../common/CryptoCard';
import AssetCard from '../common/AssetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { DollarSign, Wallet, BarChart2, Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { cryptocurrencies, loading, refreshPrices } = useCrypto();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.assets && Array.isArray(cryptocurrencies) && cryptocurrencies.length > 0) {
      setPortfolioValue(calculatePortfolioValue(user.assets, user.positions || [], cryptocurrencies));
    }
  }, [user, cryptocurrencies]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshPrices();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const navigateToTrade = (cryptoId: string) => {
    navigate(`/trade?coin=${cryptoId}`);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">Dashboard</h1>
          <button 
            onClick={handleRefresh}
            className="flex items-center text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-md px-3 py-2 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Prices
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/10 rounded-md">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Available Balance</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {formatCurrency(user?.balance || 0)}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Portfolio Value</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-md">
                <BarChart2 className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Assets</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {user?.assets?.length || 0}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/10 rounded-md">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="ml-3 text-gray-300 font-medium">Transactions</h3>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {user?.transactions?.length || 0}
            </p>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">Your Assets</h2>
            {user?.assets && user.assets.length > 0 ? (
              <div className="space-y-4">
                {user.assets.map((asset) => {
                  const crypto = cryptocurrencies.find(c => c.id === asset.coinId);
                  if (!crypto) return null;
                  return (
                    <AssetCard 
                      key={asset.coinId} 
                      asset={asset} 
                      crypto={crypto}
                      onClick={() => navigateToTrade(crypto.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-6 text-center">
                <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">You don't have any assets yet</p>
                <button
                  onClick={() => navigate('/trade')}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Start Trading
                </button>
              </div>
            )}
          </div>
          
          {/* Market Overview */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cryptocurrencies.slice(0, 6).map((crypto) => (
                <CryptoCard 
                  key={crypto.id} 
                  crypto={crypto} 
                  onClick={() => navigateToTrade(crypto.id)}
                />
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/trade')}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                View All Cryptocurrencies
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Transactions */}
        {user?.transactions && user.transactions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Coin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
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
                  {user.transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.type === 'buy' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-white">{transaction.coinName}</span>
                          <span className="ml-1 text-gray-400">({transaction.coinSymbol})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {transaction.amount.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatCurrency(transaction.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {user.transactions.length > 5 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/profile')}
                  className="bg-slate-800 hover:bg-slate-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  View All Transactions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;