import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { Wallet, ArrowUpRight, ArrowDownRight, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';

const WalletManager: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');

  const networks = {
    TRC20: {
      address: 'TRC20AdminWalletAddress',
      name: 'Tron (TRC20)',
      fee: '1 USDT'
    },
    ERC20: {
      address: 'ERC20AdminWalletAddress',
      name: 'Ethereum (ERC20)',
      fee: '15-20 USDT'
    },
    BEP20: {
      address: 'BEP20AdminWalletAddress',
      name: 'BSC (BEP20)',
      fee: '0.5-1 USDT'
    }
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

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-6">Wallet Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Wallet className="h-6 w-6 text-emerald-500 mr-2" />
                  <h2 className="text-xl font-bold text-white">Your Balance</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Available USDT</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(user?.usdtBalance || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">Deposit USDT</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(networks) as Array<keyof typeof networks>).map((network) => (
                    <button
                      key={network}
                      onClick={() => setSelectedNetwork(network)}
                      className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        selectedNetwork === network
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {networks[network].name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-6">
                <div className="flex justify-center mb-6">
                  <QRCode 
                    value={networks[selectedNetwork].address}
                    size={200}
                    className="bg-white p-2 rounded"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wallet Address
                    </label>
                    <div className="flex items-center bg-slate-800 rounded-md p-3">
                      <input
                        type="text"
                        readOnly
                        value={networks[selectedNetwork].address}
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(networks[selectedNetwork].address)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        {copied ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-2">Important Notes:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                      <li>Only send USDT via the {networks[selectedNetwork].name} network</li>
                      <li>Minimum deposit: 10 USDT</li>
                      <li>Network fee: {networks[selectedNetwork].fee}</li>
                      <li>Deposits will be credited after network confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManager;