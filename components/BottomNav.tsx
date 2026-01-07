
import React from 'react';

type ViewType = 'overview' | 'transactions' | 'monthly';

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onAdd: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onAdd }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="max-w-lg mx-auto bg-slate-900/90 backdrop-blur-xl rounded-3xl p-2 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-white/10">
        
        {/* Overview Tab */}
        <button 
          onClick={() => onNavigate('overview')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 ${activeView === 'overview' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === 'overview' ? 2.5 : 2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Stats</span>
          {activeView === 'overview' && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5"></div>}
        </button>

        {/* Transactions Tab */}
        <button 
          onClick={() => onNavigate('transactions')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 ${activeView === 'transactions' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === 'transactions' ? 2.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
          {activeView === 'transactions' && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5"></div>}
        </button>

        {/* Center Add Button */}
        <div className="px-2">
          <button 
            onClick={onAdd}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 active:scale-90 transition-all hover:bg-indigo-500"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Monthly Tab */}
        <button 
          onClick={() => onNavigate('monthly')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 ${activeView === 'monthly' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeView === 'monthly' ? 2.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Monthly</span>
          {activeView === 'monthly' && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5"></div>}
        </button>

        {/* More/Settings (Placeholder) */}
        <button 
          className="flex-1 flex flex-col items-center gap-1 py-2 text-slate-500 opacity-50 cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Setup</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
