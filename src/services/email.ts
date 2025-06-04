import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@freddys.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to Freddy's Crypto Trading!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@freddys.com',
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderType: 'buy' | 'sell',
  orderDetails: any
) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@freddys.com',
    to: email,
    subject: `${orderType.toUpperCase()} Order Confirmation`,
    html: `
      <h1>${orderType.toUpperCase()} Order Confirmation</h1>
      <p>Your order has been received and is being processed.</p>
      <h2>Order Details:</h2>
      <ul>
        <li>Order Type: ${orderType}</li>
        <li>Cryptocurrency: ${orderDetails.cryptoType}</li>
        <li>Amount: ${orderDetails.amount}</li>
        <li>Price (USD): $${orderDetails.priceUsd}</li>
        <li>Price (MMK): ${orderDetails.priceMmk} MMK</li>
        <li>Payment Method: ${orderDetails.paymentMethod}</li>
      </ul>
      <p>We will process your order as soon as possible.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};