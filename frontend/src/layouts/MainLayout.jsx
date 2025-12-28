import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import Squares from '../components/Squares';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

const MainLayoutContent = ({ children }) => {
  const { theme } = useSettings();
  
  // Define colors based on theme - subtle background
  const squaresProps = theme === 'dark' 
    ? {
        borderColor: 'rgba(34, 197, 94, 0.15)', // Subtle green
        hoverFillColor: 'rgba(34, 197, 94, 0.25)',
        backgroundColor: '#060010' 
      }
    : {
        borderColor: 'rgba(34, 197, 94, 0.12)',
        hoverFillColor: 'rgba(34, 197, 94, 0.2)',
        backgroundColor: '#FAFAFA' 
      };

  return (
    <div className="min-h-screen relative text-text-primary dark:text-gray-100 transition-colors duration-300">
      <div className="fixed inset-0 -z-10">
        <Squares 
          speed={0.1} 
          squareSize={50}
          direction='diagonal' 
          {...squaresProps}
        />
      </div>
      
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8 md:pt-32 max-w-7xl relative z-10">
        {children}
      </main>
      <Chatbot />
      <footer className="py-8 text-center text-text-secondary border-t border-gray-200 dark:border-gray-800 mt-16 relative z-10">
        <p className="font-mono text-xs uppercase tracking-widest">&copy; 2024 AgroVision. Intelligence System.</p>
      </footer>
    </div>
  );
};

const MainLayout = ({ children }) => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MainLayoutContent>
          {children}
        </MainLayoutContent>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default MainLayout;
