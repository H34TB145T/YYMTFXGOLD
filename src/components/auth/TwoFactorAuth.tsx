import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { emailService } from '../../services/emailService';
import { Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface TwoFactorAuthProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ email, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    // Send initial 2FA code
    sendTwoFactorCode();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendTwoFactorCode = async () => {
    const result = await emailService.send2FAEmail(email, 'User');
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    const result = emailService.verifyOTP(email, otp, '2fa');
    
    if (result.success) {
      setSuccess('2FA verification successful!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    const result = await emailService.send2FAEmail(email, 'User');
    
    if (result.success) {
      setSuccess('New 2FA code sent to your email');
      setTimeLeft(300); // Reset timer
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
    
    setResending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-blue-400 font-medium">{email}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-emerald-200">{success}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
              Enter 6-digit verification code
            </label>
            <input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full bg-slate-700 border-gray-600 rounded-md py-3 px-4 text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Time remaining: <span className="text-blue-400 font-mono">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 6}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || timeLeft > 240} // Allow resend after 1 minute
                className="text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;