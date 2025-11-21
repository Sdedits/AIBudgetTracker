import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  createSavingsGoal, 
  updateSavingsGoal, 
  deleteSavingsGoal,
  addToSavingsGoal,
  getSavingsGoalProgress
} from '../services/api';
import type { SavingsGoal, SavingsGoalRequest, SavingsGoalProgress } from '../types/index';

const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoalProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  // Keep add amount values per-goal to avoid sharing the same input across all goal cards
  const [addAmounts, setAddAmounts] = useState<Record<number, string>>({});
  
  const { register, handleSubmit, reset } = useForm<SavingsGoalRequest>();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await getSavingsGoalProgress();
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onSubmit = async (data: SavingsGoalRequest) => {
    try {
      if (selectedGoal) {
        await updateSavingsGoal(selectedGoal.id, data);
      } else {
        await createSavingsGoal({
          ...data,
          currentAmount: data.currentAmount || 0
        });
      }
      reset();
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error saving savings goal:', error);
    }
  };

  const handleAddToGoal = async (goalId: number) => {
    const value = addAmounts[goalId] || '';
    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await addToSavingsGoal(goalId, parseFloat(value));
      // reset only this goal's input
      setAddAmounts(prev => {
        const copy = { ...prev };
        delete copy[goalId];
        return copy;
      });
      fetchGoals();
    } catch (error) {
      console.error('Error adding to savings goal:', error);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    // Reset the form with current goal data
    reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate?.split('T')[0] // Format date for input
    });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await deleteSavingsGoal(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting savings goal:', error);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Savings Goals</h2>
      
      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          💡 How Savings Goals Work
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          Money added to your savings goals is <strong>frozen (locked 🔒)</strong> and deducted from your available balance. 
          This ensures you stay committed to your financial targets and don't accidentally spend your savings!
        </p>
      </div>
      
      {/* Add/Edit Goal Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Goal name"
            {...register('name', { required: true })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Target amount"
            {...register('targetAmount', { required: true, min: 0 })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Current amount"
            {...register('currentAmount', { min: 0 })}
            className="p-2 border rounded"
          />
          <input
            type="date"
            {...register('targetDate')}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            {selectedGoal ? 'Update Goal' : 'Add Goal'}
          </button>
          {selectedGoal && (
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedGoal(null);
              }}
              className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Goals List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Loading savings goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No savings goals yet. Add one above to get started.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => {
              const daysRemaining = calculateDaysRemaining(goal.targetDate);
              const isOnTrack = goal.onTrack;
              
              return (
                <div key={goal.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress:</span>
                      <span>{goal.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          isOnTrack ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Current</div>
                      <div className="font-medium">₹{goal.currentAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Target</div>
                      <div className="font-medium">₹{goal.targetAmount.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {goal.targetDate && (
                    <div className="text-sm mb-4">
                      <div className="text-gray-500">Target Date</div>
                      <div>
                        {formatDate(goal.targetDate)}
                        {daysRemaining !== null && (
                          <span className={`ml-2 text-sm ${
                            daysRemaining < 0 ? 'text-red-500' : 'text-gray-600'
                          }`}>
                            ({daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Amount to add"
                      value={addAmounts[goal.id] || ''}
                      onChange={(e) => setAddAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                      className="flex-1 p-2 border rounded text-sm"
                    />
                    <button
                      onClick={() => handleAddToGoal(goal.id)}
                      className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {!isOnTrack && goal.targetDate && daysRemaining !== null && daysRemaining > 0 && (
                    <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                      You're behind schedule. Consider increasing your savings rate to meet your goal.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
