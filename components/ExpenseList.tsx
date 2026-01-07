
import React from 'react';
import { Expense } from '../types';
import { CATEGORY_COLORS, DEFAULT_CURRENCY } from '../constants';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  // Grouping by date
  const groups = React.useMemo(() => {
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    const grouped: Record<string, { total: number; items: Expense[] }> = {};
    
    sorted.forEach(expense => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = { total: 0, items: [] };
      }
      grouped[expense.date].items.push(expense);
      grouped[expense.date].total += expense.amount;
    });

    return Object.entries(grouped);
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800">No transactions found</h3>
        <p className="text-slate-500">Try adjusting your search or add a new expense.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([date, group]) => {
        const dateObj = new Date(date);
        const today = new Date().toISOString().split('T')[0];
        const dateLabel = date === today ? 'Today' : dateObj.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });

        return (
          <div key={date}>
            <div className="flex items-center justify-between px-2 mb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{dateLabel}</h3>
              <span className="text-sm font-bold text-slate-900">Total: -${group.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              {group.items.map((expense) => (
                <div 
                  key={expense.id} 
                  className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                    >
                      <span className="text-xl font-bold">{expense.category[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{expense.description}</h4>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">{expense.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">
                        -${expense.amount.toFixed(2)}
                      </div>
                      {expense.originalCurrency !== DEFAULT_CURRENCY && (
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {expense.originalAmount.toFixed(2)} {expense.originalCurrency}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseList;
