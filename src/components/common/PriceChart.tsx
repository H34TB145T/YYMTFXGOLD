import React, { useEffect, useState, useCallback } from 'react';
import { Transaction } from '../../types';

interface PriceChartProps {
  symbol: string;
  price: number;
  change24h: number;
  transactions?: Transaction[];
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, price, change24h, transactions = [] }) => {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [volumeBars, setVolumeBars] = useState<number[]>([]);
  const pointCount = 96; // 24 hours with 15-minute intervals
  const isPositive = change24h >= 0;
  
  // Filter recent transactions (last 24 hours)
  const recentTransactions = transactions?.filter(t => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    return t.timestamp > twentyFourHoursAgo;
  }) || [];

  const generateRealisticPrice = useCallback((basePrice: number, volatility: number) => {
    const randomFactor = Math.random() * 2 - 1;
    const change = basePrice * volatility * randomFactor;
    return basePrice + change;
  }, []);

  useEffect(() => {
    const generateInitialData = () => {
      const prices: number[] = [];
      const volumes: number[] = [];
      let currentPrice = price * 0.95;
      const trend = isPositive ? 1 : -1;
      const baseVolatility = 0.002;
      
      for (let i = 0; i < pointCount; i++) {
        const timeOfDay = (i / pointCount) * 24;
        const marketActivity = Math.sin((timeOfDay - 6) * Math.PI / 12) + 1;
        const volatility = baseVolatility * (1 + marketActivity);
        
        const trendProgress = i / pointCount;
        const trendInfluence = (Math.abs(change24h) / 100) * trendProgress * trend;
        
        currentPrice = generateRealisticPrice(currentPrice, volatility);
        currentPrice *= (1 + trendInfluence * 0.1);
        
        prices.push(currentPrice);
        
        const volumeChange = Math.abs(prices[i] - (prices[i - 1] || prices[i]));
        volumes.push(volumeChange * 1000);
      }
      
      prices[prices.length - 1] = price;
      
      return { prices, volumes };
    };

    const { prices, volumes } = generateInitialData();
    setPriceHistory(prices);
    setVolumeBars(volumes);
  }, [price, change24h, generateRealisticPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const newHistory = [...prev.slice(1)];
        const lastPrice = newHistory[newHistory.length - 1];
        const timeOfDay = new Date().getHours() + new Date().getMinutes() / 60;
        const marketActivity = Math.sin((timeOfDay - 6) * Math.PI / 12) + 1;
        const volatility = 0.002 * (1 + marketActivity);
        
        const newPrice = generateRealisticPrice(lastPrice, volatility);
        newHistory.push(newPrice);
        
        return newHistory;
      });
      
      setVolumeBars(prev => {
        const newVolumes = [...prev.slice(1)];
        const randomVolume = Math.random() * Math.max(...prev) * 0.5;
        newVolumes.push(randomVolume);
        return newVolumes;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [generateRealisticPrice]);

  const minPrice = Math.min(...priceHistory) * 0.999;
  const maxPrice = Math.max(...priceHistory) * 1.001;
  const priceRange = maxPrice - minPrice;
  const maxVolume = Math.max(...volumeBars);
  
  const scaleY = (value: number) => {
    return 85 - ((value - minPrice) / priceRange) * 70;
  };
  
  const scaleVolume = (value: number) => {
    return (value / maxVolume) * 15;
  };

  const scaleX = (timestamp: number) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    return ((timestamp - twentyFourHoursAgo) / (now - twentyFourHoursAgo)) * 100;
  };
  
  const createPricePath = () => {
    const width = 100 / (pointCount - 1);
    return priceHistory.reduce((path, price, i) => {
      const x = i * width;
      const y = scaleY(price);
      return path + `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }, '');
  };

  const createAreaPath = () => {
    const width = 100 / (pointCount - 1);
    let path = priceHistory.reduce((acc, price, i) => {
      const x = i * width;
      const y = scaleY(price);
      return acc + `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }, '');
    
    path += ` L ${100},85 L 0,85 Z`;
    return path;
  };

  const lineGradientId = `line-gradient-${symbol.toLowerCase()}`;
  const areaGradientId = `area-gradient-${symbol.toLowerCase()}`;
  
  return (
    <div className="w-full h-48 relative bg-slate-800/50 rounded-lg p-4">
      <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} />
            <stop offset="100%" stopColor={isPositive ? '#059669' : '#dc2626'} />
          </linearGradient>
          
          <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {volumeBars.map((volume, i) => (
          <rect
            key={i}
            x={`${(i / pointCount) * 100}%`}
            y={`${85 - scaleVolume(volume)}%`}
            width={`${100 / pointCount}%`}
            height={`${scaleVolume(volume)}%`}
            fill={isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
          />
        ))}
        
        <path
          d={createAreaPath()}
          fill={`url(#${areaGradientId})`}
          className="transition-all duration-300 ease-in-out"
        />
        
        <path
          d={createPricePath()}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
        
        {/* Trade markers */}
        {recentTransactions.map((transaction) => {
          const x = scaleX(transaction.timestamp);
          const y = scaleY(transaction.price);
          const isBuy = transaction.type === 'buy' || transaction.type === 'long';
          const color = isBuy ? '#10b981' : '#ef4444';
          
          return (
            <g key={transaction.id} className="transition-transform duration-300">
              {/* Marker line */}
              <line
                x1={`${x}%`}
                y1="15%"
                x2={`${x}%`}
                y2="85%"
                stroke={color}
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
              {/* Trade point */}
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="1"
                className="transition-all duration-300"
              />
              {/* Trade type indicator */}
              <path
                d={isBuy 
                  ? `M ${x-0.5}%,${y+2}% l 0.5%,-1% l 0.5%,1% Z` 
                  : `M ${x-0.5}%,${y-2}% l 0.5%,1% l 0.5%,-1% Z`}
                fill="white"
                className="transition-all duration-300"
              />
            </g>
          );
        })}
        
        <circle
          cx="100%"
          cy={`${scaleY(price)}%`}
          r="3"
          fill={isPositive ? '#10b981' : '#ef4444'}
          className="animate-pulse"
        />
      </svg>
      
      <div className="absolute top-2 right-2 text-xs font-mono bg-slate-800/90 rounded px-2 py-1">
        <div className="text-gray-300">{formatPrice(maxPrice)}</div>
        <div className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
          {formatPrice(price)}
        </div>
        <div className="text-gray-300">{formatPrice(minPrice)}</div>
      </div>
      
      <div className="absolute bottom-0 left-2 right-2 flex justify-between text-xs text-gray-400">
        <span>24h ago</span>
        <span>12h ago</span>
        <span>Now</span>
      </div>
    </div>
  );
};

const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  if (price >= 0.0001) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(8)}`;
};

export default PriceChart;