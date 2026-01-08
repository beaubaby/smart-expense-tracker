import React, { useState, useEffect, useMemo } from 'react';
import { Expense } from './types';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import MonthlyView from './components/MonthlyView';
import AddExpenseModal from './components/AddExpenseModal';
import BottomNav from './components/BottomNav';
import { db, isConfigValid } from './firebaseConfig';
import { dbService } from './dbService';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

type ViewType = 'overview' | 'transactions' | 'monthly';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'cloud' | 'local'>('local');

  // Initialize IndexedDB
  useEffect(() => {
    const initIndexedDB = async () => {
      try {
        await dbService.init();
        await dbService.migrateFromLocalStorage();
      } catch (err) {
        console.error("IndexedDB initialization failed:", err);
      }
    };
    initIndexedDB();
  }, []);

  // Real-time Cloud Sync - ALWAYS TRY THIS FIRST
  useEffect(() => {
    if (!isConfigValid || !db) {
      console.log("Firebase not configured, using local mode");
      setSyncStatus('local');
      setIsLoading(false);
      return;
    }

    console.log("Setting up Firestore real-time sync...");
    
    try {
      const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const cloudExpenses: Expense[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            cloudExpenses.push({
              id: docSnap.id,
              amount: data.amount,
              currency: data.currency,
              originalAmount: data.originalAmount,
              originalCurrency: data.originalCurrency,
              category: data.category,
              date: data.date,
              description: data.description,
              createdAt: data.createdAt
            } as Expense);
          });
          
          console.log("Cloud sync successful, loaded", cloudExpenses.length, "expenses");
          setExpenses(cloudExpenses);
          setSyncStatus('cloud');
          setIsLoading(false);
        },
        (error) => {
          console.error("Firestore listener error:", error);
          setSyncStatus('local');
          setIsLoading(false);
          // Try to load from local cache
          loadLocalExpenses();
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore setup failed:", err);
      setSyncStatus('local');
      setIsLoading(false);
      loadLocalExpenses();
    }
  }, []);

  // Load from IndexedDB when offline
  const loadLocalExpenses = async () => {
    try {
      const localExpenses = await dbService.getAllExpenses();
      if (localExpenses.length > 0) {
        setExpenses(localExpenses.sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (err) {
      console.error("Failed to load local expenses:", err);
    }
  };

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const timestamp = Date.now();
    const tempId = crypto.randomUUID();
    const expenseData = { ...newExpense, createdAt: timestamp };
    const fullExpense = { id: tempId, ...expenseData } as Expense;

    // Optimistic UI update
    setExpenses(prev => [fullExpense, ...prev]);

    // PRIMARY: Save to Cloud first
    if (db && syncStatus === 'cloud') {
      try {
        const docRef = await addDoc(collection(db, "expenses"), expenseData);
        console.log("Expense saved to Firestore with ID:", docRef.id);
        // Update local copy with real Firestore ID
        setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: docRef.id } : e));
      } catch (error) {
        console.error("Failed to save to Firestore:", error);
        // Fallback to local if cloud fails
        try {
          await dbService.addExpense(fullExpense);
          console.log("Saved to local IndexedDB as fallback");
        } catch (localErr) {
          console.error("Local save also failed:", localErr);
        }
      }
    } else {
      // FALLBACK: Save to local IndexedDB only if offline
      try {
        await dbService.addExpense(fullExpense);
        console.log("Saved to local IndexedDB (offline mode)");
      } catch (err) {
        console.error("Failed to save to IndexedDB:", err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    // Optimistic update
    setExpenses(prev => prev.filter(e => e.id !== id));

    // Delete from cloud first
    if (db && syncStatus === 'cloud') {
      try {
        await deleteDoc(doc(db, "expenses", id));
        console.log("Deleted from Firestore:", id);
      } catch (error) {
        console.error("Failed to delete from Firestore:", error);
        // Still try local
        try {
          await dbService.deleteExpense(id);
        } catch (localErr) {
          console.error("Local delete also failed:", localErr);
        }
      }
    } else {
      // Delete from local cache
      try {
        await dbService.deleteExpense(id);
        console.log("Deleted from IndexedDB:", id);
      } catch (err) {
        console.error("Failed to delete from IndexedDB:", err);
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
