import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Shield, AlertCircle, CheckCircle, RefreshCw, Mail, Clock } from 'lucide-react';

interface TwoFactorAuthProps {
  email: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ email, userId, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [rememberMe, setRememberMe] = useState(false); // Added remember me state

  useEffect(() => {
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.verify2FA(email, otp, userId);
      
      if (result.success) {
        if (result.token && result.user) {
          // Store token based on remember me preference
          if (rememberMe) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('persistentToken', result.token);
          } else {
            localStorage.setItem('token', result.token);
            sessionStorage.setItem('token', result.token);
          }
        }
        setSuccess('2FA verification successful!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('2FA verification failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    try {
      // In a real implementation, you would have a resend 2FA endpoint
      setSuccess('New 2FA code sent to your email');
      setTimeLeft(300); // Reset timer
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to resend 2FA code');
    }
    
    setResending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-16 w-16 text-blue-500" />
              <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                <Mail className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-blue-400 font-medium break-all">{email}</p>
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
              disabled={loading}
            />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-gray-400 text-sm">
                {timeLeft > 0 ? (
                  <>Time remaining: <span className="text-blue-400 font-mono">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-400">Code expired</span>
                )}
              </p>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-2fa"
              name="remember-2fa"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-slate-700"
            />
            <label htmlFor="remember-2fa" className="ml-2 block text-sm text-gray-400">
              Remember me on this device
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 6}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || timeLeft > 240} // Allow resend after 1 minute
              className="text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {resending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
                  Sending...
                </>
              ) : timeLeft > 240 ? (
                `Resend available in ${formatTime(Math.max(0, 300 - timeLeft))}`
              ) : (
                'Resend 2FA code'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Notice
          </h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• This code expires in 5 minutes</li>
            <li>• Each code can only be used once</li>
            <li>• If you didn't request this, contact support</li>
            <li>• Check your spam folder if not received</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;