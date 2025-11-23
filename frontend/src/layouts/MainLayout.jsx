import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { AuthProvider } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen relative bg-background text-text-primary">
        <div className="fixed inset-0 bg-[url('https://grain-texture.vercel.app/grain.svg')] opacity-[0.03] pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
        
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
          {children}
        </main>
        <Chatbot />
        <footer className="py-8 text-center text-text-secondary border-t border-primary/10 mt-16 relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest">&copy; 2024 AgroVision. Intelligence System.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default MainLayout;
