import React from 'react';
import { CryptoAsset, Cryptocurrency } from '../../types';
import { formatCurrency, formatCryptoAmount } from '../../utils/helpers';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AssetCardProps {
  asset: CryptoAsset;
  crypto: Cryptocurrency;
  onClick?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, crypto, onClick }) => {
  const currentValue = asset.amount * crypto.price;
  const purchasedValue = asset.amount * asset.purchasePrice;
  const profitLoss = currentValue - purchasedValue;
  const profitLossPercentage = (profitLoss / purchasedValue) * 100;
  const isProfit = profitLoss >= 0;
  
  return (
    <div 
      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <img 
          src={crypto.image} 
          alt={crypto.name} 
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-medium">{crypto.name}</h3>
              <p className="text-gray-400 text-sm">{crypto.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(currentValue)}</p>
              <div className={`text-sm flex items-center justify-end ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfit ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(profitLossPercentage).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Amount</span>
          <span>{formatCryptoAmount(asset.amount, asset.symbol)} {asset.symbol}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-gray-400">Avg. Purchase Price</span>
          <span className="text-gray-300">{formatCurrency(asset.purchasePrice)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-gray-400">Profit/Loss</span>
          <span className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
            {formatCurrency(profitLoss)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;