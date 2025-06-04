import { Cryptocurrency, CryptoAsset, Transaction, User, Position } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// Format MMK currency
export const formatMMK = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0
  }).format(value);
};

// Format large numbers with abbreviation (K, M, B)
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toString();
};

// Format crypto amount with appropriate precision
export const formatCryptoAmount = (amount: number, symbol: string): string => {
  const lowValueCoins = ['SHIB'];
  const precision = lowValueCoins.includes(symbol) ? 8 : 6;
  return amount.toFixed(precision);
};

// Calculate total portfolio value including positions
export const calculatePortfolioValue = (assets: CryptoAsset[], positions: Position[], cryptos: Cryptocurrency[]): number => {
  if (!Array.isArray(assets) || !Array.isArray(cryptos)) {
    return 0;
  }

  const spotValue = assets.reduce((total, asset) => {
    const crypto = cryptos.find(c => c.id === asset.coinId);
    if (crypto) {
      return total + (asset.amount * crypto.price);
    }
    return total;
  }, 0);

  const futuresValue = Array.isArray(positions) ? positions.reduce((total, position) => {
    if (!position.isOpen) return total;
    const crypto = cryptos.find(c => c.id === position.coinId);
    if (crypto) {
      const pnl = calculatePositionPnL(position, crypto.price);
      return total + pnl;
    }
    return total;
  }, 0) : 0;

  return spotValue + futuresValue;
};

// Process a buy transaction using USDT
export const processBuyTransaction = (
  user: User,
  crypto: Cryptocurrency,
  amount: number
): User | null => {
  if (crypto.symbol === 'USDT') {
    return null; // USDT purchases must be done through fiat
  }

  const total = amount * crypto.price;
  
  if (user.usdtBalance < total) {
    return null;
  }
  
  const transaction: Transaction = {
    id: uuidv4(),
    coinId: crypto.id,
    coinName: crypto.name,
    coinSymbol: crypto.symbol,
    amount,
    price: crypto.price,
    total,
    type: 'buy',
    timestamp: Date.now()
  };
  
  let updatedAssets = [...user.assets];
  const existingAssetIndex = updatedAssets.findIndex(asset => asset.coinId === crypto.id);
  
  if (existingAssetIndex >= 0) {
    const existingAsset = updatedAssets[existingAssetIndex];
    updatedAssets[existingAssetIndex] = {
      ...existingAsset,
      amount: existingAsset.amount + amount,
      purchasePrice: (existingAsset.purchasePrice * existingAsset.amount + crypto.price * amount) / 
                    (existingAsset.amount + amount)
    };
  } else {
    updatedAssets.push({
      coinId: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      amount,
      purchasePrice: crypto.price
    });
  }
  
  return {
    ...user,
    usdtBalance: user.usdtBalance - total,
    assets: updatedAssets,
    transactions: [transaction, ...user.transactions]
  };
};

// Process a sell transaction to receive USDT
export const processSellTransaction = (
  user: User,
  crypto: Cryptocurrency,
  amount: number
): User | null => {
  if (crypto.symbol === 'USDT') {
    return null; // USDT sales must be done through fiat
  }

  const assetIndex = user.assets.findIndex(asset => asset.coinId === crypto.id);
  if (assetIndex === -1 || user.assets[assetIndex].amount < amount) {
    return null;
  }
  
  const total = amount * crypto.price;
  
  const transaction: Transaction = {
    id: uuidv4(),
    coinId: crypto.id,
    coinName: crypto.name,
    coinSymbol: crypto.symbol,
    amount,
    price: crypto.price,
    total,
    type: 'sell',
    timestamp: Date.now()
  };
  
  let updatedAssets = [...user.assets];
  const asset = updatedAssets[assetIndex];
  const newAmount = asset.amount - amount;
  
  if (newAmount > 0.000001) {
    updatedAssets[assetIndex] = {
      ...asset,
      amount: newAmount
    };
  } else {
    updatedAssets = updatedAssets.filter((_, index) => index !== assetIndex);
  }
  
  return {
    ...user,
    usdtBalance: user.usdtBalance + total,
    assets: updatedAssets,
    transactions: [transaction, ...user.transactions]
  };
};

// Process USDT purchase with local currency (MMK)
export const processUSDTPurchase = (
  user: User,
  amount: number,
  mmkRate: number
): User | null => {
  const mmkAmount = amount * mmkRate;
  if (user.balance < mmkAmount) {
    return null;
  }

  const transaction: Transaction = {
    id: uuidv4(),
    coinId: 'tether',
    coinName: 'Tether',
    coinSymbol: 'USDT',
    amount,
    price: 1,
    total: amount,
    type: 'buy',
    timestamp: Date.now()
  };

  return {
    ...user,
    balance: user.balance - mmkAmount,
    usdtBalance: user.usdtBalance + amount,
    transactions: [transaction, ...user.transactions]
  };
};

// Process USDT sale for local currency (MMK)
export const processUSDTSale = (
  user: User,
  amount: number,
  mmkRate: number
): User | null => {
  if (user.usdtBalance < amount) {
    return null;
  }

  const mmkAmount = amount * mmkRate;
  
  const transaction: Transaction = {
    id: uuidv4(),
    coinId: 'tether',
    coinName: 'Tether',
    coinSymbol: 'USDT',
    amount,
    price: 1,
    total: amount,
    type: 'sell',
    timestamp: Date.now()
  };

  return {
    ...user,
    balance: user.balance + mmkAmount,
    usdtBalance: user.usdtBalance - amount,
    transactions: [transaction, ...user.transactions]
  };
};

// Format date from timestamp
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

// Calculate available margin
export const calculateAvailableMargin = (user: User): number => {
  return user.marginBalance;
};

// Check if position should be liquidated
export const shouldLiquidatePosition = (position: Position, currentPrice: number): boolean => {
  return position.type === 'long' 
    ? currentPrice <= position.liquidationPrice
    : currentPrice >= position.liquidationPrice;
};