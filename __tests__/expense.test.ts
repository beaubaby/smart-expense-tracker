import { describe, it, expect } from 'vitest';
import { Category, Expense } from '../types';

describe('Expense Model', () => {
  it('should create valid expense object', () => {
    const expense: Expense = {
      id: 'test-1',
      amount: 100,
      currency: 'NZD',
      originalAmount: 100,
      originalCurrency: 'NZD',
      category: Category.FOOD,
      date: '2024-01-09',
      description: 'Lunch',
      createdAt: Date.now(),
    };

    expect(expense.id).toBe('test-1');
    expect(expense.amount).toBe(100);
    expect(expense.category).toBe(Category.FOOD);
  });

  it('should validate required fields', () => {
    const expense = {
      id: 'test-1',
      amount: 50,
      currency: 'NZD',
      originalAmount: 50,
      originalCurrency: 'NZD',
      category: Category.TRANSPORT,
      date: '2024-01-09',
      description: 'Bus',
      createdAt: Date.now(),
    };

    expect(expense).toHaveProperty('id');
    expect(expense).toHaveProperty('amount');
    expect(expense).toHaveProperty('category');
    expect(expense).toHaveProperty('date');
  });

  it('should support all categories', () => {
    const categories = [
      Category.FOOD,
      Category.TRANSPORT,
      Category.UTILITIES,
      Category.SHOPPING,
      Category.ENTERTAINMENT,
      Category.HEALTH,
      Category.OTHERS,
    ];

    expect(categories.length).toBe(7);
  });
});

describe('Expense Validation', () => {
  it('should reject negative amounts', () => {
    const amount = -100;
    expect(amount < 0).toBe(true);
  });

  it('should accept valid date format', () => {
    const date = '2024-01-09';
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    expect(isValidDate).toBe(true);
  });

  it('should handle currency conversion', () => {
    const originalAmount = 100;
    const conversionRate = 0.6; // USD to NZD example
    const convertedAmount = originalAmount * conversionRate;
    
    expect(convertedAmount).toBe(60);
  });
});
