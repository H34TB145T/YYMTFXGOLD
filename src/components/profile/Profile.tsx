import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { emailService } from '../../services/emailService';
import { calculatePortfolioValue, formatCurrency, formatCryptoAmount, formatDate } from '../../utils/helpers';
import AssetCard from '../common/AssetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { User, Clock, Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabType = 'wallet' | 'transactions' | 'settings';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { cryptocurrencies, loading } = useCrypto();
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const handleToggle2FA = async () => {
    if (!user) return;

    setEnabling2FA(true);
    setError('');
    setSuccess('');

    if (!twoFactorEnabled) {
      // Enable 2FA
      const result = await emailService.send2FAEmail(user.email, user.username || user.full_name);
      
      if (result.success) {
        setSuccess('2FA setup code sent to your email. Please verify to enable 2FA.');
        // In a real app, you'd show a verification modal here
        // For demo, we'll just enable it after a delay
        setTimeout(() => {
          const updatedUser = { ...user, twoFactorEnabled: true };
          updateUser(updatedUser);
          setTwoFactorEnabled(true);
          setSuccess('Two-Factor Authentication enabled successfully!');
        }, 2000);
      } else {
        setError(result.message);
      }
    } else {
      // Disable 2FA
      const updatedUser = { ...user, twoFactorEnabled: false };
      updateUser(updatedUser);
      setTwoFactorEnabled(false);
      setSuccess('Two-Factor Authentication disabled successfully!');
    }

    setEnabling2FA(false);
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
                {twoFactorEnabled && (
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
                onClick={() => handleTabChange('settings')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'settings' 
                    ? 'border-emerald-500 text-emerald-500' 
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
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
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Account Settings</h2>
              
              {error && (
                <div className="mb-4 bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-emerald-200">{success}</p>
                </div>
              )}

              <div className="bg-slate-800 rounded-lg p-6">
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    defaultValue={user?.username || user?.full_name}
                    disabled
                    className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white"
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    Username cannot be changed in the demo version
                  </p>
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white"
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    Email cannot be changed in the demo version
                  </p>
                </div>

                {/* Two-Factor Authentication */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400">
                        Add an extra layer of security to your account with email-based 2FA
                      </p>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      disabled={enabling2FA}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        twoFactorEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-medium text-white mb-4">Demo Account</h3>
                  <p className="text-gray-400 mb-4">
                    This is a demo account for demonstration purposes only. No real money is involved.
                  </p>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    disabled
                  >
                    Reset Account (Disabled in Demo)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;