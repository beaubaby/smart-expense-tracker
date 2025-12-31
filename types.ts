
export enum Category {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  OTHERS = 'Others'
}

export interface Expense {
  id: string;
  amount: number; // Converted amount in NZD
  currency: string; // Target currency (NZD)
  originalAmount: number;
  originalCurrency: string;
  category: Category;
  date: string;
  description: string;
  createdAt: number;
}

export interface SummaryData {
  total: number;
  byCategory: { name: Category; value: number }[];
  history: { date: string; amount: number }[];
}
