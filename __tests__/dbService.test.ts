import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dbService } from '../dbService';
import { Expense, Category } from '../types';

// Mock IndexedDB
const mockIDBDatabase = {
  transaction: vi.fn(),
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
};

const mockIDBObjectStore = {
  add: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

describe('DBService', () => {
  let testExpense: Expense;

  beforeEach(async () => {
    // Mock IndexedDB globally
    const mockStore = {
      ...mockIDBObjectStore,
      add: vi.fn((data) => ({
        onsuccess: null,
        onerror: null,
      })),
      getAll: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
        result: [],
      })),
      delete: vi.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
    };

    const mockTransaction = {
      objectStore: vi.fn(() => mockStore),
    };

    const mockDB = {
      transaction: vi.fn(() => mockTransaction),
      objectStoreNames: {
        contains: vi.fn(() => false),
      },
    };

    global.indexedDB = {
      open: vi.fn((name, version) => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDB,
      })),
    } as any;

    // Initialize test expense
    testExpense = {
      id: 'test-1',
      amount: 100,
      currency: 'NZD',
      originalAmount: 100,
      originalCurrency: 'NZD',
      category: Category.FOOD,
      date: '2024-01-09',
      description: 'Test expense',
      createdAt: Date.now(),
    };
  });

  afterEach(async () => {
    // Clean up test data
    const expenses = await dbService.getAllExpenses();
    for (const expense of expenses) {
      await dbService.deleteExpense(expense.id);
    }
  });

  it('should initialize database', async () => {
    expect(dbService).toBeDefined();
  });

  it('should add an expense', async () => {
    await dbService.addExpense(testExpense);
    const expenses = await dbService.getAllExpenses();
    expect(expenses.length).toBeGreaterThan(0);
    expect(expenses.some(e => e.id === 'test-1')).toBe(true);
  });

  it('should get all expenses', async () => {
    await dbService.addExpense(testExpense);
    const expenses = await dbService.getAllExpenses();
    expect(Array.isArray(expenses)).toBe(true);
  });

  it('should delete an expense', async () => {
    await dbService.addExpense(testExpense);
    let expenses = await dbService.getAllExpenses();
    expect(expenses.length).toBeGreaterThan(0);

    await dbService.deleteExpense('test-1');
    expenses = await dbService.getAllExpenses();
    expect(expenses.some(e => e.id === 'test-1')).toBe(false);
  });

  it('should handle MongoDB API calls', async () => {
    // Mock fetch for MongoDB API
    global.fetch = vi.fn();
    
    await dbService.addExpense(testExpense);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/expenses',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});
