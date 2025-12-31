
import React from 'react';
import { Expense } from '../types';
import { CATEGORY_COLORS, DEFAULT_CURRENCY } from '../constants';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const sortedExpenses = [...expenses].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
      </div>
      
      <div className="space-y-4">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500">No transactions recorded yet.</p>
          </div>
        ) : (
          sortedExpenses.map((expense) => (
            <div 
              key={expense.id} 
              className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                >
                  <span className="text-xl">{expense.category[0]}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{expense.description}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium uppercase tracking-tight">
                      {expense.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    -${expense.amount.toFixed(2)} <span className="text-xs font-normal text-slate-400">{DEFAULT_CURRENCY}</span>
                  </div>
                  {expense.originalCurrency !== DEFAULT_CURRENCY && (
                    <div className="text-xs text-slate-400 font-medium">
                      Original: {expense.originalAmount.toFixed(2)} {expense.originalCurrency}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
