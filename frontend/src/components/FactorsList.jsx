import React from 'react';
import FactorCard from './FactorCard';

const FactorsList = ({ factors }) => {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Factors Affecting Price</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {factors.map((factor, index) => (
          <FactorCard key={index} factor={factor} />
        ))}
      </div>
    </div>
  );
};

export default FactorsList;