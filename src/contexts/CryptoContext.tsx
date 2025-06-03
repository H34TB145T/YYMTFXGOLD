import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cryptocurrency } from '../types';
import { cryptoData } from '../utils/mockData';

interface CryptoContextType {
  cryptocurrencies: Cryptocurrency[];
  loading: boolean;
  refreshPrices: () => void;
  getCryptoById: (id: string) => Cryptocurrency | undefined;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

interface CryptoProviderProps {
  children: ReactNode;
}

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCryptoData = () => {
    setLoading(true);
    // In a real app, this would be an API call to get real cryptocurrency data
    // Using mock data for demo purposes
    setTimeout(() => {
      setCryptocurrencies(cryptoData);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Simulate price updates every 10 seconds with more realistic market behavior
    const interval = setInterval(() => {
      setCryptocurrencies(prevCryptos => 
        prevCryptos.map(crypto => {
          // Generate more realistic price movements
          const volatility = crypto.price * 0.02; // 2% max price movement
          const randomChange = (Math.random() - 0.5) * volatility;
          const newPrice = crypto.price + randomChange;
          
          // Calculate new 24h change with some momentum
          const momentum = Math.random() > 0.7 ? 1 : -1;
          const changeAdjustment = (Math.random() * 0.5) * momentum;
          const newChange = Math.max(Math.min(crypto.change24h + changeAdjustment, 15), -15);
          
          return {
            ...crypto,
            price: newPrice,
            change24h: newChange,
          };
        })
      );
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPrices = () => {
    fetchCryptoData();
  };

  const getCryptoById = (id: string) => {
    return cryptocurrencies.find(crypto => crypto.id === id);
  };

  return (
    <CryptoContext.Provider value={{ 
      cryptocurrencies, 
      loading,
      refreshPrices,
      getCryptoById
    }}>
      {children}
    </CryptoContext.Provider>
  );
};