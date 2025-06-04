export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  wallet_address?: string;
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