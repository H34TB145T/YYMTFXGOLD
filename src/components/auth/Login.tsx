import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';
import ForgotPasswordModal from './ForgotPasswordModal';
import { Wallet, AlertCircle, CheckCircle, Eye, EyeOff, Mail, Lock, Key, RefreshCw } from 'lucide-react';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    console.log('🔐 Logging in with remember me:', rememberMe);
    const result = await login(email, password, rememberMe);
    
    if (result.success) {
      if (result.requires2FA && result.userId) {
        setTwoFAUserId(result.userId);
        setShow2FA(true);
      } else {
        navigate('/dashboard');
      }
    } else {
      if (result.requiresVerification) {
        setError('Please verify your email first. Check your inbox for the verification code.');
        // Optionally redirect to verification page
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else {
        setError(result.message);
      }
    }
    
    setLoading(false);
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    navigate('/dashboard');
  };

  const handle2FACancel = () => {
    setShow2FA(false);
    setTwoFAUserId('');
  };

  const handleForgotPasswordSuccess = () => {
    setShowForgotPassword(false);
    setError('');
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <Wallet className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Sign in to FxGold
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Access your cryptocurrency trading account
            </p>
          </div>

          {verified && (
            <div className="bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
              <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-emerald-200">Email verified successfully! You can now login.</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-slate-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-emerald-500 hover:text-emerald-400 flex items-center"
                >
                  <Key className="h-4 w-4 mr-1" />
                  Forgot your password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
            
            <div className="text-sm text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-emerald-500 hover:text-emerald-400">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {show2FA && (
        <TwoFactorAuth
          email={email}
          userId={twoFAUserId}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      )}
    </>
  );
};

export default Login;