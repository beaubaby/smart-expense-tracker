
import { Expense } from './types';

const DB_NAME = 'SmartExpenseTrackerDB';
const STORE_NAME = 'expenses';
const DB_VERSION = 1;
const MONGODB_URI = process.env.VITE_MONGODB_URI;

export class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async getAllExpenses(): Promise<Expense[]> {
    try {
      if (MONGODB_URI) {
        // Try to fetch from MongoDB via API
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const expenses = await response.json();
          // Sync to IndexedDB
          if (this.db) {
            const transaction = this.db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();
            expenses.forEach((expense: Expense) => store.add(expense));
          }
          return expenses;
        }
      }
    } catch (error) {
      console.error('Failed to fetch from MongoDB, using IndexedDB:', error);
    }

    // Fall back to IndexedDB
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('Database not initialized');
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addExpense(expense: Expense): Promise<void> {
    try {
      if (MONGODB_URI) {
        // Save to MongoDB via API
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense),
        });
        if (!response.ok) throw new Error('Failed to save to MongoDB');
      }
      // Always save to IndexedDB for offline access
      if (this.db) {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        return new Promise((resolve, reject) => {
          const request = store.add(expense);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      // Fall back to IndexedDB only
      if (this.db) {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        return new Promise((resolve, reject) => {
          const request = store.add(expense);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      if (MONGODB_URI) {
        // Delete from MongoDB via API
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete from MongoDB');
      }
      // Delete from IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        return new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      // Fall back to IndexedDB only
      if (this.db) {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        return new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  // Helper to migrate from localStorage if needed
  async migrateFromLocalStorage(): Promise<void> {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        const expenses: Expense[] = JSON.parse(saved);
        for (const expense of expenses) {
          await this.addExpense(expense);
        }
        localStorage.removeItem('expenses'); // Clean up after migration
      } catch (e) {
        console.error('Migration failed', e);
      }
    }
  }
}

export const dbService = new DBService();
