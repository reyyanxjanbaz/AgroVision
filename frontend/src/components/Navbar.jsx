import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, User, Activity, ChevronDown, Moon, Sun, Globe, LogOut, Home, Search, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { role, setRole } = useAuth();
  const { theme, toggleTheme, language, setLanguage, languages, t } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
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
    <>
      {/* DESKTOP: Floating Island Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block fixed top-6 left-0 right-0 z-50 px-6"
      >
        <div className="max-w-7xl mx-auto glass-panel px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors border border-primary/20 overflow-hidden">
              <Activity className="text-primary w-5 h-5 relative z-10" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold tracking-tight text-text-primary dark:text-white leading-none">
                AGRO<span className="text-primary">VISION</span>
              </span>
              <span className="text-[9px] font-mono text-text-secondary dark:text-gray-400 tracking-[0.2em] uppercase mt-0.5">
                Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="flex-1 max-w-md mx-12">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <button 
              onClick={() => setLanguageModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary/30 hover:bg-white dark:hover:bg-gray-800 transition-all group"
            >
              <Globe size={16} className="text-text-secondary dark:text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold text-text-primary dark:text-white uppercase">{language}</span>
            </button>

            {/* Role Selector */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-primary/30 transition-all cursor-pointer">
                <span className="text-[10px] text-text-secondary dark:text-gray-400 uppercase font-mono tracking-wider">{t('role')}</span>
                <select
                  aria-label={t('role')}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-sm font-bold text-text-primary dark:text-white focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="farmer">{t('farmer')}</option>
                  <option value="merchant">{t('merchant')}</option>
                  <option value="customer">{t('customer')}</option>
                </select>
                <ChevronDown className="w-3 h-3 text-text-secondary dark:text-gray-400" />
              </div>
            </div>

            {/* User Profile & Settings */}
            <div className="relative" ref={profileRef}>
              <button 
                aria-label={t('profile') || "User Profile"}
                className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-700 group"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-glow-green transition-all duration-300">
                  <User size={18} className="text-text-secondary dark:text-gray-400 group-hover:text-primary transition-colors" />
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
                    className="absolute right-0 mt-4 w-80 glass-panel overflow-hidden z-50 p-2"
                  >
                    <div className="p-4 mb-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary dark:text-white font-display">{t('guestUser')}</p>
                          <p className="text-xs text-text-secondary dark:text-gray-400 font-mono">guest@agrovision.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Theme Toggle */}
                      <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                            {theme === 'dark' ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-accent" />}
                          </div>
                          <span className="text-sm font-medium text-text-primary dark:text-white">{t('appearance')}</span>
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                          {theme === 'dark' ? 'DARK' : 'LIGHT'}
                        </span>
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl text-danger hover:bg-danger/5 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">{t('signOut')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Language Modal */}
      <AnimatePresence>
        {languageModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLanguageModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-text-primary dark:text-white">Select Language</h3>
                <button 
                  onClick={() => setLanguageModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={20} className="text-text-secondary" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLanguageModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all group relative overflow-hidden ${
                      language === lang.code
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className={`text-xs font-mono uppercase tracking-wider block mb-1 ${
                      language === lang.code ? 'text-white/70' : 'text-text-secondary dark:text-gray-400'
                    }`}>
                      {lang.code}
                    </span>
                    <span className={`font-bold block ${
                      language === lang.code ? 'text-white' : 'text-text-primary dark:text-white'
                    }`}>
                      {lang.nativeName}
                    </span>
                    {language === lang.code && (
                      <div className="absolute top-0 right-0 p-3">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE: Top Bar (Logo Only) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="text-primary w-6 h-6" />
          <span className="text-lg font-display font-bold text-text-primary dark:text-white">AGRO<span className="text-primary">VISION</span></span>
        </Link>
        <button 
          aria-label={t('openMenu') || "Open Menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-white"
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* MOBILE: Bottom Navigation Bar (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
        <div className="flex items-center justify-around p-2">
          <Link to="/" className="flex flex-col items-center gap-1 p-2 text-primary">
            <Home size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-text-secondary dark:text-gray-400">
            <Search size={24} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-text-secondary dark:text-gray-400">
            <User size={24} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* MOBILE: Full Screen Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-[60] bg-background dark:bg-gray-900 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-display font-bold text-text-primary dark:text-white">Menu</h2>
              <button 
                aria-label={t('closeMenu') || "Close Menu"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <SearchBar />
              
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-text-secondary dark:text-gray-400">{t('role')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['farmer', 'merchant', 'customer'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        role === r
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400'
                      }`}
                    >
                      {t(r)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-text-secondary dark:text-gray-400">{t('appearance')}</h3>
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-sm font-medium text-text-primary dark:text-white">{t('darkMode')}</span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase text-text-secondary dark:text-gray-400">{t('language')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        language === lang.code
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400'
                      }`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

