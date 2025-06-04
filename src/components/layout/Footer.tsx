import React from 'react';
import { Wallet, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 text-emerald-500" />
              <span className="ml-2 text-lg font-bold">FxGold</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Cryptocurrency Trading Platform
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-x-12">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-gray-300 font-medium mb-2">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Crypto Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Trading Tips
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-300 font-medium mb-2">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0">
            <h3 className="text-gray-300 font-medium mb-2">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} FxGold Trading. All rights reserved.
            <br />
            <span className="text-xs">This is a demo application. No real money is involved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;