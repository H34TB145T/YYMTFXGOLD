import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { Cryptocurrency } from '../../types';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import { AlertCircle, Wallet, Copy, CheckCircle, QrCode } from 'lucide-react';

interface FuturesTradingProps {
  selectedCrypto: Cryptocurrency;
  onTrade: (type: 'long' | 'short', amount: number, leverage: number, walletAddress: string) => void;
}

const FuturesTrading: React.FC<FuturesTradingProps> = ({ selectedCrypto, onTrade }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Admin USDT wallet addresses for margin payments
  const adminUSDTWallets = {
    TRC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
    ERC20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e',
    BEP20: '0x0b1aacd7f24c5dde9df5eb9a4d714b6a634e2f0e'
  };

  const total = amount ? parseFloat(amount) * selectedCrypto.price : 0;
  const margin = total / leverage;
  const liquidationPrice = tradeType === 'long'
    ? selectedCrypto.price * (1 - (1 / leverage))
    : selectedCrypto.price * (1 + (1 / leverage));

  const canTrade = user?.marginBalance && margin <= user.marginBalance;

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

  const handleLeverageChange = (newLeverage: number) => {
    setLeverage(newLeverage);
  };

  const handlePercentage = (percentage: number) => {
    if (user?.marginBalance) {
      const maxMargin = user.marginBalance * percentage;
      const maxAmount = (maxMargin * leverage) / selectedCrypto.price;
      setAmount(maxAmount.toFixed(6));
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
    setShowPaymentDetails(true);
  };

  const confirmTrade = () => {
    const amountValue = parseFloat(amount);
    onTrade(tradeType, amountValue, leverage, walletAddress);
    setAmount('');
    setWalletAddress('');
    setShowPaymentDetails(false);
  };

  if (showPaymentDetails) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <QrCode className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Fund Your Futures Position</h3>
          <p className="text-gray-400">Send margin payment to open your {tradeType} position</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">Position Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Position Type:</span>
              <span className={`font-medium ${tradeType === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>
                {tradeType.toUpperCase()} {selectedCrypto.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size:</span>
              <span className="text-white">{formatCryptoAmount(parseFloat(amount), selectedCrypto.symbol)} {selectedCrypto.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Leverage:</span>
              <span className="text-white">{leverage}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Entry Price:</span>
              <span className="text-white">{formatCurrency(selectedCrypto.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Liquidation Price:</span>
              <span className="text-red-400">{formatCurrency(liquidationPrice)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-gray-400 font-medium">Required Margin:</span>
              <span className="text-blue-400 font-bold">{formatCurrency(margin)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Wallet:</span>
              <span className="text-white text-xs break-all">{walletAddress}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Margin Payment Instructions
          </h4>
          
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">Send <strong>{formatCurrency(margin)} USDT</strong> to any of these addresses:</p>
            
            <div className="space-y-3">
              <div className="bg-slate-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-400 mb-1">USDT (TRC20) - Recommended</p>
                    <p className="text-white font-mono text-sm break-all">{adminUSDTWallets.TRC20}</p>
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

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h4 className="text-blue-400 font-medium mb-2">⚠️ Important Futures Trading Instructions:</h4>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Send exactly: <strong>{formatCurrency(margin)} USDT</strong> as margin</li>
            <li>• Position will be opened after payment confirmation</li>
            <li>• Profits/losses will be sent to: <strong>{walletAddress}</strong></li>
            <li>• Monitor liquidation price: <strong>{formatCurrency(liquidationPrice)}</strong></li>
            <li>• Higher leverage = higher risk and potential rewards</li>
            <li>• Position processing time: 10-30 minutes</li>
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
            onClick={confirmTrade}
            className={`flex-1 rounded-md px-4 py-3 font-medium transition-colors ${
              tradeType === 'long'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            I've Sent Margin
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Need help? Contact support at <span className="text-blue-400">admin@fxgold.shop</span>
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
              tradeType === 'long'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
            onClick={() => setTradeType('long')}
          >
            Long
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              tradeType === 'short'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
            onClick={() => setTradeType('short')}
          >
            Short
          </button>
        </div>

        {user && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-1">Available Margin</p>
            <p className="text-white font-medium">
              {formatCurrency(user.marginBalance)} USDT
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Leverage
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 3, 5, 10, 20].map((l) => (
              <button
                key={l}
                onClick={() => handleLeverageChange(l)}
                className={`py-1 px-2 rounded text-sm font-medium transition-colors ${
                  leverage === l
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Position Size ({selectedCrypto.symbol})
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
            {tradeType === 'long' 
              ? `Your ${selectedCrypto.symbol} Wallet Address for Profits`
              : 'Your USDT Wallet Address for Profits'}
          </label>
          <input
            id="walletAddress"
            type="text"
            value={walletAddress}
            onChange={handleWalletAddressChange}
            className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder={`Enter ${tradeType === 'long' ? selectedCrypto.symbol : 'USDT'} wallet address for profits`}
          />
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Required Margin</span>
            <span className="text-white">{formatCurrency(margin)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Entry Price</span>
            <span className="text-white">{formatCurrency(selectedCrypto.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Liquidation Price</span>
            <span className="text-red-400">{formatCurrency(liquidationPrice)}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || !walletAddress}
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            amount && walletAddress
              ? tradeType === 'long'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {tradeType === 'long' ? 'Open Long' : 'Open Short'} {selectedCrypto.symbol}
        </button>

        <div className="mt-4 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-white font-medium mb-2">How to Trade Futures:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
            <li>Select your position type (Long/Short)</li>
            <li>Choose your leverage (higher leverage = higher risk)</li>
            <li>Enter the position size</li>
            <li>Provide your wallet address for receiving profits</li>
            <li>Send USDT margin to our admin wallet</li>
            <li>Position will be opened after payment confirmation</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FuturesTrading;