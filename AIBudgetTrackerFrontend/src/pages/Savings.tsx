import React from 'react';
import SavingsGoals from '../components/SavingsGoals';

const Savings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Savings Goals</h1>
      <div>
        <SavingsGoals />
      </div>
    </div>
  );
};

export default Savings;
