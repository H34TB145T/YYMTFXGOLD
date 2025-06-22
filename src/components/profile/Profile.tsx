import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { calculatePortfolioValue, formatCurrency, formatCryptoAmount, formatDate } from '../../utils/helpers';
import AssetCard from '../common/AssetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import TwoFactorSettings from './TwoFactorSettings';
import AccountSettings from './AccountSettings';
import { User, Clock, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Shield, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabType = 'wallet' | 'transactions' | 'settings' | 'security';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { cryptocurrencies, loading } = useCrypto();
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const navigate = useNavigate();

  const portfolioValue = user && cryptocurrencies.length > 0
    ? calculatePortfolioValue(user.assets, user.positions || [], cryptocurrencies)
    : 0;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
          
          {/* User Info Card */}
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="mb-4 md:mb-0 md:mr-6">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-emerald-500">
                  <User className="h-8 w-8" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{user?.username || user?.full_name}</h2>
                <p className="text-gray-400">{user?.email}</p>
                {user?.twoFactorEnabled && (
                  <div className="flex items-center mt-2">
                    <Shield className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-400 text-sm">2FA Enabled</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Available Balance</p>
                  <p className="text-white font-medium">{formatCurrency(user?.balance || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Portfolio Value</p>
                  <p className="text-white font-medium">{formatCurrency(portfolioValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-slate-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('wallet')}
                className={`py-4 px-6 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'wallet' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('transactions')}
                className={`py-4 px-6 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'transactions' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Transactions
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('security')}
                className={`py-4 px-6 font-medium text-sm mr-8 border-b-2 ${
                  activeTab === 'security' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('settings')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'settings' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </div>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Your Crypto Assets</h2>
                <button
                  onClick={() => navigate('/trade')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  Trade Now
                </button>
              </div>
              
              {user?.assets && user.assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="bg-slate-800 rounded-lg p-8 text-center">
                  <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">You don't have any crypto assets yet</p>
                  <button
                    onClick={() => navigate('/trade')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Start Trading
                  </button>
                </div>
              )}
              
              {user?.assets && user.assets.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white mb-4">Portfolio Summary</h3>
                  <div className="bg-slate-800 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Total Portfolio Value</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(portfolioValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Available Balance</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(user?.balance || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Total Assets</p>
                        <p className="text-xl font-bold text-white">{user?.assets.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
              
              {user?.transactions && user.transactions.length > 0 ? (
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
                      {user.transactions.map((transaction) => (
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
                            {formatCryptoAmount(transaction.amount, transaction.coinSymbol)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {formatCurrency(transaction.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {transaction.type === 'buy' ? (
                                <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                              )}
                              <span className={transaction.type === 'buy' ? 'text-red-400' : 'text-emerald-400'}>
                                {formatCurrency(transaction.total)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">You haven't made any transactions yet</p>
                  <button
                    onClick={() => navigate('/trade')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Start Trading
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              <TwoFactorSettings />
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
              <AccountSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;