export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  wallet_address?: string;
  balance: number; // MMK balance
  usdtBalance: number;
  marginBalance: number;
  assets: CryptoAsset[];
  transactions: Transaction[];
  positions: Position[];
}

export interface Order {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  cryptoType: string;
  amount: number;
  priceUsd: number;
  priceMmk: number;
  paymentMethod: string;
  paymentScreenshotUrl?: string;
  walletAddress: string;
  memo?: string;
  bankAccountName?: string;
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  adminId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  qrCodeUrl?: string;
  isActive: boolean;
}

export interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
  marketCap: number;
  rank: number;
}

export interface CryptoAsset {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
}

export interface Transaction {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  amount: number;
  price: number;
  total: number;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'transfer' | 'long' | 'short';
  timestamp: number;
}

export interface Position {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  type: 'long' | 'short';
  leverage: number;
  size: number;
  entryPrice: number;
  liquidationPrice: number;
  margin: number;
  pnl: number;
  timestamp: number;
  isOpen: boolean;
}

export interface USDTWallet {
  address: string;
  network: 'TRC20' | 'ERC20' | 'BEP20';
  memo?: string;
}

export interface TradingMode {
  type: 'spot' | 'futures';
  leverage?: number;
}