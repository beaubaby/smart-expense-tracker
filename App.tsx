
import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import MonthlyView from './components/MonthlyView';
import AddExpenseModal from './components/AddExpenseModal';
import BottomNav from './components/BottomNav';
import { DEFAULT_CURRENCY } from './constants';
import { db, isConfigValid } from './firebaseConfig';
import { dbService } from './dbService';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

type ViewType = 'overview' | 'transactions' | 'monthly';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Initialize IndexedDB and check config
  useEffect(() => {
    const init = async () => {
      try {
        await dbService.init();
        // Always load local data first for fast initial paint
        const localExpenses = await dbService.getAllExpenses();
        setExpenses(localExpenses);
        
        if (!isConfigValid || !db) {
          console.info("Firebase not configured, staying in local storage mode.");
          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Storage init failed:", err);
      }
    };
    init();
  }, []);

  // Sync with Firebase if available
  useEffect(() => {
    if (!isConfigValid || !db) return;

    setIsInitialLoading(true);
    try {
      const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expensesArr: Expense[] = [];
        querySnapshot.forEach((doc) => {
          expensesArr.push({ id: doc.id, ...doc.data() } as Expense);
        });
        setExpenses(expensesArr);
        setIsInitialLoading(false);
        setConfigError(null);
      }, (error) => {
        console.error("Firebase sync error:", error);
        setIsInitialLoading(false);
        setConfigError(`Sync Error: ${error.message}`);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Firestore error:", err);
      setIsInitialLoading(false);
      setConfigError(err.message);
    }
  }, []);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const timestamp = Date.now();
    const id = crypto.randomUUID();
    const expenseData = { ...newExpense, createdAt: timestamp };

    // Always save to IndexedDB for offline capability
    try {
      await dbService.addExpense({ id, ...expenseData } as Expense);
      if (!db) {
        setExpenses(prev => [{ id, ...expenseData } as Expense, ...prev]);
      }
    } catch (e) {
      console.error("IndexedDB save failed:", e);
    }

    // Save to Firebase if configured
    if (db) {
      try {
        await addDoc(collection(db, "expenses"), expenseData);
      } catch (e) {
        console.error("Firebase save failed:", e);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await dbService.deleteExpense(id);
      if (!db) {
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch (e) {
      console.error("IndexedDB delete failed:", e);
    }

    if (db) {
      try {
        await deleteDoc(doc(db, "expenses", id));
      } catch (e) {
        console.error("Firebase delete failed:", e);
      }
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
    link.setAttribute('download', 'expenses.csv');
    link.click();
  };

  const isActuallyRunningLocal = !isConfigValid || !!configError;

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
                <div className={`w-1.5 h-1.5 rounded-full ${isActuallyRunningLocal ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isActuallyRunningLocal ? 'Local Mode' : 'Cloud Sync'}
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
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button onClick={handleExportCSV} className="p-2 text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {isInitialLoading && expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading data...</p>
          </div>
        ) : (
          <>
            {configError && (
              <div className="mb-4 p-4 bg-amber-50 text-amber-800 rounded-2xl text-xs border border-amber-100 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {configError} - Running in local mode.
              </div>
            )}
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
