import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  Upload, 
  Map, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/landing', { replace: true });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Explorer", "email": "user@clausewise.ai"}');

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Verification', path: '/land-verification', icon: Map },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 ${scrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`max-w-7xl mx-auto spellbook-glass rounded-full px-6 py-2 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-brand-background/80' : ''}`}>
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <Shield className="w-5 h-5 text-brand-background" />
          </div>
          <span className="font-serif text-xl tracking-tighter text-white">ClauseWise</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/5 rounded-full border border-white/10"
                    transition={{ type: 'spring', duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Area */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="hidden lg:block text-xs font-medium text-white/60">{user.name}</span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-56 spellbook-glass rounded-2xl p-2 overflow-hidden z-[100]"
                >
                  <div className="px-4 py-3 mb-2 border-b border-white/5">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    System Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Terminate Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white/40 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 spellbook-glass rounded-3xl overflow-hidden px-4 py-6"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 text-white/60 hover:text-white transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-serif text-lg">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
