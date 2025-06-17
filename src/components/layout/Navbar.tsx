import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, BarChart2, LogOut, User, Menu, X, RefreshCw, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-10 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 shadow-md backdrop-blur-sm' : 'bg-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Wallet className="h-8 w-8 text-emerald-500" />
              <span className="ml-2 text-xl font-bold text-white">FxGold</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/dashboard' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/trade" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/trade' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  Trade
                </Link>
                <Link 
                  to="/transactions" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/transactions' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  Transactions
                </Link>
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/profile' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/admin' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/login' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/dashboard' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Dashboard
                </div>
              </Link>
              <Link 
                to="/trade" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/trade' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Trade
                </div>
              </Link>
              <Link 
                to="/transactions" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/transactions' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Transactions
                </div>
              </Link>
              <Link 
                to="/profile" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/profile' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </div>
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/admin' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Admin Panel
                  </div>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-slate-700 hover:text-white"
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </div>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/login' ? 'text-white bg-slate-700' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;