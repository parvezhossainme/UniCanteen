// Customer profile settings page with phone, name, and account management
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CustomerSettings {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  uiuId: string;
  studentId: string;
  
  // Account Stats
  totalOrders?: number;
  unreadNotifications?: number;
  accountCreated?: string;
  
  // Notification Preferences
  orderNotifications: boolean;
  promotionNotifications: boolean;
  messageNotifications: boolean;
  emailNotifications: boolean;
  
  // Privacy Settings
  showPhoneToDelivery: boolean;
  allowRatings: boolean;
  
  // App Preferences
  theme: string;
  language: string;
  soundEnabled: boolean;
}

const CustomerSettingsPage = () => {
  const { user: clerkUser } = useUser();
  const [settings, setSettings] = useState<CustomerSettings>({
    name: '',
    email: '',
    phone: '',
    uiuId: '',
    studentId: '',
    orderNotifications: true,
    promotionNotifications: false,
    messageNotifications: true,
    emailNotifications: true,
    showPhoneToDelivery: true,
    allowRatings: true,
    theme: 'light',
    language: 'en',
    soundEnabled: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showPasswords: false
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customer-home/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data,
          name: data.name || clerkUser?.fullName || '',
          email: data.email || clerkUser?.emailAddresses[0]?.emailAddress || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [clerkUser?.fullName, clerkUser?.emailAddresses]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/customer-home/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showNotification('success', 'Settings saved successfully');
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/customer-home/settings/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showNotification('success', 'Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showPasswords: false
        });
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('error', 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen backdrop-blur-sm">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-l-[6px] border-orange-500 max-w-md">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">Loading Settings</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Fetching your preferences...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 backdrop-blur-sm">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-2 backdrop-blur-md ${
          notification.type === 'success' 
            ? 'bg-green-100/90 text-green-800 border-l-4 border-green-500' 
            : 'bg-red-100/90 text-red-800 border-l-4 border-red-500'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500 p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-lg">Manage your account preferences</p>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      {settings.totalOrders !== undefined && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Account Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl border-l-4 border-orange-500 shadow-lg hover:scale-105 transition-transform duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Total Orders</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{settings.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl border-l-4 border-yellow-500 shadow-lg hover:scale-105 transition-transform duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-md">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Unread Notifications</p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{settings.unreadNotifications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-xl border-l-4 border-green-500 shadow-lg hover:scale-105 transition-transform duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Member Since</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {settings.accountCreated ? new Date(settings.accountCreated).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <User className="w-6 h-6 mr-3 text-orange-500" />
            Personal Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UIU ID *
              </label>
              <input
                type="text"
                value={settings.uiuId}
                onChange={(e) => setSettings(prev => ({ ...prev, uiuId: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="e.g., 011211023"
                maxLength={15}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={settings.studentId}
                onChange={(e) => setSettings(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="Alternative student ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="01XXXXXXXXX"
                pattern="^(\+88)?01[3-9]\d{8}$"
              />
              <p className="text-xs text-gray-500 mt-1">Bangladesh mobile number format</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-6 h-6 mr-3 text-orange-500" />
            Notification Preferences
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'orderNotifications', label: 'Order Updates', desc: 'Get notified about order status changes' },
            { key: 'messageNotifications', label: 'Messages', desc: 'Notifications for new messages from delivery persons' },
            { key: 'promotionNotifications', label: 'Promotions & Offers', desc: 'Special deals and discounts' },
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">{label}</label>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key as keyof CustomerSettings] as boolean}
                  onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-orange-500" />
            Privacy Settings
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'showPhoneToDelivery', label: 'Show Phone to Delivery Person', desc: 'Allow delivery persons to see your phone number' },
            { key: 'allowRatings', label: 'Allow Ratings', desc: 'Let delivery persons rate you as a customer' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">{label}</label>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key as keyof CustomerSettings] as boolean}
                  onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">App Preferences</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="soundEnabled" className="ml-2 text-sm text-gray-700">
                Enable sound notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-orange-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-orange-500" />
            Change Password
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={passwordData.showPasswords ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type={passwordData.showPasswords ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={passwordData.showPasswords ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/50 backdrop-blur-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setPasswordData(prev => ({ ...prev, showPasswords: !prev.showPasswords }))}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              {passwordData.showPasswords ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {passwordData.showPasswords ? 'Hide' : 'Show'} passwords
            </button>
            
            <button
              onClick={handlePasswordChange}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || saving}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-extrabold flex items-center space-x-2 shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Update Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-xl border-l-[6px] border-green-500 p-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-700 dark:text-gray-300 font-semibold">
            Changes will be saved to your profile and applied immediately.
          </p>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-extrabold flex items-center space-x-2 shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            <span>Save All Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettingsPage;