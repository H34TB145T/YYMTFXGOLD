import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, AlertCircle, CheckCircle, RefreshCw, Clock, Shield, Send } from 'lucide-react';

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
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        if (prev === 540) { // Allow resend after 1 minute
          setCanResend(true);
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

    try {
      console.log('🔍 Verifying OTP with backend API...');
      const result = await authService.verifyEmail(email, otp);
      
      if (result.success) {
        // Update user verification status in localStorage
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const updatedUsers = users.map((u: any) => 
          u.email === email ? { ...u, is_verified: true } : u
        );
        localStorage.setItem('fxgoldUsers', JSON.stringify(updatedUsers));

        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setError('Verification failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('📧 Resending verification email via backend API...');
      const result = await authService.resendVerification(email);
      
      if (result.success) {
        setSuccess('New verification code sent to your email! Please check your inbox.');
        setTimeLeft(600); // Reset timer
        setCanResend(false);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      setError('Failed to resend verification code. Please try again.');
    }
    
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-16 w-16 text-emerald-500" />
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-emerald-400 font-medium break-all">{email}</p>
          <p className="mt-2 text-xs text-gray-500">
            Check your inbox and spam folder
          </p>
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
              disabled={loading}
            />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <p className="text-gray-400 text-sm">
                {timeLeft > 0 ? (
                  <>Time remaining: <span className="text-emerald-400 font-mono">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-400">Code expired</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !otp || otp.length !== 6}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || !canResend}
              className="text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center mx-auto"
            >
              {resending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Sending...
                </>
              ) : canResend ? (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Resend verification code
                </>
              ) : (
                `Resend available in ${formatTime(Math.max(0, 540 - (600 - timeLeft)))}`
              )}
            </button>
          </div>
        </form>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Tips
          </h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Check your spam/junk folder if you don't see the email</li>
            <li>• The verification code expires in 10 minutes</li>
            <li>• Each code can only be used once for security</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
          <h3 className="text-emerald-400 font-medium mb-2">What happens after verification?</h3>
          <ul className="text-emerald-300 text-sm space-y-1">
            <li>✓ Full access to your trading account</li>
            <li>✓ Ability to deposit and withdraw funds</li>
            <li>✓ Access to all cryptocurrency trading features</li>
            <li>✓ Enhanced account security and protection</li>
          </ul>
        </div>

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