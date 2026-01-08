
import React, { useState, useRef } from 'react';
import { Category, Expense } from '../types';
import { CATEGORIES, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, THB_TO_NZD_RATE } from '../constants';
import { parseReceiptImage, isGeminiAvailable } from '../geminiService';

interface AddExpenseModalProps {
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onAdd, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: Category.OTHERS,
    date: new Date().toISOString().split('T')[0],
    currency: 'THB'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateConverted = () => {
    const amt = parseFloat(formData.amount) || 0;
    return formData.currency === 'THB' ? amt / THB_TO_NZD_RATE : amt;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const originalAmt = parseFloat(formData.amount);
    if (isNaN(originalAmt) || !formData.description) return;
    
    onAdd({
      amount: calculateConverted(),
      currency: DEFAULT_CURRENCY,
      originalAmount: originalAmt,
      originalCurrency: formData.currency,
      description: formData.description,
      category: formData.category,
      date: formData.date
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isGeminiAvailable) {
      setScanError("Gemini API key is missing. AI scanning only works when you provide an API_KEY in your environment variables. Please use manual entry for now.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true);
    setScanError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const parsedData = await parseReceiptImage(base64String);
        setFormData({
          amount: parsedData.originalAmount.toString(),
          description: parsedData.description,
          category: (parsedData.category as Category) || Category.OTHERS,
          date: parsedData.date || new Date().toISOString().split('T')[0],
          currency: parsedData.originalCurrency?.toUpperCase().includes('THB') ? 'THB' : 'NZD'
        });
      } catch (error: any) {
        console.error("Scan error:", error);
        if (error.message === 'GEMINI_API_KEY_MISSING') {
           setScanError("Gemini API Key is missing. Manual entry required.");
        } else {
           setScanError("AI couldn't process this image. Try a clearer photo or enter details manually.");
        }
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Scan Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Smart Scan (AI)</label>
            
            {scanError ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4 animate-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-red-800 font-medium leading-relaxed">{scanError}</p>
                    <div className="mt-3 flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Try Clearer Photo
                      </button>
                      <button 
                        onClick={() => setScanError(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Enter Manually
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className={`w-full py-6 px-6 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center gap-2 group ${
                loading ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-50/30 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <span className="text-indigo-600 font-bold">Gemini is Thinking...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-900 font-bold">Scan Receipt or Screenshot</span>
                  <span className="text-slate-400 text-xs text-center px-4 leading-relaxed font-medium">Auto-detects merchant, amount, and converts currency</span>
                </>
              )}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Manual Form</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if(scanError) setScanError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                >
                  {SUPPORTED_CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                </select>
              </div>
            </div>

            {formData.amount && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-emerald-700 font-bold uppercase tracking-tight text-xs">Converted (NZD):</span>
                <span className="text-emerald-800 font-black text-lg">${calculateConverted().toFixed(2)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                placeholder="Where did the money go?"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-[2] px-4 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
