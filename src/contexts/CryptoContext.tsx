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

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      // Using mock data instead of API call to avoid CORS issues
      setCryptocurrencies(cryptoData);
    } catch (error) {
      console.error('Error setting cryptocurrency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Fetch new data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    
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