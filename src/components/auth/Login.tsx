import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
      // Check if user has 2FA enabled (in production, this would come from the backend)
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      const user = users.find((u: any) => u.email === email);
      
      if (user?.twoFactorEnabled) {
        setShow2FA(true);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handle2FASuccess = () => {
    setShow2FA(false);
    navigate('/dashboard');
  };

  const handle2FACancel = () => {
    setShow2FA(false);
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
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-emerald-500 hover:text-emerald-400">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
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
          
          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500">
              For demo purposes, any password will work with a registered email.
            </p>
          </div>
        </div>
      </div>

      {show2FA && (
        <TwoFactorAuth
          email={email}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      )}
    </>
  );
};

export default Login;