
import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#f87171',
  [Category.TRANSPORT]: '#60a5fa',
  [Category.UTILITIES]: '#fbbf24',
  [Category.SHOPPING]: '#a78bfa',
  [Category.ENTERTAINMENT]: '#f472b6',
  [Category.HEALTH]: '#34d399',
  [Category.OTHERS]: '#94a3b8',
};

export const CATEGORIES = Object.values(Category);

export const DEFAULT_CURRENCY = 'NZD';

export const SUPPORTED_CURRENCIES = ['NZD', 'THB', 'USD'];
