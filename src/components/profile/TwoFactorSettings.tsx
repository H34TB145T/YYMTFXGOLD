import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { emailService } from '../../services/emailService';
import { Shield, AlertCircle, CheckCircle, RefreshCw, Mail, Key, Lock } from 'lucide-react';

const TwoFactorSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEnabled, setIsEnabled] = useState(user?.twoFactorEnabled || false);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  const handleToggle2FA = async (enable: boolean) => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setPendingAction(enable ? 'enable' : 'disable');

    if (enable) {
      // Send verification code to enable 2FA
      const result = await emailService.send2FAEmail(user.email, user.username || user.full_name);
      
      if (result.success) {
        setSuccess('Verification code sent to your email. Please enter it below to enable 2FA.');
        setShowVerification(true);
      } else {
        setError(result.message);
      }
    } else {
      // Send verification code to disable 2FA
      const result = await emailService.send2FAEmail(user.email, user.username || user.full_name);
      
      if (result.success) {
        setSuccess('Verification code sent to your email. Please enter it below to disable 2FA.');
        setShowVerification(true);
      } else {
        setError(result.message);
      }
    }

    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!user || !pendingAction) return;

    setLoading(true);
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    const result = emailService.verifyOTP(user.email, otp, '2fa');
    
    if (result.success) {
      // Update user's 2FA status
      const updatedUser = { ...user, twoFactorEnabled: pendingAction === 'enable' };
      updateUser(updatedUser);
      setIsEnabled(pendingAction === 'enable');
      
      setSuccess(
        pendingAction === 'enable' 
          ? 'Two-Factor Authentication enabled successfully!' 
          : 'Two-Factor Authentication disabled successfully!'
      );
      
      setShowVerification(false);
      setOtp('');
      setPendingAction(null);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setShowVerification(false);
    setOtp('');
    setPendingAction(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-blue-500 mr-3" />
        <div>
          <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
          <p className="text-gray-400 text-sm">
            Add an extra layer of security to your account
          </p>
        </div>
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

      {!showVerification ? (
        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${isEnabled ? 'bg-emerald-500/10' : 'bg-gray-500/10'}`}>
                {isEnabled ? (
                  <Lock className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Key className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  2FA is currently {isEnabled ? 'enabled' : 'disabled'}
                </p>
                <p className="text-gray-400 text-sm">
                  {isEnabled 
                    ? 'Your account is protected with email-based 2FA'
                    : 'Enable 2FA to secure your account with email verification'
                  }
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-gray-500/10 text-gray-400'
            }`}>
              {isEnabled ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              How Email 2FA Works
            </h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                When you log in, we'll send a 6-digit code to your email
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                Enter the code to complete your login
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                Codes expire after 5 minutes for security
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!isEnabled ? (
              <button
                onClick={() => handleToggle2FA(true)}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Enable 2FA
              </button>
            ) : (
              <button
                onClick={() => handleToggle2FA(false)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Disable 2FA
              </button>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Security Recommendation</p>
                <p className="text-blue-300 text-sm">
                  We strongly recommend enabling 2FA to protect your account from unauthorized access. 
                  This adds an extra layer of security beyond just your password.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Verification Form */
        <div className="space-y-6">
          <div className="text-center">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">
              Verify Your Email
            </h4>
            <p className="text-gray-400 text-sm">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-400 font-medium">{user?.email}</p>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
              Enter verification code
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

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md px-4 py-3 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={loading || !otp || otp.length !== 6}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verify & {pendingAction === 'enable' ? 'Enable' : 'Disable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;