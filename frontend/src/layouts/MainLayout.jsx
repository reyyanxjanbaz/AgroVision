import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { AuthProvider } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
        <Chatbot />
        <footer className="py-8 text-center text-gray-600 border-t mt-16">
          <p>&copy; 2024 AgroVision. Empowering farmers with AI.</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default MainLayout;