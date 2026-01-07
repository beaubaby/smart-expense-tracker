
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Expense, SummaryData, Category } from '../types';
import { CATEGORY_COLORS, DEFAULT_CURRENCY } from '../constants';

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const [allocationMonth, setAllocationMonth] = useState<string>('all');

  // Unique months from expenses for the filter dropdown
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(exp => {
      months.add(exp.date.substring(0, 7)); // YYYY-MM
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const summary = React.useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Filter expenses for allocation chart if a specific month is selected
    const allocationExpenses = allocationMonth === 'all' 
      ? expenses 
      : expenses.filter(e => e.date.startsWith(allocationMonth));

    const byCategoryMap = allocationExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = Object.entries(byCategoryMap).map(([name, value]) => ({
      name: name as Category,
      value: value as number
    })).sort((a, b) => b.value - a.value);

    // History is always shown for all time (last 10 days) to show trends
    const historyMap = expenses.reduce((acc, curr) => {
      const date = curr.date.substring(0, 10);
      acc[date] = (acc[date] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const history = Object.entries(historyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);

    return { total, byCategory, history };
  }, [expenses, allocationMonth]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] shadow-sm border border-slate-100 min-h-[400px]">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-900">Your financial story starts here</h3>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">Add your first expense to see beautiful visualizations of your spending habits.</p>
      </div>
    );
  }

  const selectedMonthLabel = allocationMonth === 'all' 
    ? 'All Time' 
    : new Date(allocationMonth + '-01').toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Total Balance Card */}
      <div className="lg:col-span-12 bg-indigo-600 p-8 rounded-[40px] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Accumulated Spend</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-200 tracking-tighter">$</span>
              <h2 className="text-6xl font-black tracking-tighter">
                {summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="text-xl font-bold text-indigo-200">{DEFAULT_CURRENCY}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
              <p className="text-[10px] font-black uppercase text-indigo-100 tracking-wider">Avg/Day</p>
              <p className="text-xl font-bold">${(summary.total / (summary.history.length || 1)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart Card */}
      <div className="lg:col-span-5 bg-white p-8 rounded-[32px] shadow-sm border border-slate-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-900 text-lg font-black flex flex-col">
            Allocation
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedMonthLabel}</span>
          </h3>
          <select 
            value={allocationMonth}
            onChange={(e) => setAllocationMonth(e.target.value)}
            className="text-xs font-bold bg-slate-100 border-none rounded-lg px-2 py-1 outline-none text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Time</option>
            {availableMonths.map(m => {
              const label = new Date(m + '-01').toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
              return <option key={m} value={m}>{label}</option>
            })}
          </select>
        </div>
        
        <div className="h-72">
          {summary.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.byCategory}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {summary.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
              No data for this period
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
           {summary.byCategory.slice(0, 6).map(cat => (
             <div key={cat.name} className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] }}></div>
               <span className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">{cat.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="lg:col-span-7 bg-white p-8 rounded-[32px] shadow-sm border border-slate-50">
        <h3 className="text-slate-900 text-lg font-black mb-6 flex items-center justify-between">
          Flow
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Recent Activity</span>
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.history}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                tickFormatter={(val) => val.split('-').slice(1).join('/')}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 12 }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(val: number) => [`$${val.toFixed(2)}`, 'Spend']}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
