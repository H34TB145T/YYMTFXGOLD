import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { Cryptocurrency } from '../../types';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import { AlertCircle, Wallet, Copy, CheckCircle, QrCode } from 'lucide-react';

interface SpotTradingProps {
  selectedCrypto: Cryptocurrency;
  onTrade: (type: 'buy' | 'sell', amount: number, walletAddress: string) => void;
}

const SpotTrading: React.FC<SpotTradingProps> = ({ selectedCrypto, onTrade }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Admin wallet addresses for receiving payments
  const adminWallets = {
    USDT: {
      TRC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      ERC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
      BEP20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'
    },
    BTC: 'bc1qj4pash8heu35j9s9e4afsq4jfw25und9kkml4w70wezwx3y4gvus558seq',
    ETH: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'
  };

  const userAsset = user?.assets.find(asset => asset.coinId === selectedCrypto.id);
  const total = amount ? parseFloat(amount) * selectedCrypto.price : 0;
  
  const canTrade = tradeType === 'buy' 
    ? user?.usdtBalance && total <= user.usdtBalance
    : userAsset && parseFloat(amount) <= userAsset.amount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(e.target.value);
    setError('');
  };

  const handlePercentage = (percentage: number) => {
    if (tradeType === 'buy' && user?.usdtBalance) {
      const maxAmount = user.usdtBalance / selectedCrypto.price;
      setAmount((maxAmount * percentage).toFixed(6));
    } else if (userAsset) {
      setAmount((userAsset.amount * percentage).toFixed(6));
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

  const handleSubmit = () => {
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (tradeType === 'buy') {
      setShowPaymentDetails(true);
    } else {
      onTrade(tradeType, amountValue, walletAddress);
      setAmount('');
      setWalletAddress('');
    }
  };

  const confirmPurchase = () => {
    const amountValue = parseFloat(amount);
    onTrade(tradeType, amountValue, walletAddress);
    setAmount('');
    setWalletAddress('');
    setShowPaymentDetails(false);
  };

  if (showPaymentDetails && tradeType === 'buy') {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <QrCode className="h-12 w-12 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Complete Your Purchase</h3>
          <p className="text-gray-400">Send payment to complete your {selectedCrypto.symbol} purchase</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Cryptocurrency:</span>
              <span className="text-white">{selectedCrypto.name} ({selectedCrypto.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white">{formatCryptoAmount(parseFloat(amount), selectedCrypto.symbol)} {selectedCrypto.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price per {selectedCrypto.symbol}:</span>
              <span className="text-white">{formatCurrency(selectedCrypto.price)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-gray-400 font-medium">Total Payment:</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Wallet:</span>
              <span className="text-white text-xs break-all">{walletAddress}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Payment Instructions
          </h4>
          
          {selectedCrypto.symbol === 'BTC' && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Send <strong>{formatCurrency(total)}</strong> worth of Bitcoin to:</p>
              <div className="bg-slate-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Bitcoin Address:</p>
                    <p className="text-white font-mono text-sm break-all">{adminWallets.BTC}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminWallets.BTC)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedCrypto.symbol === 'ETH' && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Send <strong>{formatCurrency(total)}</strong> worth of Ethereum to:</p>
              <div className="bg-slate-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ethereum Address:</p>
                    <p className="text-white font-mono text-sm break-all">{adminWallets.ETH}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(adminWallets.ETH)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedCrypto.symbol !== 'BTC' && selectedCrypto.symbol !== 'ETH' && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">Send <strong>{formatCurrency(total)}</strong> in USDT to any of these addresses:</p>
              
              <div className="space-y-3">
                <div className="bg-slate-800 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-400 mb-1">USDT (TRC20) - Recommended</p>
                      <p className="text-white font-mono text-sm break-all">{adminWallets.USDT.TRC20}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(adminWallets.USDT.TRC20)}
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
                      <p className="text-white font-mono text-sm break-all">{adminWallets.USDT.ERC20}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(adminWallets.USDT.ERC20)}
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
                      <p className="text-white font-mono text-sm break-all">{adminWallets.USDT.BEP20}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(adminWallets.USDT.BEP20)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
          <h4 className="text-emerald-400 font-medium mb-2">⚠️ Important Payment Instructions:</h4>
          <ul className="text-emerald-300 text-sm space-y-1">
            <li>• Send the exact amount: <strong>{formatCurrency(total)}</strong></li>
            <li>• Use the correct network to avoid loss of funds</li>
            <li>• Your {selectedCrypto.symbol} will be sent to: <strong>{walletAddress}</strong></li>
            <li>• Processing time: 10-30 minutes after payment confirmation</li>
            <li>• Keep your transaction hash for reference</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowPaymentDetails(false)}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md px-4 py-3 font-medium transition-colors"
          >
            Back to Order
          </button>
          <button
            onClick={confirmPurchase}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-3 font-medium transition-colors"
          >
            I've Sent Payment
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Need help? Contact support at <span className="text-emerald-400">admin@fxgold.shop</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="mb-6">
        <div className="flex border border-slate-700 rounded-md overflow-hidden mb-6">
          <button
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              tradeType === 'buy'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
            onClick={() => setTradeType('buy')}
          >
            Buy
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              tradeType === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
            onClick={() => setTradeType('sell')}
          >
            Sell
          </button>
        </div>

        {user && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">
              {tradeType === 'buy' ? 'Available USDT' : `Available ${selectedCrypto.symbol}`}
            </p>
            <p className="text-white font-medium">
              {tradeType === 'buy'
                ? `${formatCryptoAmount(user.usdtBalance, 'USDT')} USDT`
                : userAsset
                ? `${formatCryptoAmount(userAsset.amount, userAsset.symbol)} ${userAsset.symbol}`
                : `0 ${selectedCrypto.symbol}`}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount ({selectedCrypto.symbol})
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

        <div className="mb-4">
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
            {tradeType === 'buy' 
              ? `Your ${selectedCrypto.symbol} Wallet Address to Receive`
              : 'Your USDT Wallet Address to Receive'}
          </label>
          <input
            id="walletAddress"
            type="text"
            value={walletAddress}
            onChange={handleWalletAddressChange}
            className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={`Enter ${tradeType === 'buy' ? selectedCrypto.symbol : 'USDT'} wallet address`}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Total (USDT)
          </label>
          <div className="bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white">
            {formatCurrency(total)}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || !walletAddress}
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            amount && walletAddress
              ? tradeType === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto.symbol}
        </button>

        {tradeType === 'buy' && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-white font-medium mb-2">How to Buy:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
              <li>Enter the amount of {selectedCrypto.symbol} you want to buy</li>
              <li>Enter your {selectedCrypto.symbol} wallet address where you want to receive the coins</li>
              <li>Click "Buy {selectedCrypto.symbol}" to see payment instructions</li>
              <li>Send payment to our admin wallet address</li>
              <li>Confirm payment and wait for processing (10-30 minutes)</li>
              <li>You will receive your {selectedCrypto.symbol} in your provided wallet address</li>
            </ol>
          </div>
        )}

        {tradeType === 'sell' && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-white font-medium mb-2">How to Sell:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
              <li>Enter the amount of {selectedCrypto.symbol} you want to sell</li>
              <li>Enter your USDT wallet address where you want to receive payment</li>
              <li>Submit the order and wait for admin confirmation</li>
              <li>Once confirmed, your {selectedCrypto.symbol} will be deducted</li>
              <li>You will receive USDT in your provided wallet address</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotTrading;