export type Currency = 'SGD' | 'USD' | 'THB';

export type CategoryId =
  | 'food'
  | 'transport'
  | 'groceries'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'utilities'
  | 'travel'
  | 'others';

export type TransactionType = 'purchase' | 'transfer' | 'withdrawal' | 'credit';

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: Currency;
  category: CategoryId;
  type: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  emailId?: string;
  rawSubject?: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

export interface CategorySummary {
  category: CategoryId;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  total: number;
  currency: Currency;
  byCategory: CategorySummary[];
  dailyTotals: { day: number; total: number }[];
  transactionCount: number;
}
