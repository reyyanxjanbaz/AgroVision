import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';

const MainLayout = ({ children }) => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <div className="min-h-screen relative bg-background text-text-primary dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
          <div className="fixed inset-0 bg-[url('https://grain-texture.vercel.app/grain.svg')] opacity-5 pointer-events-none z-0"></div>
          <div className="fixed inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
          
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
            {children}
          </main>
          <Chatbot />
          <footer className="py-8 text-center text-text-secondary border-t border-gray-200 dark:border-gray-800 mt-16 relative z-10">
            <p className="font-mono text-xs uppercase tracking-widest">&copy; 2024 AgroVision. Intelligence System.</p>
          </footer>
        </div>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default MainLayout;
