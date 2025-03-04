// src/components/features/Auth/Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Key, Loader, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ApiService from '../../../services/apiService';

const Register = () => {
  const navigate = useNavigate();
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });

  // Listen for API connection changes
  useEffect(() => {
    const handleConnectionChange = (event) => {
      if (event.detail.connected && isConnectionError) {
        setError('');
        setIsConnectionError(false);
      }
    };

    window.addEventListener('api-connection-change', handleConnectionChange);
    
    return () => {
      window.removeEventListener('api-connection-change', handleConnectionChange);
    };
  }, [isConnectionError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsConnectionError(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode
      };
      
      await ApiService.register(userData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Display user-friendly error messages
      if (err.isConnectionError) {
        setError('Unable to connect to the server. Please check your internet connection or try again later.');
        setIsConnectionError(true);
      } else if (err.status === 400) {
        if (err.data && err.data.message) {
          setError(err.data.message);
        } else {
          setError('Invalid registration information. Please check your details and try again.');
        }
      } else if (err.status === 409) {
        setError('An account with this email already exists. Please use a different email or try logging in.');
      } else {
        setError(err.message || 'Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      const isConnected = await ApiService.checkApiConnectivity();
      if (isConnected) {
        setError('');
        setIsConnectionError(false);
      } else {
        setError('Still unable to connect to the server. Please try again later.');
      }
    } catch (err) {
      setError('Failed to check connection. Please try again later.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-8">
          Create Account
        </h2>

        {error && (
          <div className={`rounded-lg p-4 mb-6 flex items-start ${
            isConnectionError 
              ? 'bg-red-500/10 border border-red-500/50 text-red-500' 
              : 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-500'
          }`}>
            {isConnectionError ? (
              <>
                <WifiOff className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    onClick={handleRetryConnection}
                    disabled={isRetrying}
                    className="mt-2 flex items-center text-xs bg-red-500/20 hover:bg-red-500/30 rounded px-2 py-1 transition-colors"
                  >
                    {isRetrying ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Checking connection...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry Connection
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
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
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Email Input */}
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
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Admin Code Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="adminToggle"
              checked={showAdminCode}
              onChange={() => setShowAdminCode(!showAdminCode)}
              className="mr-2"
            />
            <label htmlFor="adminToggle" className="text-gray-300">
              Register as Admin
            </label>
          </div>

          {/* Admin Code Input */}
          {showAdminCode && (
            <div>
              <label className="block text-gray-300 mb-2" htmlFor="adminCode">
                Admin Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="adminCode"
                  type="password"
                  value={formData.adminCode}
                  onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isRetrying}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;