import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Activity, ChevronDown, Moon, Sun, Globe, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { role, setRole } = useAuth();
  const { theme, toggleTheme, language, setLanguage, languages, t } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-colors duration-300">
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/30 transition-colors cursor-pointer">
                <span className="text-xs text-text-secondary dark:text-gray-400 uppercase font-mono">{t('role')}:</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-sm font-medium text-text-primary dark:text-gray-200 focus:outline-none cursor-pointer appearance-none pr-6"
                >
                  <option value="farmer">{t('farmer')}</option>
                  <option value="merchant">{t('merchant')}</option>
                  <option value="customer">{t('customer')}</option>
                </select>
                <ChevronDown className="w-3 h-3 text-text-secondary dark:text-gray-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* User Profile & Settings */}
            <div className="relative" ref={profileRef}>
              <button 
                className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700 group"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-medium text-text-primary dark:text-gray-200 group-hover:text-primary transition-colors">
                    {t('guestUser')}
                  </div>
                  <div className="text-xs text-text-secondary dark:text-gray-400 font-mono">ID: 8X-92</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <User size={18} className="text-text-secondary dark:text-gray-400 group-hover:text-primary" />
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary dark:text-white">{t('guestUser')}</p>
                          <p className="text-xs text-text-secondary dark:text-gray-400">guest@agrovision.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {/* Theme Toggle */}
                      <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-accent" />}
                          <span className="text-sm font-medium text-text-primary dark:text-gray-200">{t('appearance')}</span>
                        </div>
                        <span className="text-xs font-mono text-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </button>

                      {/* Language Selector */}
                      <div className="p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe size={18} className="text-secondary" />
                          <span className="text-sm font-medium text-text-primary dark:text-gray-200">{t('language')}</span>
                        </div>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-text-primary dark:text-gray-200 focus:outline-none focus:border-primary/50"
                        >
                          {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.nativeName} ({lang.name})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg text-danger hover:bg-danger/5 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">{t('signOut')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <SearchBar />
              
              {/* Role Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary dark:text-gray-400 font-mono uppercase">{t('selectRole')}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-primary dark:text-gray-200 focus:border-primary/50 focus:outline-none"
                >
                  <option value="farmer">{t('farmer')}</option>
                  <option value="merchant">{t('merchant')}</option>
                  <option value="customer">{t('customer')}</option>
                </select>
              </div>

              {/* Settings in Mobile */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-sm font-medium text-text-primary dark:text-gray-200">{t('darkMode')}</span>
                  {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-accent" />}
                </button>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary dark:text-gray-400 font-mono uppercase">{t('language')}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-primary dark:text-gray-200 focus:border-primary/50 focus:outline-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
