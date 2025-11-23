import React from 'react';
import FactorCard from './FactorCard';
import { Layers } from 'lucide-react';

const FactorsList = ({ factors }) => {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <Layers className="text-primary" size={20} />
        Market Drivers
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {factors.map((factor, index) => (
          <FactorCard key={index} factor={factor} />
        ))}
      </div>
    </div>
  );
};

export default FactorsList;