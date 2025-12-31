
import React, { useState, useRef, useEffect } from 'react';
import { Category, Expense } from '../types';
import { CATEGORIES, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '../constants';
import { parseReceiptImage, getConversionRate } from '../geminiService';

interface AddExpenseModalProps {
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onAdd, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: Category.OTHERS,
    date: new Date().toISOString().split('T')[0],
    currency: 'USD' // Default input currency
  });
  const [convertedPreview, setConvertedPreview] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRate = async () => {
      const amt = parseFloat(formData.amount);
      if (!isNaN(amt) && amt > 0) {
        setConverting(true);
        const rate = await getConversionRate(formData.currency, DEFAULT_CURRENCY);
        setConvertedPreview(amt * rate);
        setConverting(false);
      } else {
        setConvertedPreview(null);
      }
    };

    const debounce = setTimeout(fetchRate, 800);
    return () => clearTimeout(debounce);
  }, [formData.amount, formData.currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const originalAmt = parseFloat(formData.amount);
    if (isNaN(originalAmt) || !formData.description) return;
    
    onAdd({
      amount: convertedPreview || originalAmt,
      originalAmount: originalAmt,
      originalCurrency: formData.currency,
      currency: DEFAULT_CURRENCY,
      description: formData.description,
      category: formData.category,
      date: formData.date
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const parsedData = await parseReceiptImage(base64String);
        setFormData({
          amount: parsedData.originalAmount.toString(),
          description: parsedData.description,
          category: parsedData.category as Category,
          date: parsedData.date || new Date().toISOString().split('T')[0],
          currency: parsedData.originalCurrency
        });
        setConvertedPreview(parsedData.convertedAmount);
      } catch (error) {
        alert("Failed to parse image. Please enter manually.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">Smart Scan (AI Conversion)</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full py-4 px-6 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col items-center gap-2 group"
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                  <span className="text-indigo-600 font-medium">Gemini is analyzing & converting...</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-slate-600 font-medium">Scan Receipt or Chat Screenshot</span>
                  <span className="text-slate-400 text-xs text-center px-4">Detects original currency and converts to {DEFAULT_CURRENCY}</span>
                </>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium uppercase tracking-widest">Manual Entry</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  {SUPPORTED_CURRENCIES.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            {convertedPreview !== null && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                <span className="text-emerald-700 text-sm font-medium">Auto-conversion to {DEFAULT_CURRENCY}:</span>
                <span className="text-emerald-800 font-bold flex items-center gap-2">
                  {converting ? (
                    <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    `$${convertedPreview.toFixed(2)}`
                  )}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="What did you buy?"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
