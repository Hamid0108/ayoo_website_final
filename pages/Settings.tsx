
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { User as UserIcon, Lock, Store, AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { BackendlessService } from '../services/backendless';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface SettingsProps {
  user?: User | null;
  setUser?: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      // If firstName/lastName empty but name exists, try to split name
      if (!user.firstName && !user.lastName && user.name) {
          const parts = user.name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const updates: Partial<User> = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email // Backendless might restrict email updates depending on config
      };

      await BackendlessService.auth.updateUser(updates);
      
      if (setUser && user) {
        setUser({ ...user, ...updates });
      }
      
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);

    try {
      await BackendlessService.auth.updateUser({ password: newPassword });
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone and all your store data will be lost.");
    if (confirmed) {
       alert("Please contact support at support@ayoo.com to process your account deletion request.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and store preferences</p>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="bg-ayoo-50 p-2 rounded-lg text-ayoo-600">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <p className="text-sm text-gray-500">Update your personal details</p>
          </div>
        </div>
        <div className="p-6">
           <form onSubmit={handleProfileUpdate} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                 <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditingProfile}
                    className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 disabled:bg-gray-50 disabled:text-gray-500"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                 <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditingProfile}
                    className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 disabled:bg-gray-50 disabled:text-gray-500"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                 <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingProfile}
                    className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500 disabled:bg-gray-50 disabled:text-gray-500"
                 />
               </div>
             </div>

             <div className="flex items-center justify-between pt-2">
                <div>
                   {profileSuccess && <span className="text-green-600 text-sm flex items-center font-medium"><Check className="w-4 h-4 mr-1"/> Profile updated</span>}
                   {profileError && <span className="text-red-600 text-sm">{profileError}</span>}
                </div>
                
                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button type="submit" isLoading={profileLoading}>Save Changes</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(true)}>
                    Edit Profile Details
                  </Button>
                )}
             </div>
           </form>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Security</h3>
            <p className="text-sm text-gray-500">Manage your password</p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
               <input 
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500"
                 placeholder="••••••••"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
               <input 
                 type="password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className="w-full rounded-lg border-gray-300 border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ayoo-500"
                 placeholder="••••••••"
               />
             </div>
             
             <div className="flex items-center justify-between">
                <div>
                  {passwordSuccess && <span className="text-green-600 text-sm flex items-center font-medium"><Check className="w-4 h-4 mr-1"/> Password changed successfully</span>}
                  {passwordError && <span className="text-red-600 text-sm">{passwordError}</span>}
                </div>
                <Button type="submit" variant="secondary" isLoading={passwordLoading} disabled={!newPassword}>
                  Update Password
                </Button>
             </div>
          </form>
        </div>
      </div>

      {/* Store Settings Shortcut */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Store Settings</h3>
            <p className="text-sm text-gray-500">Manage your store profile and display</p>
          </div>
        </div>
        <div className="p-6">
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/store-info')}>
              <div className="flex items-center gap-3">
                 <Store className="w-5 h-5 text-gray-400" />
                 <div>
                    <p className="font-medium text-gray-900">Edit Store Profile</p>
                    <p className="text-xs text-gray-500">Update logo, address, and contact info</p>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
           </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-200 bg-red-50 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Danger Zone</h3>
            <p className="text-sm text-red-700">Irreversible account actions</p>
          </div>
        </div>
        <div className="p-6">
           <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all associated store data.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
