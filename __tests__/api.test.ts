import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API Routes', () => {
  beforeEach(() => {
    // Mock MongoDB connection
    process.env.VITE_MONGODB_URI = 'mongodb://test';
  });

  it('GET /api/expenses should return expense list', async () => {
    const mockExpenses = [
      {
        id: '1',
        amount: 100,
        currency: 'NZD',
        originalAmount: 100,
        originalCurrency: 'NZD',
        category: 'Food',
        date: '2024-01-09',
        description: 'Lunch',
        createdAt: Date.now(),
      },
    ];

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockExpenses),
      })
    ) as any;

    const response = await fetch('/api/expenses');
    expect(response.ok).toBe(true);
  });

  it('POST /api/expenses should create new expense', async () => {
    const newExpense = {
      id: 'test-2',
      amount: 50,
      currency: 'NZD',
      originalAmount: 50,
      originalCurrency: 'NZD',
      category: 'Transport',
      date: '2024-01-09',
      description: 'Bus ticket',
      createdAt: Date.now(),
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newExpense),
      })
    ) as any;

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.id).toBe('test-2');
  });

  it('DELETE /api/expenses/:id should remove expense', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as any;

    const response = await fetch('/api/expenses/test-2', {
      method: 'DELETE',
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
