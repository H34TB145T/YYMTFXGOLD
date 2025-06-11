import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Transaction, User } from '../../types';
import { formatCurrency, formatCryptoAmount, formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, AlertCircle, Wallet } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your API
    const orders = user?.transactions.filter(t => t.status === 'pending') || [];
    setPendingOrders(orders);
    setLoading(false);
  }, [user]);

  const handleApproveOrder = (orderId: string) => {
    // Implement order approval logic
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const handleRejectOrder = (orderId: string) => {
    // Implement order rejection logic
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
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
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        {/* Admin Wallet Addresses */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Admin Wallet Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
                <h3 className="text-white font-medium">USDT (TRC20)</h3>
              </div>
              <p className="text-gray-300 text-sm break-all">TRC20WalletAddressHere</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
                <h3 className="text-white font-medium">USDT (ERC20)</h3>
              </div>
              <p className="text-gray-300 text-sm break-all">ERC20WalletAddressHere</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Wallet className="h-5 w-5 text-emerald-500 mr-2" />
                <h3 className="text-white font-medium">USDT (BEP20)</h3>
              </div>
              <p className="text-gray-300 text-sm break-all">BEP20WalletAddressHere</p>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Pending Orders</h2>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Wallet Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {pendingOrders.map((order) => (
                    <tr key={order.id}>
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
                        {order.coinSymbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatCryptoAmount(order.amount, order.coinSymbol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-300 text-sm truncate max-w-xs">
                          {order.walletAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(order.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
      </div>
    </div>
  );
};

export default AdminDashboard;