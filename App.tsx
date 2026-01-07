
import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import MonthlyView from './components/MonthlyView';
import AddExpenseModal from './components/AddExpenseModal';
import BottomNav from './components/BottomNav';
import { DEFAULT_CURRENCY } from './constants';
import { db, isConfigValid } from './firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

type ViewType = 'overview' | 'transactions' | 'monthly';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Load from Firebase Firestore
  useEffect(() => {
    if (!isConfigValid || !db) {
      setConfigError("Cloud variables are missing. Please update your environment variables with VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY, etc.");
      setIsInitialLoading(false);
      return;
    }

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
        console.error("Firebase fetch error:", error);
        setIsInitialLoading(false);
        if (error.message.includes("permission-denied") || error.message.includes("suspended") || error.message.includes("offline")) {
          setConfigError(`Cloud Sync Issue: ${error.message}. Check your Firestore rules or project status.`);
        }
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Firestore setup error:", err);
      setConfigError(`Service error: ${err.message}`);
      setIsInitialLoading(false);
    }
  }, []);

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!isConfigValid || !db) return;
    try {
      await addDoc(collection(db, "expenses"), {
        ...newExpense,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!isConfigValid || !db) return;
    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    const headers = ['Date', 'Description', 'Category', 'Original Amount', 'Original Currency', `Converted Amount (${DEFAULT_CURRENCY})`].join(',');
    
    const rows = expenses.map(e => {
      const escapedDesc = `"${e.description.replace(/"/g, '""')}"`;
      return [
        e.date,
        escapedDesc,
        e.category,
        e.originalAmount.toFixed(2),
        e.originalCurrency,
        e.amount.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_export_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-32 lg:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight hidden sm:block">Smart Expense Tracker</h1>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <div className={`w-1.5 h-1.5 rounded-full ${isInitialLoading ? 'bg-amber-400 animate-pulse' : configError ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isInitialLoading ? 'Connecting...' : configError ? 'Sync Error' : 'Cloud Sync Active'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-grow max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCSV}
              disabled={expenses.length === 0}
              className="p-2 text-slate-600 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30"
              title="Export CSV"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!!configError && expenses.length === 0}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {configError && expenses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 lg:p-12 text-center shadow-xl shadow-slate-200/50">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Cloud Setup Required</h2>
            <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
              To keep your data safe and synced across devices, you need to configure your Firebase Project variables in the deployment settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Step 1: Firebase</p>
                 <p className="text-sm text-slate-700">Create a project at <a href="https://console.firebase.google.com" target="_blank" className="text-indigo-600 underline font-bold">Firebase Console</a></p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Step 2: Config</p>
                 <p className="text-sm text-slate-700">Add <strong>VITE_FIREBASE_PROJECT_ID</strong> and other keys to your Environment Variables.</p>
               </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 font-medium">
              Current Status: {configError}
            </div>
          </div>
        ) : isInitialLoading && expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your cloud data...</p>
          </div>
        ) : (
          <>
            {configError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 font-medium flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {configError}
              </div>
            )}
            {activeView === 'overview' && <Dashboard expenses={filteredExpenses} />}
            {activeView === 'transactions' && <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />}
            {activeView === 'monthly' && <MonthlyView expenses={filteredExpenses} />}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeView={activeView} onNavigate={setActiveView} onAdd={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <AddExpenseModal 
          onAdd={addExpense}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
