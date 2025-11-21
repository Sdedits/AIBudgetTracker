import React from 'react';
import BudgetManager from '../components/BudgetManager';
const BudgetDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Monthly Budget Manager</h1>
      
      <div className="space-y-8">
        <div>
          <BudgetManager />
        </div>
      </div>
    </div>
  );
};

export default BudgetDashboard;
