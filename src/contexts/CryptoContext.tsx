import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cryptocurrency } from '../types';
import { getTop20Cryptocurrencies } from '../services/marketcapApi';

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
      const data = await getTop20Cryptocurrencies();
      setCryptocurrencies(data);
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
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