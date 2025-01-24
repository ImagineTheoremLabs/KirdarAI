import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  User, 
  Settings, 
  Shield, 
  Key, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Save,
  Loader,
  Bell, 
  Globe, 
  Moon,
  Monitor,
  Smartphone,
  Clock,
  LogOut
} from 'lucide-react';

const PreferenceToggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
    <div>
      <h3 className="text-white font-medium">{label}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
    </label>
  </div>
);

const UserProfile = ({ user, onSave, loading, error, success }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-sky-400 mb-6 flex items-center gap-2">
        <User className="w-5 h-5" />
        Profile Settings
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-green-500">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-medium text-sky-400 mb-4">Change Password</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const SecuritySettings = ({ user }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    security: true,
    updates: false
  });

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-sky-400 mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Security Settings
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Add an extra layer of security to your account</p>
              <p className="text-sm text-gray-500">
                {twoFactorEnabled 
                  ? 'Two-factor authentication is currently enabled' 
                  : 'Enable two-factor authentication to secure your account'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFactorEnabled}
                onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Email notifications</span>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => setNotifications({...notifications, email: !notifications.email})}
                className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-600 focus:ring-offset-gray-800"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Security alerts</span>
              <input
                type="checkbox"
                checked={notifications.security}
                onChange={() => setNotifications({...notifications, security: !notifications.security})}
                className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-600 focus:ring-offset-gray-800"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Product updates</span>
              <input
                type="checkbox"
                checked={notifications.updates}
                onChange={() => setNotifications({...notifications, updates: !notifications.updates})}
                className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-600 focus:ring-offset-gray-800"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserSettings = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveProfile = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      localStorage.setItem('user', JSON.stringify(data));
      login(data, data.token);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-8">
          Account Settings
        </h1>

        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Security
          </button>
        </div>

        {activeTab === 'profile' ? (
          <UserProfile 
            user={user}
            onSave={handleSaveProfile}
            loading={loading}
            error={error}
            success={success}
          />
        ) : (
          <SecuritySettings user={user} />
        )}
      </div>
    </div>
  );
};

export default UserSettings;