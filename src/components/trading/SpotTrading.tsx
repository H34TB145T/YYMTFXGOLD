import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import { Cryptocurrency } from '../../types';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import { AlertCircle } from 'lucide-react';
import PriceChart from '../common/PriceChart';

interface SpotTradingProps {
  selectedCrypto: Cryptocurrency;
  onTrade: (type: 'buy' | 'sell', amount: number) => void;
}

const SpotTrading: React.FC<SpotTradingProps> = ({ selectedCrypto, onTrade }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState('');

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

  const handlePercentage = (percentage: number) => {
    if (tradeType === 'buy' && user?.usdtBalance) {
      const maxAmount = user.usdtBalance / selectedCrypto.price;
      setAmount((maxAmount * percentage).toFixed(6));
    } else if (userAsset) {
      setAmount((userAsset.amount * percentage).toFixed(6));
    }
  };

  const handleSubmit = () => {
    if (!amount) return;
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    onTrade(tradeType, amountValue);
    setAmount('');
  };

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
          disabled={!canTrade || !amount}
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            canTrade && amount
              ? tradeType === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto.symbol}
        </button>
      </div>
    </div>
  );
};

export default SpotTrading;