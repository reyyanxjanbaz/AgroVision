import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Activity, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { role, setRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20">
              <Activity className="text-primary w-6 h-6" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold tracking-tight text-text-primary">
                AGRO<span className="text-primary">VISION</span>
              </span>
              <span className="text-[10px] font-mono text-primary/80 tracking-widest uppercase">
                Intelligence System
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-12">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {/* Role Selector */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/10 bg-surface hover:border-primary/30 transition-colors cursor-pointer">
                <span className="text-xs text-text-secondary uppercase font-mono">Role:</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer appearance-none pr-6"
                >
                  <option value="farmer">Farmer</option>
                  <option value="merchant">Merchant</option>
                  <option value="customer">Customer</option>
                </select>
                <ChevronDown className="w-3 h-3 text-text-secondary absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* User Profile */}
            <button className="flex items-center gap-3 pl-6 border-l border-primary/10 group">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                  Guest User
                </div>
                <div className="text-xs text-text-secondary font-mono">ID: 8X-92</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-surface border border-primary/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <User size={18} className="text-text-secondary group-hover:text-primary" />
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-primary/10 bg-surface/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <SearchBar />
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary font-mono uppercase">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-primary/10 text-text-primary focus:border-primary/50 focus:outline-none"
                >
                  <option value="farmer">Farmer</option>
                  <option value="merchant">Merchant</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
