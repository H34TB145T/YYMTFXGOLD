import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Wallet, TrendingUp, Shield, Coins } from 'lucide-react';

const featuresData = [
  {
    icon: <Wallet className="h-6 w-6 text-emerald-500" />,
    title: 'Secure Trading',
    description: 'Trade cryptocurrencies securely with our advanced trading platform.'
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-emerald-500" />,
    title: 'Real-Time Trading',
    description: 'Experience cryptocurrency trading with real-time price data and market information.'
  },
  {
    icon: <Shield className="h-6 w-6 text-emerald-500" />,
    title: 'Advanced Security',
    description: 'Your assets are protected with industry-leading security measures and encryption.'
  },
  {
    icon: <Coins className="h-6 w-6 text-emerald-500" />,
    title: 'Top Cryptocurrencies',
    description: 'Trade the top 15 cryptocurrencies by market cap, including Bitcoin, Ethereum, and more.'
  }
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-slate-900">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center md:text-left md:max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                <span className="block">Trade Cryptocurrency</span>
                <span className="block text-emerald-500">With Confidence</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl">
                Welcome to FxGold – your trusted platform for cryptocurrency trading. 
                Experience professional-grade tools and real-time market data to execute your trading strategies.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row sm:justify-center md:justify-start gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
                    >
                      Start Trading
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-3 bg-transparent border border-white hover:bg-white hover:text-slate-900 text-white font-medium rounded-md transition-colors inline-flex items-center justify-center"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Why FxGold Trading Platform?
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Professional cryptocurrency trading platform with advanced features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuresData.map((feature, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors group">
                <div className="bg-slate-800 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Get started with FxGold in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Sign Up</h3>
              <p className="text-gray-300">
                Create your account and complete verification to start trading cryptocurrencies.
              </p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Deposit Funds</h3>
              <p className="text-gray-300">
                Fund your account with USDT through various payment methods to begin trading.
              </p>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">Start Trading</h3>
              <p className="text-gray-300">
                Buy and sell cryptocurrencies or trade futures with advanced trading tools.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-block px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Your Crypto Trading Journey?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Join thousands of traders who trust FxGold for their cryptocurrency trading needs.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="inline-block px-8 py-3 bg-white text-emerald-600 hover:bg-gray-100 font-medium rounded-md transition-colors"
          >
            {isAuthenticated ? "Go to Dashboard" : "Sign Up Now"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;