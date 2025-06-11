import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../types';
import { sendOrderConfirmationEmail } from './email';
import { getCryptoPrice } from './marketcapApi';

const MMK_USD_RATE = 3200; // This should come from a forex API in production

export const createBuyOrder = async (
  userId: string,
  cryptoType: string,
  amount: number,
  paymentMethod: string,
  paymentScreenshotUrl: string,
  walletAddress: string,
  memo?: string,
  bankAccountName?: string
): Promise<{ success: boolean; message: string; orderId?: string }> => {
  try {
    const priceUsd = await getCryptoPrice(cryptoType);
    const priceMmk = priceUsd * MMK_USD_RATE;
    const totalUsd = amount * priceUsd;
    const totalMmk = totalUsd * MMK_USD_RATE;

    const orderId = uuidv4();
    await db.execute(
      `INSERT INTO orders (
        id, user_id, type, crypto_type, amount, price_usd, price_mmk,
        payment_method, payment_screenshot_url, wallet_address, memo,
        bank_account_name, status
      ) VALUES (?, ?, 'buy', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orderId,
        userId,
        cryptoType,
        amount,
        priceUsd,
        priceMmk,
        paymentMethod,
        paymentScreenshotUrl,
        walletAddress,
        memo,
        bankAccountName
      ]
    );

    // Get user email
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const user = Array.isArray(users) && users[0];

    if (user) {
      await sendOrderConfirmationEmail(user.email, 'buy', {
        cryptoType,
        amount,
        priceUsd,
        priceMmk,
        paymentMethod,
        totalUsd,
        totalMmk
      });
    }

    return {
      success: true,
      message: 'Buy order created successfully',
      orderId
    };
  } catch (error) {
    console.error('Error creating buy order:', error);
    return { success: false, message: 'Failed to create buy order' };
  }
};

export const createSellOrder = async (
  userId: string,
  cryptoType: string,
  amount: number,
  paymentMethod: string,
  paymentScreenshotUrl: string,
  walletAddress: string,
  bankAccountName: string
): Promise<{ success: boolean; message: string; orderId?: string }> => {
  try {
    const priceUsd = await getCryptoPrice(cryptoType);
    const priceMmk = priceUsd * MMK_USD_RATE;
    const totalUsd = amount * priceUsd;
    const totalMmk = totalUsd * MMK_USD_RATE;

    const orderId = uuidv4();
    await db.execute(
      `INSERT INTO orders (
        id, user_id, type, crypto_type, amount, price_usd, price_mmk,
        payment_method, payment_screenshot_url, wallet_address,
        bank_account_name, status
      ) VALUES (?, ?, 'sell', ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orderId,
        userId,
        cryptoType,
        amount,
        priceUsd,
        priceMmk,
        paymentMethod,
        paymentScreenshotUrl,
        walletAddress,
        bankAccountName
      ]
    );

    // Get user email
    const [users] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const user = Array.isArray(users) && users[0];

    if (user) {
      await sendOrderConfirmationEmail(user.email, 'sell', {
        cryptoType,
        amount,
        priceUsd,
        priceMmk,
        paymentMethod,
        totalUsd,
        totalMmk
      });
    }

    return {
      success: true,
      message: 'Sell order created successfully',
      orderId
    };
  } catch (error) {
    console.error('Error creating sell order:', error);
    return { success: false, message: 'Failed to create sell order' };
  }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return orders as Order[];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    return (Array.isArray(orders) && orders[0]) || null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};