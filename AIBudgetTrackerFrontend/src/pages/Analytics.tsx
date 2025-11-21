import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ReferenceDot, LineChart, Line 
} from 'recharts';
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Calendar, Lightbulb, AlertTriangle, BrainCircuit } from 'lucide-react';
import { getAnalytics, predictNextMonthExpenses, getSavingsGoalProgress } from '../services/api';
import type { SavingsGoalProgress } from '../types/index';

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

const COLORS = {
  primary: '#4F46E5',   
  secondary: '#10B981', 
  danger: '#EF4444',    
};

const FALLBACK_COLORS = [
  "#FF8042", "#00C49F", "#8884d8", "#82ca9d", "#a4de6c", "#ffc658", "#8dd1e1", "#d0ed57"
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#FF6384',
  'Transportation': '#36A2EB',
  'Entertainment': '#FFCE56',
  'Shopping': '#4BC0C0',
  'Bills': '#9966FF',
  'Healthcare': '#FF9F40',
  'Education': '#FF6384',
  'Other': '#C9CBCF'
};

const Analytics: React.FC = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData[]>([]);
  
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalProgress[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [historyTotals, setHistoryTotals] = useState<number[]>([]);
  const [historyMonths, setHistoryMonths] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [totalSpending, setTotalSpending] = useState(0);
  const [totalIncomePeriod, setTotalIncomePeriod] = useState(0);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const response = await getAnalytics(selectedYear, selectedMonth);
      
      // Category Data
      if (response.data.categoryBreakdown?.length > 0) {
        const catData = response.data.categoryBreakdown.map((item: any, index: number) => {
          const assignedColor = CATEGORY_COLORS[item.category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          return {
            category: item.category,
            amount: parseFloat(item.totalAmount),
            color: assignedColor
          };
        });
        setCategoryData(catData);
        setTotalSpending(catData.reduce((sum: number, c: CategoryData) => sum + c.amount, 0));
      } else {
        setCategoryData([]);
        setTotalSpending(0);
      }
      
      // Monthly Trend
      if (response.data.monthlyTrend?.length > 0) {
        const monthData = response.data.monthlyTrend.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString('default', { month: 'short' }),
          amount: parseFloat(item.totalAmount)
        }));
        setMonthlyData(monthData);
      } else {
        setMonthlyData([]);
      }
      
      // Income vs Expense
      if (response.data.incomeVsExpenses?.length > 0) {
        const incExpData = response.data.incomeVsExpenses.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString('default', { month: 'short' }),
          income: parseFloat(item.totalIncome),
          expenses: parseFloat(item.totalExpenses)
        }));
        setIncomeExpenseData(incExpData);
        setTotalIncomePeriod(incExpData.reduce((sum, d) => sum + d.income, 0));
      } else {
        setIncomeExpenseData([]);
        setTotalIncomePeriod(0);
      }

      try {
        const savingsRes = await getSavingsGoalProgress();
        setSavingsGoals(savingsRes.data || []);
      } catch (e) { console.warn(e); }

      try {
        const predRes = await predictNextMonthExpenses(12);
        setPrediction(predRes.data.predictedAmount);
        setHistoryTotals(predRes.data.historyTotals || []);
        setHistoryMonths(predRes.data.historyMonths || []);
      } catch (e) { console.warn(e); }
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPrediction = async () => {
    try {
        setPredicting(true);
        const res = await predictNextMonthExpenses(12);
        setPrediction(res.data.predictedAmount);
        setHistoryTotals(res.data.historyTotals || []);
        setHistoryMonths(res.data.historyMonths || []);
    } catch (err) {
        console.error('Prediction error', err);
        alert('Unable to get prediction.');
    } finally {
        setPredicting(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, selectedMonth]);

  // --- Calculations for Summary Cards ---
  const avgMonthlySpending = monthlyData.length > 0 
    ? (monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length)
    : 0;
  
  const totalIncomeYear = incomeExpenseData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenseYear = incomeExpenseData.reduce((sum, m) => sum + m.expenses, 0);

  // --- Data Prep for Prediction Chart ---
  const predictionChartData = historyMonths.map((monthStr, index) => {
    const date = new Date(monthStr);
    return {
        month: isNaN(date.getTime()) ? monthStr : date.toLocaleString('default', { month: 'short' }),
        amount: historyTotals[index] || 0
    };
  });

  if (historyMonths.length > 0 && prediction !== null) {
    const lastMonthStr = historyMonths[historyMonths.length - 1];
    const lastDate = new Date(lastMonthStr);
    const nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
    const nextLabel = nextDate.toLocaleString('default', { month: 'short' });
    predictionChartData.push({ month: nextLabel, amount: prediction });
  }

  // --- AI Logic ---
  const topCategories = [...categoryData].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const monthlyInsightsText = topCategories.length > 0 
      ? topCategories.map(c => `${c.category}: ₹${c.amount.toLocaleString()} (${((c.amount/totalSpending)*100).toFixed(0)}%)`).join(' • ')
      : 'No spending breakdown available yet.';

  const savingTips: string[] = [];
  
  if (topCategories.length > 0 && totalSpending > 0) {
      const dominant = topCategories[0];
      if (dominant.amount / totalSpending > 0.3) {
          savingTips.push(`Reduce ${dominant.category} by 10% to save approx ₹${Math.round(dominant.amount * 0.10)}.`);
      } else {
          savingTips.push('Spending is well distributed. Consider increasing your savings contribution.');
      }
  }
  
  if (totalIncomePeriod > 0) {
      const savingsRate = ((totalIncomePeriod - totalSpending) / totalIncomePeriod) * 100;
      if (savingsRate < 20) {
          savingTips.push(`Your savings rate is ${savingsRate.toFixed(1)}%. Try to reach 20% for better financial health.`);
      } else {
          savingTips.push(`Great job! You are saving ${savingsRate.toFixed(1)}% of your income.`);
      }
  } else {
      savingTips.push('Track more income to get savings rate insights.');
  }

  const savingAlerts: string[] = [];
  if (savingsGoals.length === 0) {
      savingAlerts.push('No savings goals set.');
  } else {
      savingsGoals.forEach((g) => {
          const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) : 0;
          if (progress < 0.5) {
              savingAlerts.push(`${g.name} is behind schedule.`);
          }
      });
      if (savingAlerts.length === 0) savingAlerts.push('All goals currently appear on track.');
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-bold text-gray-700 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.payload.fill }} className="text-sm">
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your spending habits with AI-powered insights.</p>
        </div>
        
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
          <Calendar size={18} className="text-gray-400 ml-2" />
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="p-2 bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 rounded">
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <div className="w-px h-6 bg-gray-200"></div>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="p-2 bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 rounded">
            {months.map(month => <option key={month} value={month}>{new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <button onClick={fetchAnalytics} className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium">
            Analyze
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Crunching the numbers...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* AI Analytics Section */}
          <div id="ai-analytics" className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BrainCircuit className="text-indigo-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">AI Forecast</h2>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Spending Categories</h4>
                            <p className="text-gray-700 font-medium leading-relaxed">{monthlyInsightsText}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3">
                                <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-yellow-800">{savingTips[0]}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex gap-3">
                                <TrendingUp className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-green-800">{savingTips[1]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button onClick={handleManualPrediction} className="w-full bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50 text-sm font-medium transition-colors shadow-sm">
                            {predicting ? 'Recalculating...' : 'Refresh Prediction Model'}
                        </button>
                    </div>
                </div>
                <div className="lg:w-2/3 bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-700">Expense Trend & Prediction</h3>
                        {prediction !== null && (
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                Forecast: ₹{prediction.toFixed(0)}
                            </span>
                        )}
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={predictionChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="amount" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4, fill: COLORS.primary }} activeDot={{ r: 6 }} />
                                {prediction !== null && predictionChartData.length > 0 && (
                                    <ReferenceDot 
                                        x={predictionChartData[predictionChartData.length - 1].month} 
                                        y={prediction} 
                                        r={6} 
                                        fill={COLORS.danger} 
                                        stroke="white"
                                        strokeWidth={2}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>

          {/* Spending Trend Area Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg"><TrendingUp className="text-indigo-600" size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Monthly Spending Trend</h2>
                <p className="text-sm text-gray-500">Historical spending analysis</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-100 rounded-lg"><PieChartIcon className="text-pink-600" size={24} /></div>
                <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
              </div>
              {categoryData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="amount" nameKey="category" label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>

            {/* Income vs Expense */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg"><BarChart3 className="text-emerald-600" size={24} /></div>
                <h2 className="text-xl font-bold text-gray-900">Income vs Expense</h2>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expenses" name="Expenses" fill={COLORS.danger} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* --- RE-ADDED: Summary Metrics Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-indigo-100 text-sm font-medium mb-1">Monthly Average</p>
                <h3 className="text-3xl font-bold">
                  ₹{avgMonthlySpending.toFixed(0)}
                </h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                <TrendingUp size={100} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-emerald-100 text-sm font-medium mb-1">Total Income (Year)</p>
                <h3 className="text-3xl font-bold">
                  ₹{totalIncomeYear.toLocaleString()}
                </h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                <BarChart3 size={100} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-rose-100 text-sm font-medium mb-1">Total Expenses (Year)</p>
                <h3 className="text-3xl font-bold">
                  ₹{totalExpenseYear.toLocaleString()}
                </h3>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
                <PieChartIcon size={100} />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;




// import React, { useState, useEffect } from 'react';
// import { 
//   BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, LineChart, Line 
// } from 'recharts';
// import { PieChart as PieChartIcon, BarChart3, TrendingUp, Calendar, Lightbulb, AlertTriangle, BrainCircuit } from 'lucide-react';
// import { getAnalytics, predictNextMonthExpenses, getSavingsGoalProgress } from '../services/api';
// import type { SavingsGoalProgress } from '../types/index';

// // --- Types ---
// interface CategoryData {
//   category: string;
//   amount: number;
//   color: string;
// }

// interface MonthlyData {
//   month: string;
//   amount: number;
// }

// interface IncomeExpenseData {
//   month: string;
//   income: number;
//   expenses: number;
// }

// // --- Constants ---
// const COLORS = {
//   primary: '#4F46E5',   // Indigo
//   secondary: '#10B981', // Emerald
//   danger: '#EF4444',    // Red
// };

// // A robust list of colors to cycle through if a specific category color isn't found
// const FALLBACK_COLORS = [
//   "#FF8042", "#00C49F", "#8884d8", "#82ca9d", "#a4de6c", "#ffc658", "#8dd1e1", "#d0ed57"
// ];

// const CATEGORY_COLORS: { [key: string]: string } = {
//   'Food': '#FF6384',
//   'Transportation': '#36A2EB',
//   'Entertainment': '#FFCE56',
//   'Shopping': '#4BC0C0',
//   'Bills': '#9966FF',
//   'Healthcare': '#FF9F40',
//   'Education': '#FF6384',
//   'Other': '#C9CBCF'
// };

// const Analytics: React.FC = () => {
//   const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
//   const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
//   const [incomeExpenseData, setIncomeExpenseData] = useState<IncomeExpenseData[]>([]);
  
//   // AI & Savings State
//   const [savingsGoals, setSavingsGoals] = useState<SavingsGoalProgress[]>([]);
//   const [prediction, setPrediction] = useState<number | null>(null);
//   const [historyTotals, setHistoryTotals] = useState<number[]>([]);
//   const [predicting, setPredicting] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [totalSpending, setTotalSpending] = useState(0);
//   const [totalIncomePeriod, setTotalIncomePeriod] = useState(0); // New for AI logic

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
//   const months = Array.from({ length: 12 }, (_, i) => i + 1);

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);
      
//       // 1. Fetch Core Analytics
//       const response = await getAnalytics(selectedYear, selectedMonth);
      
//       // Process Category Data
//       if (response.data.categoryBreakdown?.length > 0) {
//         const catData = response.data.categoryBreakdown.map((item: any, index: number) => {
//           const assignedColor = CATEGORY_COLORS[item.category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
//           return {
//             category: item.category,
//             amount: parseFloat(item.totalAmount),
//             color: assignedColor
//           };
//         });
//         setCategoryData(catData);
//         setTotalSpending(catData.reduce((sum: number, c: CategoryData) => sum + c.amount, 0));
//       } else {
//         setCategoryData([]);
//         setTotalSpending(0);
//       }
      
//       // Process Monthly Trend Data
//       if (response.data.monthlyTrend?.length > 0) {
//         const monthData = response.data.monthlyTrend.map((item: any) => ({
//           month: new Date(item.month).toLocaleDateString('default', { month: 'short' }),
//           amount: parseFloat(item.totalAmount)
//         }));
//         setMonthlyData(monthData);
//       } else {
//         setMonthlyData([]);
//       }
      
//       // Process Income vs Expense Data
//       if (response.data.incomeVsExpenses?.length > 0) {
//         const incExpData = response.data.incomeVsExpenses.map((item: any) => ({
//           month: new Date(item.month).toLocaleDateString('default', { month: 'short' }),
//           income: parseFloat(item.totalIncome),
//           expenses: parseFloat(item.totalExpenses)
//         }));
//         setIncomeExpenseData(incExpData);
//         // Calculate total income for the period for AI tips
//         setTotalIncomePeriod(incExpData.reduce((sum, d) => sum + d.income, 0));
//       } else {
//         setIncomeExpenseData([]);
//         setTotalIncomePeriod(0);
//       }

//       // 2. Fetch Savings Goals (for Alerts)
//       try {
//         const savingsRes = await getSavingsGoalProgress();
//         setSavingsGoals(savingsRes.data || []);
//       } catch (e) {
//         console.warn("Failed to load savings for AI analysis", e);
//       }

//       // 3. Fetch AI Prediction
//       try {
//         const predRes = await predictNextMonthExpenses(12);
//         setPrediction(predRes.data.predictedAmount);
//         setHistoryTotals(predRes.data.historyTotals || []);
//       } catch (e) {
//         console.warn("Failed to load prediction", e);
//       }
      
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManualPrediction = async () => {
//     try {
//         setPredicting(true);
//         const res = await predictNextMonthExpenses(12);
//         setPrediction(res.data.predictedAmount);
//         setHistoryTotals(res.data.historyTotals || []);
//     } catch (err) {
//         console.error('Prediction error', err);
//         alert('Unable to get prediction.');
//     } finally {
//         setPredicting(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [selectedYear, selectedMonth]);

//   // --- AI Logic Generators ---
//   const topCategories = [...categoryData].sort((a, b) => b.amount - a.amount).slice(0, 3);
//   const monthlyInsightsText = topCategories.length > 0 
//       ? topCategories.map(c => `${c.category}: ₹${c.amount.toLocaleString()} (${((c.amount/totalSpending)*100).toFixed(0)}%)`).join(' • ')
//       : 'No spending breakdown available yet.';

//   const savingTips: string[] = [];
//   if (topCategories.length > 0 && totalSpending > 0) {
//       const dominant = topCategories[0];
//       // If dominant category is > 30% of total spending
//       if (dominant.amount / totalSpending > 0.3) {
//           savingTips.push(`Reduce ${dominant.category} by 10% to save approx ₹${Math.round(dominant.amount * 0.10)}.`);
//       } else {
//           savingTips.push('Spending looks reasonably distributed — consider automating a small transfer to savings.');
//       }
//   } else {
//       savingTips.push('Not enough data for personalized tips yet.');
//   }

//   const savingAlerts: string[] = [];
//   if (savingsGoals.length === 0) {
//       savingAlerts.push('No savings goals set.');
//   } else {
//       savingsGoals.forEach((g) => {
//           const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) : 0;
//           if (progress < 0.5) {
//               savingAlerts.push(`${g.name} is behind schedule.`);
//           }
//       });
//       if (savingAlerts.length === 0) savingAlerts.push('All goals currently appear on track.');
//   }

//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
//           <p className="font-bold text-gray-700 mb-1">{label}</p>
//           {payload.map((entry: any, index: number) => (
//             <p key={index} style={{ color: entry.color || entry.payload.fill }} className="text-sm">
//               {entry.name}: ₹{entry.value.toLocaleString()}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       {/* Page Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
//           <p className="text-gray-500 mt-1">Deep dive into your spending habits with AI-powered insights.</p>
//         </div>
        
//         {/* Filter Controls */}
//         <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
//           <Calendar size={18} className="text-gray-400 ml-2" />
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//             className="p-2 bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 rounded"
//           >
//             {years.map(year => <option key={year} value={year}>{year}</option>)}
//           </select>
//           <div className="w-px h-6 bg-gray-200"></div>
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//             className="p-2 bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 rounded"
//           >
//             {months.map(month => (
//               <option key={month} value={month}>
//                 {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={fetchAnalytics}
//             className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
//           >
//             Analyze
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex flex-col items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
//           <p className="mt-4 text-gray-500 font-medium">Crunching the numbers...</p>
//         </div>
//       ) : (
//         <div className="space-y-8">
          
//           {/* --- NEW AI ANALYTICS SECTION --- */}
//           <div id="ai-analytics" className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
//             <div className="flex flex-col md:flex-row gap-6">
//                 {/* Left: Prediction & Insights */}
//                 <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-3">
//                         <BrainCircuit className="text-indigo-600" size={24} />
//                         <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
//                     </div>
//                     <p className="text-gray-600 mb-4 font-medium">{monthlyInsightsText}</p>
                    
//                     <div className="flex items-center gap-4 mb-4">
//                         <button
//                             onClick={handleManualPrediction}
//                             className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
//                         >
//                             {predicting ? 'Predicting...' : 'Recalculate Prediction'}
//                         </button>
//                         {prediction !== null && (
//                             <div className="text-gray-800 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
//                                 Next month predicted: <strong className="text-indigo-700 text-lg">₹{prediction.toFixed(0)}</strong>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Right: Tips & Alerts */}
//                 <div className="flex-1 flex flex-col gap-3">
//                     <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 items-start">
//                         <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
//                         <div>
//                             <h4 className="font-bold text-yellow-800 text-sm mb-1">Smart Tip</h4>
//                             <p className="text-sm text-yellow-700 leading-relaxed">{savingTips[0]}</p>
//                         </div>
//                     </div>
                    
//                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
//                         <AlertTriangle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
//                         <div>
//                             <h4 className="font-bold text-blue-800 text-sm mb-1">Goal Alerts</h4>
//                             <p className="text-sm text-blue-700 leading-relaxed">{savingAlerts.slice(0, 2).join(' • ')}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//           </div>

//           {/* 1. Spending Trend (Area Chart) */}
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2 bg-indigo-100 rounded-lg">
//                 <TrendingUp className="text-indigo-600" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">Spending Trend</h2>
//                 <p className="text-sm text-gray-500">Monthly spending over the selected year</p>
//               </div>
//             </div>
            
//             <div className="h-[350px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={monthlyData}>
//                   <defs>
//                     <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
//                       <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                   <XAxis 
//                     dataKey="month" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{fill: '#6B7280', fontSize: 12}} 
//                     dy={10}
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{fill: '#6B7280', fontSize: 12}}
//                     tickFormatter={(value) => `₹${value/1000}k`} 
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Area 
//                     type="monotone" 
//                     dataKey="amount" 
//                     name="Spending"
//                     stroke={COLORS.primary} 
//                     strokeWidth={3}
//                     fillOpacity={1} 
//                     fill="url(#colorAmount)" 
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* 2. Category Breakdown (Donut Chart) */}
//             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 bg-pink-100 rounded-lg">
//                   <PieChartIcon className="text-pink-600" size={24} />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>
//               </div>

//               {categoryData.length > 0 ? (
//                 <div className="grid md:grid-cols-2 gap-4 items-center">
//                   {/* Chart */}
//                   <div className="h-[300px] w-full">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={categoryData}
//                           cx="50%"
//                           cy="50%"
//                           innerRadius={60}
//                           outerRadius={80}
//                           paddingAngle={5}
//                           dataKey="amount"
//                           nameKey="category" 
//                           label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//                         >
//                           {categoryData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
//                           ))}
//                         </Pie>
//                         <Tooltip content={<CustomTooltip />} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>

//                   {/* Breakdown List */}
//                   <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
//                     {categoryData.map((cat, index) => (
//                       <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
//                         <div className="flex items-center gap-2">
//                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
//                           <span className="text-sm font-medium text-gray-700">{cat.category}</span>
//                         </div>
//                         <div className="text-right">
//                           <span className="text-sm font-bold text-gray-900">₹{cat.amount.toLocaleString()}</span>
//                         </div>
//                       </div>
//                     ))}
//                     <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
//                         <span className="text-sm text-gray-500 font-medium">Total</span>
//                         <span className="text-lg font-bold text-gray-900">₹{totalSpending.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="h-[300px] flex items-center justify-center text-gray-400">
//                   No data available for this period
//                 </div>
//               )}
//             </div>

//             {/* 3. Income vs Expense (Bar Chart) */}
//             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 bg-emerald-100 rounded-lg">
//                   <BarChart3 className="text-emerald-600" size={24} />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900">Income vs Expense</h2>
//               </div>

//               <div className="h-[300px] w-full">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={incomeExpenseData} barGap={8}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                     <XAxis 
//                       dataKey="month" 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#6B7280', fontSize: 12}} 
//                       dy={10}
//                     />
//                     <YAxis 
//                       axisLine={false} 
//                       tickLine={false} 
//                       tick={{fill: '#6B7280', fontSize: 12}}
//                       tickFormatter={(value) => `₹${value/1000}k`}
//                     />
//                     <Tooltip content={<CustomTooltip />} />
//                     <Legend />
//                     <Bar 
//                       dataKey="income" 
//                       name="Income" 
//                       fill={COLORS.secondary} 
//                       radius={[4, 4, 0, 0]} 
//                       barSize={20}
//                     />
//                     <Bar 
//                       dataKey="expenses" 
//                       name="Expenses" 
//                       fill={COLORS.danger} 
//                       radius={[4, 4, 0, 0]} 
//                       barSize={20}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           {/* 4. Summary Metrics Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
//               <div className="relative z-10">
//                 <p className="text-indigo-100 text-sm font-medium mb-1">Monthly Average</p>
//                 <h3 className="text-3xl font-bold">
//                   ₹{monthlyData.length > 0 
//                     ? (monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toFixed(0)
//                     : '0'}
//                 </h3>
//               </div>
//               <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
//                 <TrendingUp size={100} />
//               </div>
//             </div>

//             <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
//               <div className="relative z-10">
//                 <p className="text-emerald-100 text-sm font-medium mb-1">Total Income (Year)</p>
//                 <h3 className="text-3xl font-bold">
//                   ₹{incomeExpenseData.reduce((sum, m) => sum + m.income, 0).toLocaleString()}
//                 </h3>
//               </div>
//               <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
//                 <BarChart3 size={100} />
//               </div>
//             </div>

//             <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
//               <div className="relative z-10">
//                 <p className="text-rose-100 text-sm font-medium mb-1">Total Expenses (Year)</p>
//                 <h3 className="text-3xl font-bold">
//                   ₹{incomeExpenseData.reduce((sum, m) => sum + m.expenses, 0).toLocaleString()}
//                 </h3>
//               </div>
//               <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-2 translate-x-2">
//                 <PieChartIcon size={100} />
//               </div>
//             </div>
//           </div>

//         </div>
//       )}
//     </div>
//   );
// };

// export default Analytics;