// src/components/layout/Header/Header.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', path: '/', public: true },
    { name: 'Dashboard', path: '/dashboard', protected: true, hideFromAdmin: true },
    { name: 'Management', path: '/management', protected: true, adminOnly: true },
    { name: 'Client Personas', path: '/client-personas', protected: true, adminOnly: true },
    { name: 'Scenario Challenge', path: '/scenario-challenge', protected: true, adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isActivePath = (path) => location.pathname === path;

  const shouldShowNavItem = (item) => {
    if (item.public) return true;
    if (!user) return false;
    if (item.adminOnly && !user.isAdmin) return false;
    if (item.hideFromAdmin && user.isAdmin) return false;
    if (item.protected && !user) return false;
    return true;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md z-50 border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600"
          >
            Kirdar.ai
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => 
              shouldShowNavItem(item) && (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm transition-colors duration-300 ${
                    isActivePath(item.path)
                      ? 'text-sky-400'
                      : 'text-gray-300 hover:text-sky-400'
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Authentication Section */}
            <div className="flex items-center space-x-4">
              {/* Guest Access Link - Always visible */}
              <Link
                to="/guest"
                className="text-gray-300 hover:text-sky-400 transition-colors duration-300 flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Guest Access
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-sky-400 transition-colors duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 border border-gray-800">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sky-400"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sky-400"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-sky-400 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors duration-300"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-sky-400"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/90 rounded-lg mt-2">
              {/* Guest Access in Mobile Menu */}
              <Link
                to="/guest"
                className="flex items-center px-3 py-2 rounded-md text-base text-gray-300 hover:text-sky-400 hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Guest Access
              </Link>

              {navigation.map((item) => 
                shouldShowNavItem(item) && (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base ${
                      isActivePath(item.path)
                        ? 'text-sky-400 bg-sky-900/20'
                        : 'text-gray-300 hover:text-sky-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
              
              {user ? (
                <>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 rounded-md text-base text-gray-300 hover:text-sky-400 hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="inline-block w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base text-gray-300 hover:text-sky-400 hover:bg-gray-800 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base text-gray-300 hover:text-sky-400 hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base bg-sky-600 text-white hover:bg-sky-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;