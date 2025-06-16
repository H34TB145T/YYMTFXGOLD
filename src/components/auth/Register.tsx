import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, AlertCircle, CheckCircle, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    const registerResult = await register(email, password, username, '');
    
    if (registerResult.success) {
      if (registerResult.requiresVerification) {
        setSuccess('Registration successful! Please check your email for verification code.');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      setError(registerResult.message);
    }
    
    setLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-emerald-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Wallet className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join FxGold and start your cryptocurrency trading journey
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
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="johndoe"
                  disabled={loading}
                />
              </div>
              {username && username.length < 3 && (
                <p className="mt-1 text-xs text-yellow-400">Username must be at least 3 characters</p>
              )}
            </div>
            
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
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password strength:</span>
                    <span className={`text-xs ${passwordStrength >= 3 ? 'text-emerald-400' : passwordStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 6 && (
                <p className="mt-1 text-xs text-emerald-400">Passwords match ✓</p>
              )}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Password Requirements:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li className={`flex items-center ${password.length >= 6 ? 'text-emerald-400' : 'text-gray-400'}`}>
                <CheckCircle className={`h-3 w-3 mr-2 ${password.length >= 6 ? 'text-emerald-400' : 'text-gray-400'}`} />
                At least 6 characters
              </li>
              <li className={`flex items-center ${password.match(/[a-z]/) ? 'text-emerald-400' : 'text-gray-400'}`}>
                <CheckCircle className={`h-3 w-3 mr-2 ${password.match(/[a-z]/) ? 'text-emerald-400' : 'text-gray-400'}`} />
                Lowercase letter
              </li>
              <li className={`flex items-center ${password.match(/[A-Z]/) ? 'text-emerald-400' : 'text-gray-400'}`}>
                <CheckCircle className={`h-3 w-3 mr-2 ${password.match(/[A-Z]/) ? 'text-emerald-400' : 'text-gray-400'}`} />
                Uppercase letter
              </li>
              <li className={`flex items-center ${password.match(/[0-9]/) ? 'text-emerald-400' : 'text-gray-400'}`}>
                <CheckCircle className={`h-3 w-3 mr-2 ${password.match(/[0-9]/) ? 'text-emerald-400' : 'text-gray-400'}`} />
                Number
              </li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !username || !email || !password || !confirmPassword || password !== confirmPassword}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-500 hover:text-emerald-400">
                Sign in
              </Link>
            </p>
          </div>
        </form>
        
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400">Privacy Policy</a>.
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email Verification Required
          </h3>
          <p className="text-gray-300 text-sm">
            After registration, you'll receive a verification email with a 6-digit code. 
            Please check your inbox (and spam folder) to complete your account setup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;