import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-surfaceHighlight rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-glow-blue"></div>
      </div>
      <p className="mt-6 text-text-secondary font-mono text-sm uppercase tracking-widest animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;