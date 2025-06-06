import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emailService } from '../../services/emailService';
import { Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

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
  }, [email, navigate]);

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
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    const result = emailService.verifyOTP(email, otp, 'verification');
    
    if (result.success) {
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login?verified=true');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    const result = await emailService.sendVerificationEmail(email, 'User');
    
    if (result.success) {
      setSuccess('New OTP sent to your email');
      setTimeLeft(600); // Reset timer
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-emerald-400 font-medium">{email}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
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
              className="block w-full bg-slate-700 border-gray-600 rounded-md py-3 px-4 text-white text-center text-2xl tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Time remaining: <span className="text-emerald-400 font-mono">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !otp || otp.length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || timeLeft > 540} // Allow resend after 1 minute
                className="text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </p>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-gray-400 hover:text-white text-sm"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;