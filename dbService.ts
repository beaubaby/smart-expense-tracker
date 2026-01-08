
import { Expense } from './types';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const DB_NAME = 'SmartExpenseTrackerDB';
const STORE_NAME = 'expenses';
const DB_VERSION = 1;

export class DBService {
  private db: IDBDatabase | null = null;
  private useFirestore = !!db;

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
      if (this.useFirestore) {
        // Load from Firestore first
        const q = query(collection(db!, 'expenses'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const expenses = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as Expense));
        
        // Sync to IndexedDB
        if (this.db) {
          const transaction = this.db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.clear();
          expenses.forEach((expense) => store.add(expense));
        }
        return expenses;
      }
    } catch (error) {
      console.error('Failed to fetch from Firestore, using IndexedDB:', error);
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
      if (this.useFirestore) {
        // Save to Firestore
        await addDoc(collection(db!, 'expenses'), {
          ...expense,
          timestamp: new Date(),
        });
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
      if (this.useFirestore) {
        // Delete from Firestore
        await deleteDoc(doc(db!, 'expenses', id));
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
