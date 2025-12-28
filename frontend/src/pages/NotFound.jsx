import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-danger/80 blur-3xl rounded-full"></div>
        <div className="relative w-24 h-24 rounded-2xl bg-surface border border-danger flex items-center justify-center shadow-lg shadow-danger/50">
          <AlertTriangle size={48} className="text-danger" />
        </div>
      </div>
      
      <h1 className="text-6xl font-bold text-text-primary font-display mb-2">404</h1>
      <h2 className="text-xl font-mono text-text-secondary uppercase tracking-widest mb-6">Signal Lost</h2>
      
      <p className="text-text-muted max-w-md mb-8">
        The data stream you are looking for has been moved, deleted, or never existed in this sector.
      </p>
      
      <Link to="/" className="btn-primary">
        <Home size={18} />
        Return to Base
      </Link>
    </div>
  );
};

export default NotFound;
