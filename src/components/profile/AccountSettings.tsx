import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { User, Lock, AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

const AccountSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'username' | 'password' | null>(null);
  
  // Username change state
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUsernameLoading(true);
    setUsernameError('');
    setUsernameSuccess('');

    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      setUsernameLoading(false);
      return;
    }

    if (newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      setUsernameLoading(false);
      return;
    }

    if (newUsername === user.username) {
      setUsernameError('New username must be different from current username');
      setUsernameLoading(false);
      return;
    }

    try {
      const result = await authService.updateUsername(user.id, newUsername);
      
      if (result.success) {
        const updatedUser = { ...user, username: newUsername };
        updateUser(updatedUser);
        setUsernameSuccess('Username updated successfully!');
        setNewUsername('');
        setActiveSection(null);
        setTimeout(() => setUsernameSuccess(''), 3000);
      } else {
        setUsernameError(result.message);
      }
    } catch (error) {
      setUsernameError('Failed to update username. Please try again.');
    }

    setUsernameLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required');
      setPasswordLoading(false);
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      setPasswordLoading(false);
      return;
    }

    try {
      const result = await authService.changePassword(user.id, currentPassword, newPassword);
      
      if (result.success) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setActiveSection(null);
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(result.message);
      }
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    }

    setPasswordLoading(false);
  };

  const cancelEdit = () => {
    setActiveSection(null);
    setNewUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUsernameError('');
    setPasswordError('');
    setUsernameSuccess('');
    setPasswordSuccess('');
  };

  return (
    <div className="space-y-6">
      {/* Success Messages */}
      {usernameSuccess && (
        <div className="bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-emerald-200">{usernameSuccess}</p>
        </div>
      )}

      {passwordSuccess && (
        <div className="bg-emerald-900/30 border border-emerald-500 rounded-md p-3 flex items-start">
          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-emerald-200">{passwordSuccess}</p>
        </div>
      )}

      {/* Username Section */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-white">Username</h3>
              <p className="text-gray-400 text-sm">Change your username for your account</p>
            </div>
          </div>
          {activeSection !== 'username' && (
            <button
              onClick={() => setActiveSection('username')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Change Username
            </button>
          )}
        </div>

        {activeSection === 'username' ? (
          <form onSubmit={handleUsernameChange} className="space-y-4">
            {usernameError && (
              <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">{usernameError}</p>
              </div>
            )}

            <div>
              <label htmlFor="currentUsername" className="block text-sm font-medium text-gray-300 mb-2">
                Current Username
              </label>
              <input
                id="currentUsername"
                type="text"
                value={user?.username || ''}
                disabled
                className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-300 mb-2">
                New Username
              </label>
              <input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new username"
                disabled={usernameLoading}
                minLength={3}
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Username must be at least 3 characters long
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md px-4 py-2 font-medium transition-colors"
                disabled={usernameLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={usernameLoading || !newUsername.trim() || newUsername.length < 3}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {usernameLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Username'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-700 rounded p-3">
            <p className="text-white font-medium">Current Username: {user?.username}</p>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-purple-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-white">Password</h3>
              <p className="text-gray-400 text-sm">Change your account password</p>
            </div>
          </div>
          {activeSection !== 'password' && (
            <button
              onClick={() => setActiveSection('password')}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {activeSection === 'password' ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-900/30 border border-red-500 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">{passwordError}</p>
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter current password"
                  disabled={passwordLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter new password"
                  disabled={passwordLoading}
                  minLength={6}
                  required
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full bg-slate-700 border-gray-600 rounded-md py-2 px-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                  required
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

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md px-4 py-2 font-medium transition-colors"
                disabled={passwordLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {passwordLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-700 rounded p-3">
            <p className="text-white font-medium">Password: ••••••••••••</p>
            <p className="text-gray-400 text-sm mt-1">Last changed: Never</p>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Email Address:</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Full Name:</span>
            <span className="text-white">{user?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Type:</span>
            <span className="text-white capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Status:</span>
            <span className={user?.is_verified ? 'text-emerald-400' : 'text-yellow-400'}>
              {user?.is_verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Security Recommendations</p>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Use a strong, unique password for your account</li>
              <li>• Enable two-factor authentication for additional security</li>
              <li>• Never share your login credentials with anyone</li>
              <li>• Regularly review your account activity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;