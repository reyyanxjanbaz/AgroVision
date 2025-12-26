import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import Squares from '../components/Squares';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

const MainLayoutContent = ({ children }) => {
  const { theme } = useSettings();
  
  // Define colors based on theme
  const squaresProps = theme === 'dark' 
    ? {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        hoverFillColor: '#222',
        backgroundColor: '#111827' // gray-900
      }
    : {
        borderColor: 'rgba(0, 0, 0, 0.1)',
        hoverFillColor: '#eee',
        backgroundColor: '#FAFAFA' // zinc-50
      };

  return (
    <div className="min-h-screen relative text-text-primary dark:text-gray-100 transition-colors duration-300 bg-background dark:bg-gray-900">
      <div className="fixed inset-0 -z-10">
        <Squares 
          speed={0.5} 
          squareSize={40}
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
