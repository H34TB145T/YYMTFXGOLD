import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { Transaction, User, Order } from '../../types';
import { formatCurrency, formatCryptoAmount, formatDate } from '../../utils/helpers';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wallet, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  pendingOrders: number;
  totalVolume: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cryptocurrencies } = useCrypto();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'users' | 'transactions' | 'wallets'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingOrders: 0,
    totalVolume: 0,
    totalRevenue: 0
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState('');

  // Admin wallet addresses
  const adminWallets = [
    {
      crypto: 'USDT',
      network: 'TRC20',
      address: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      recommended: true
    },
    {
      crypto: 'USDT',
      network: 'ERC20',
      address: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      recommended: false
    },
    {
      crypto: 'USDT',
      network: 'BEP20',
      address: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      recommended: false
    },
    {
      crypto: 'BTC',
      network: 'Bitcoin',
      address: 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq',
      recommended: true
    },
    {
      crypto: 'ETH',
      network: 'Ethereum',
      address: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      recommended: true
    }
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    setLoading(true);
    
    // Load users from localStorage
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const regularUsers = users.filter((u: User) => u.role !== 'admin');
    setAllUsers(regularUsers);

    // Calculate stats
    const verifiedCount = regularUsers.filter((u: User) => u.is_verified).length;
    const totalVolume = regularUsers.reduce((sum: number, u: User) => {
      return sum + (u.transactions?.reduce((txSum, tx) => txSum + tx.total, 0) || 0);
    }, 0);

    // Mock pending orders (in production, this would come from your backend)
    const mockOrders: Order[] = [
      {
        id: 'order-1',
        userId: 'user-1',
        type: 'buy',
        cryptoType: 'BTC',
        amount: 0.1,
        priceUsd: 45000,
        priceMmk: 45000,
        paymentMethod: 'USDT',
        walletAddress: 'bc1qexampleaddress',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'order-2',
        userId: 'user-2',
        type: 'sell',
        cryptoType: 'ETH',
        amount: 2.5,
        priceUsd: 3000,
        priceMmk: 3000,
        paymentMethod: 'USDT',
        walletAddress: '0xexampleethaddress',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setPendingOrders(mockOrders);

    // Get recent transactions
    const allTransactions = regularUsers.flatMap((u: User) => 
      (u.transactions || []).map(tx => ({ ...tx, userEmail: u.email, userName: u.username || u.full_name }))
    );
    setRecentTransactions(allTransactions.slice(0, 10));

    setStats({
      totalUsers: regularUsers.length,
      verifiedUsers: verifiedCount,
      pendingOrders: mockOrders.length,
      totalVolume,
      totalRevenue: totalVolume * 0.01 // 1% fee
    });

    setLoading(false);
  };

  const handleApproveOrder = (orderId: string) => {
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
    // In production, this would make an API call to approve the order
  };

  const handleRejectOrder = (orderId: string) => {
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
    // In production, this would make an API call to reject the order
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your FxGold trading platform</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400">
              <Shield className="h-4 w-4 mr-1" />
              Administrator
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'orders', label: 'Pending Orders', icon: Clock },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'transactions', label: 'Transactions', icon: TrendingUp },
                { id: 'wallets', label: 'Wallet Addresses', icon: Wallet }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 font-medium text-sm mr-8 border-b-2 flex items-center ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'orders' && pendingOrders.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {pendingOrders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 rounded-md">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="ml-3 text-gray-300 font-medium">Total Users</h3>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-500/10 rounded-md">
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="ml-3 text-gray-300 font-medium">Verified Users</h3>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{stats.verifiedUsers}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-500/10 rounded-md">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="ml-3 text-gray-300 font-medium">Pending Orders</h3>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{stats.pendingOrders}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/10 rounded-md">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="ml-3 text-gray-300 font-medium">Total Volume</h3>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-500/10 rounded-md">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                  <h3 className="ml-3 text-gray-300 font-medium">Revenue</h3>
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{tx.coinSymbol} {tx.type.toUpperCase()}</p>
                        <p className="text-gray-400 text-sm">{(tx as any).userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{formatCurrency(tx.total)}</p>
                        <p className="text-gray-400 text-sm">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Orders Summary */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Pending Orders</h3>
                <div className="space-y-3">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{order.cryptoType} {order.type.toUpperCase()}</p>
                        <p className="text-gray-400 text-sm">{formatCryptoAmount(order.amount, order.cryptoType)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pending Orders</h2>
            </div>

            {pendingOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cryptocurrency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Wallet Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-mono text-sm">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.type === 'buy' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {order.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {order.cryptoType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatCryptoAmount(order.amount, order.cryptoType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-300 text-sm truncate max-w-xs font-mono">
                            {order.walletAddress}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {formatCurrency(order.priceUsd * order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {formatDate(order.createdAt.getTime())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              className="text-emerald-400 hover:text-emerald-300 p-1"
                              title="Approve Order"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Reject Order"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No pending orders</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      USDT Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {allUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-white font-medium">{user.full_name}</div>
                          <div className="text-gray-400 text-sm">@{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.is_verified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                              <UserX className="h-3 w-3 mr-1" />
                              Unverified
                            </span>
                          )}
                          {user.twoFactorEnabled && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                              <Shield className="h-3 w-3 mr-1" />
                              2FA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCurrency(user.balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCryptoAmount(user.usdtBalance, 'USDT')} USDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {user.transactions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">All Transactions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cryptocurrency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-white font-medium">{(tx as any).userName}</div>
                          <div className="text-gray-400 text-sm">{(tx as any).userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.type === 'buy' || tx.type === 'long'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {tx.coinSymbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatCryptoAmount(tx.amount, tx.coinSymbol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatCurrency(tx.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCurrency(tx.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(tx.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wallet Addresses Tab */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Admin Wallet Addresses</h2>
              <p className="text-gray-400 mb-6">
                These are the official wallet addresses for receiving payments. Share these with users for deposits.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {adminWallets.map((wallet, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
                        <h3 className="text-white font-medium">
                          {wallet.crypto} ({wallet.network})
                        </h3>
                        {wallet.recommended && (
                          <span className="ml-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(wallet.address, `${wallet.crypto}-${wallet.network}`)}
                          className="text-gray-400 hover:text-white"
                          title="Copy Address"
                        >
                          {copied === `${wallet.crypto}-${wallet.network}` ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => window.open(`https://blockchair.com/${wallet.crypto.toLowerCase()}/address/${wallet.address}`, '_blank')}
                          className="text-gray-400 hover:text-white"
                          title="View on Blockchain"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded p-3">
                      <p className="text-gray-300 font-mono text-sm break-all">
                        {wallet.address}
                      </p>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Network: {wallet.network} • 
                      {wallet.crypto === 'USDT' && ' Low fees'} 
                      {wallet.crypto === 'BTC' && ' Bitcoin mainnet'}
                      {wallet.crypto === 'ETH' && ' Ethereum mainnet'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Important Security Notes
              </h3>
              <ul className="text-blue-300 text-sm space-y-2">
                <li>• These addresses are for receiving payments only</li>
                <li>• Always verify the correct network before sending funds</li>
                <li>• USDT TRC20 is recommended for lower transaction fees</li>
                <li>• Keep these addresses secure and never share private keys</li>
                <li>• Monitor incoming transactions regularly</li>
                <li>• Set up notifications for large transactions</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;