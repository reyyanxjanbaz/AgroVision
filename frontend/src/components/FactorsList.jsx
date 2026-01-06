import React from 'react';
import FactorCard from './FactorCard';

const FactorsList = ({ factors, cropName }) => {
  if (!factors || factors.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {factors.map((factor, index) => (
        <FactorCard key={index} factor={factor} cropName={cropName} />
      ))}
    </div>
  );
};

export default FactorsList;