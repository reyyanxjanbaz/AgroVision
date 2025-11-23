import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import SearchBar from './SearchBar';

const Navbar = () => {
  const { role, setRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-0 z-50 mb-8 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:scale-105 transition-transform">
            <span className="text-3xl">🌾</span>
            <span className="bg-gradient-to-r from-primary to-emerald-700 bg-clip-text text-transparent">
              AgroVision
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary bg-white/70 backdrop-blur-sm font-medium transition-all"
            >
              <option value="farmer">👨‍🌾 Farmer</option>
              <option value="merchant">🏪 Merchant</option>
              <option value="customer">🛒 Customer</option>
            </select>

            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <User size={24} className="text-gray-700" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 animate-slide-up">
            <div className="relative">
              <SearchBar />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="farmer">👨‍🌾 Farmer</option>
              <option value="merchant">🏪 Merchant</option>
              <option value="customer">🛒 Customer</option>
            </select>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;