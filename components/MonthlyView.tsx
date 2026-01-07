
import React from 'react';
import { Expense } from '../types';
import { DEFAULT_CURRENCY, CATEGORY_COLORS } from '../constants';

interface MonthlyViewProps {
  expenses: Expense[];
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ expenses }) => {
  const monthlyData = React.useMemo(() => {
    const months: Record<string, { 
      total: number; 
      count: number; 
      topCategory: string;
      categoryTotals: Record<string, number>;
    }> = {};

    expenses.forEach(exp => {
      const monthKey = exp.date.substring(0, 7); // YYYY-MM
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, count: 0, topCategory: '', categoryTotals: {} };
      }
      
      months[monthKey].total += exp.amount;
      months[monthKey].count += 1;
      months[monthKey].categoryTotals[exp.category] = (months[monthKey].categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Find top category for each month
    Object.keys(months).forEach(key => {
      const totals = months[key].categoryTotals;
      months[key].topCategory = Object.keys(totals).reduce((a, b) => totals[a] > totals[b] ? a : b);
    });

    return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses]);

  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">No monthly data</h3>
        <p className="text-slate-500">Record expenses to see your monthly trends.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {monthlyData.map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthName = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

        return (
          <div key={monthKey} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">{monthName}</h3>
                <p className="text-sm font-bold text-slate-400">{data.count} transactions</p>
              </div>
              <div className="bg-indigo-50 px-3 py-1 rounded-full">
                <span className="text-xs font-black text-indigo-600 uppercase">{DEFAULT_CURRENCY}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
              <h2 className="text-3xl font-black text-indigo-600">
                ${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: (CATEGORY_COLORS as any)[data.topCategory] }}
              >
                {data.topCategory[0]}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Category</p>
                <p className="text-sm font-bold text-slate-800">{data.topCategory}</p>
              </div>
              <div className="ml-auto text-right">
                 <p className="text-xs font-black text-slate-900">${data.categoryTotals[data.topCategory].toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthlyView;
