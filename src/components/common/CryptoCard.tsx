import React from 'react';
import { Cryptocurrency } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/helpers';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CryptoCardProps {
  crypto: Cryptocurrency;
  onClick?: () => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onClick }) => {
  const isPositive = crypto.change24h >= 0;
  
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
              <p className="text-white font-medium">{formatCurrency(crypto.price)}</p>
              <div className={`text-sm flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(crypto.change24h).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-700 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Market Cap</span>
          <span>{formatCurrency(crypto.marketCap)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-gray-400">Rank</span>
          <span className="text-gray-300">#{crypto.rank}</span>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;