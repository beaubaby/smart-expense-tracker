import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import MonthlyView from './components/MonthlyView';
import AddExpenseModal from './components/AddExpenseModal';
import BottomNav from './components/BottomNav';
import { dbService } from './dbService';

type ViewType = 'overview' | 'transactions' | 'monthly';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'cloud' | 'local'>('local');

  // Initialize IndexedDB and load expenses
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🔄 Initializing MongoDB with IndexedDB fallback...');
        await dbService.init();
        
        // Load expenses from MongoDB (or IndexedDB as fallback)
        await loadExpenses();
        
        console.log('✅ App initialized successfully');
        setSyncStatus('cloud');
      } catch (err) {
        console.error("❌ Initialization failed:", err);
        setSyncStatus('local');
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  // Load expenses from MongoDB
  const loadExpenses = async () => {
    try {
      console.log('📥 Loading expenses from MongoDB...');
      const loadedExpenses = await dbService.getAllExpenses();
      console.log(`✅ Loaded ${loadedExpenses.length} expenses`);
      setExpenses(loadedExpenses);
    } catch (err) {
      console.error("❌ Failed to load expenses:", err);
      throw err;
    }
  };

  // Add new expense to MongoDB
  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const timestamp = Date.now();
    const tempId = crypto.randomUUID();
    const fullExpense = { 
      id: tempId, 
      ...newExpense, 
      createdAt: timestamp 
    } as Expense;

    // Optimistic UI update
    setExpenses(prev => [fullExpense, ...prev]);

    try {
      console.log('💾 Saving expense to MongoDB...');
      await dbService.addExpense(fullExpense);
      console.log('✅ Expense saved successfully');
    } catch (error) {
      console.error("❌ Failed to save expense:", error);
      // Remove from UI if save fails
      setExpenses(prev => prev.filter(e => e.id !== tempId));
      throw error;
    }
  };

  // Delete expense from MongoDB
  const deleteExpense = async (id: string) => {
    // Optimistic update
    setExpenses(prev => prev.filter(e => e.id !== id));

    try {
      console.log('🗑️  Deleting expense from MongoDB...');
      await dbService.deleteExpense(id);
      console.log('✅ Expense deleted successfully');
    } catch (error) {
      console.error("❌ Failed to delete expense:", error);
      // Restore if delete fails
      const deletedExpense = expenses.find(e => e.id === id);
      if (deletedExpense) {
        setExpenses(prev => [deletedExpense, ...prev]);
      }
      throw error;
    }
  };

  const refreshExpenses = async () => {
    try {
      console.log('🔄 Refreshing expenses...');
      await loadExpenses();
      console.log('✅ Refresh complete');
    } catch (error) {
      console.error("❌ Failed to refresh:", error);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount (NZD)'].join(',');
    const rows = expenses.map(e => [e.date, `"${e.description}"`, e.category, e.amount].join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-32 lg:pb-12">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block leading-none mb-1">Smart Expense</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'cloud' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isLoading ? 'Connecting...' : syncStatus === 'cloud' ? 'Cloud Sync Active ✓' : 'Offline / Local Mode'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-grow max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <button onClick={handleExportCSV} className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Export CSV">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading && expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connecting to Cloud...</p>
          </div>
        ) : (
          <>
            {activeView === 'overview' && <Dashboard expenses={filteredExpenses} />}
            {activeView === 'transactions' && <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />}
            {activeView === 'monthly' && <MonthlyView expenses={filteredExpenses} />}
          </>
        )}
      </main>

      <BottomNav activeView={activeView} onNavigate={setActiveView} onAdd={() => setIsModalOpen(true)} />
      {isModalOpen && <AddExpenseModal onAdd={addExpense} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default App;
