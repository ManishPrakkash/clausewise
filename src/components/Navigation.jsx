import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaHistory, FaCog, FaSignOutAlt, FaUser, FaBell, FaMoon, FaSun, FaMapMarkedAlt, FaFileUpload } from 'react-icons/fa';

const Navigation = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsProfileOpen(false);
    navigate('/login', { replace: true });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "User", "email": "user@example.com"}');

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-600 to-blue-500" />
            <Link to="/dashboard" className="text-xl font-bold tracking-tight">
              ClauseWise
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50/70 dark:bg-primary-900/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FaHome />
                Dashboard
              </Link>
              
              <Link
                to="/upload"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  location.pathname === '/upload'
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50/70 dark:bg-primary-900/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FaFileUpload />
                Upload Contract
              </Link>
              
              <Link
                to="/land-verification"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  location.pathname === '/land-verification'
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50/70 dark:bg-primary-900/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FaMapMarkedAlt />
                Land Verification
              </Link>
              
              <Link
                to="/history"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  location.pathname === '/history'
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50/70 dark:bg-primary-900/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FaHistory />
                History
              </Link>
              
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  location.pathname === '/settings'
                    ? 'text-primary-700 dark:text-primary-300 bg-primary-50/70 dark:bg-primary-900/40'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FaCog />
                Settings
              </Link>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:bg-gray-700/40"
              title="View notifications"
            >
              <FaBell size={16} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:bg-gray-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="Toggle theme"
            >
              {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-600 to-blue-500 flex items-center justify-center text-white font-medium shadow-sm">
                  {user.name.charAt(0)}
                </div>
              </button>

              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    Your Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
