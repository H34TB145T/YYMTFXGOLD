import React, { useState } from 'react';
import { emailService } from '../../services/emailService';
import { Mail, AlertCircle, CheckCircle, RefreshCw, X, Key, Lock, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
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

    // Check if user exists (in production, this would be a backend call)
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const userExists = users.some((u: any) => u.email === email);

    if (!userExists) {
      setError('No account found with this email address');
      setLoading(false);
      return;
    }

    const result = await emailService.sendPasswordResetEmail(email, 'User');
    
    if (result.success) {
      setSuccess('Password reset code sent to your email! Please check your inbox.');
      setStep('otp');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    const result = emailService.verifyOTP(email, otp, 'password_reset');
    
    if (result.success) {
      setSuccess('OTP verified! Please set your new password');
      setStep('reset');
    } else {
      setError(result.message);
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

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-emerald-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Update password in localStorage (in production, this would be a backend call)
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('freddyUsers', JSON.stringify(updatedUsers));

    setSuccess('Password reset successfully! You can now login with your new password');
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    const result = await emailService.sendPasswordResetEmail(email, 'User');
    
    if (result.success) {
      setSuccess('New password reset code sent to your email');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {step === 'email' && <Mail className="h-12 w-12 text-emerald-500" />}
            {step === 'otp' && <Key className="h-12 w-12 text-blue-500" />}
            {step === 'reset' && <Lock className="h-12 w-12 text-purple-500" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Verify OTP Code'}
            {step === 'reset' && 'Set New Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && 'Enter the 6-digit code sent to your email'}
            {step === 'reset' && 'Create a new secure password for your account'}
          </p>
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

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
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
              <p className="mt-2 text-sm text-gray-400 text-center">
                Code sent to: <span className="text-blue-400">{email}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !otp || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-blue-500 hover:text-blue-400 disabled:opacity-50 text-sm font-medium"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {newPassword && (
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
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 bg-slate-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                <p className="mt-1 text-xs text-emerald-400">Passwords match ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 bg-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Security Notice
          </h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Reset codes expire in 10 minutes</li>
            <li>• Each code can only be used once</li>
            <li>• Use a strong password with mixed characters</li>
            <li>• Contact support if you need assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;