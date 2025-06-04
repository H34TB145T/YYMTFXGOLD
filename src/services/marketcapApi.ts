import axios from 'axios';
import { Cryptocurrency } from '../types';

const API_KEY = '711df98f-5237-47c6-bf7e-d8edaac6890f';
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-CMC_PRO_API_KEY': API_KEY
  }
});

export const getTop20Cryptocurrencies = async (): Promise<Cryptocurrency[]> => {
  try {
    const response = await api.get('/cryptocurrency/listings/latest', {
      params: {
        limit: 20,
        convert: 'USD'
      }
    });

    return response.data.data.map((coin: any) => ({
      id: coin.id.toString(),
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      change24h: coin.quote.USD.percent_change_24h,
      marketCap: coin.quote.USD.market_cap,
      rank: coin.cmc_rank,
      image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
    }));
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    throw error;
  }
};

export const getCryptoPrice = async (symbol: string): Promise<number> => {
  try {
    const response = await api.get('/cryptocurrency/quotes/latest', {
      params: {
        symbol,
        convert: 'USD'
      }
    });

    return response.data.data[symbol].quote.USD.price;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    throw error;
  }
};