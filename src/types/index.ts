export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  assets: CryptoAsset[];
  transactions: Transaction[];
  positions: Position[];
  marginBalance: number;
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
  type: 'buy' | 'sell' | 'long' | 'short' | 'close';
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