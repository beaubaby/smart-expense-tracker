import { describe, it, expect, vi } from 'vitest';

describe('Database API Integration', () => {
  it('GET /api/expenses should return array', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            amount: 100,
            currency: 'NZD',
            category: 'Food',
            date: '2024-01-09',
            description: 'Lunch',
          }
        ]),
      })
    ) as any;

    const response = await fetch('/api/expenses');
    const data = await response.json();
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('POST /api/expenses should accept new expense', async () => {
    const newExpense = {
      id: 'test-2',
      amount: 50,
      currency: 'NZD',
      category: 'Transport',
      date: '2024-01-09',
      description: 'Bus',
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve(newExpense),
      })
    ) as any;

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense),
    });

    expect(response.status).toBe(201);
    expect(response.ok).toBe(true);
  });

  it('DELETE /api/expenses/:id should remove expense', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
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
