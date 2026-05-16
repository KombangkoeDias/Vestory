import { Transaction } from '../types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  // May 16
  { id: '1', merchant: 'Grab Food', amount: 18.50, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-16' },
  { id: '2', merchant: 'MRT', amount: 2.10, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-16' },
  // May 15
  { id: '3', merchant: 'NTUC FairPrice', amount: 67.30, currency: 'SGD', category: 'groceries', type: 'purchase', date: '2026-05-15' },
  { id: '4', merchant: 'Kopitiam', amount: 4.80, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-15' },
  // May 14
  { id: '5', merchant: 'Netflix', amount: 15.98, currency: 'SGD', category: 'entertainment', type: 'purchase', date: '2026-05-14' },
  { id: '6', merchant: 'Grab', amount: 14.20, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-14' },
  // May 13
  { id: '7', merchant: 'Watsons', amount: 23.40, currency: 'SGD', category: 'health', type: 'purchase', date: '2026-05-13' },
  { id: '8', merchant: 'Koufu', amount: 5.50, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-13' },
  // May 12
  { id: '9', merchant: 'Shopee', amount: 45.00, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-05-12' },
  { id: '10', merchant: 'ComfortDelGro', amount: 18.20, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-12' },
  // May 11
  { id: '11', merchant: "McDonald's", amount: 12.80, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-11' },
  { id: '12', merchant: 'Cold Storage', amount: 34.20, currency: 'SGD', category: 'groceries', type: 'purchase', date: '2026-05-11' },
  // May 10
  { id: '13', merchant: 'SP Group', amount: 89.50, currency: 'SGD', category: 'utilities', type: 'purchase', date: '2026-05-10' },
  // May 9
  { id: '14', merchant: 'Starbucks', amount: 8.90, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-09' },
  { id: '15', merchant: 'Uniqlo', amount: 79.90, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-05-09' },
  // May 8
  { id: '16', merchant: 'Spotify', amount: 9.99, currency: 'SGD', category: 'entertainment', type: 'purchase', date: '2026-05-08' },
  { id: '17', merchant: 'MRT', amount: 3.20, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-08' },
  // May 7
  { id: '18', merchant: 'Guardian', amount: 31.00, currency: 'SGD', category: 'health', type: 'purchase', date: '2026-05-07' },
  { id: '19', merchant: 'Ya Kun Kaya Toast', amount: 6.80, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-07' },
  // May 6
  { id: '20', merchant: 'Lazada', amount: 58.00, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-05-06' },
  { id: '21', merchant: 'Grab', amount: 11.50, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-06' },
  // May 5
  { id: '22', merchant: 'Sheng Siong', amount: 42.60, currency: 'SGD', category: 'groceries', type: 'purchase', date: '2026-05-05' },
  { id: '23', merchant: 'Singtel', amount: 34.00, currency: 'SGD', category: 'utilities', type: 'purchase', date: '2026-05-05' },
  // May 3
  { id: '24', merchant: 'Agoda', amount: 320.00, currency: 'SGD', category: 'travel', type: 'purchase', date: '2026-05-03' },
  // May 2
  { id: '25', merchant: 'Toast Box', amount: 7.20, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-02' },
  { id: '26', merchant: 'IKEA', amount: 145.00, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-05-02' },
  // May 1
  { id: '27', merchant: 'Grab Food', amount: 22.80, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-05-01' },
  { id: '28', merchant: 'MRT', amount: 1.80, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-05-01' },
];

// April mock data for month comparison
export const MOCK_TRANSACTIONS_APRIL: Transaction[] = [
  { id: 'a1', merchant: 'Grab Food', amount: 22.50, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-04-28' },
  { id: 'a2', merchant: 'NTUC FairPrice', amount: 58.90, currency: 'SGD', category: 'groceries', type: 'purchase', date: '2026-04-27' },
  { id: 'a3', merchant: 'Netflix', amount: 15.98, currency: 'SGD', category: 'entertainment', type: 'purchase', date: '2026-04-26' },
  { id: 'a4', merchant: 'Grab', amount: 19.80, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-04-25' },
  { id: 'a5', merchant: 'SP Group', amount: 91.20, currency: 'SGD', category: 'utilities', type: 'purchase', date: '2026-04-24' },
  { id: 'a6', merchant: 'Shopee', amount: 67.00, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-04-22' },
  { id: 'a7', merchant: 'Koufu', amount: 4.50, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-04-20' },
  { id: 'a8', merchant: 'Watsons', amount: 28.90, currency: 'SGD', category: 'health', type: 'purchase', date: '2026-04-18' },
  { id: 'a9', merchant: 'Cold Storage', amount: 45.30, currency: 'SGD', category: 'groceries', type: 'purchase', date: '2026-04-15' },
  { id: 'a10', merchant: 'MRT', amount: 2.80, currency: 'SGD', category: 'transport', type: 'purchase', date: '2026-04-12' },
  { id: 'a11', merchant: 'Starbucks', amount: 9.90, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-04-10' },
  { id: 'a12', merchant: 'Singtel', amount: 34.00, currency: 'SGD', category: 'utilities', type: 'purchase', date: '2026-04-08' },
  { id: 'a13', merchant: 'Uniqlo', amount: 59.90, currency: 'SGD', category: 'shopping', type: 'purchase', date: '2026-04-05' },
  { id: 'a14', merchant: 'Grab Food', amount: 16.80, currency: 'SGD', category: 'food', type: 'purchase', date: '2026-04-03' },
  { id: 'a15', merchant: 'Guardian', amount: 18.50, currency: 'SGD', category: 'health', type: 'purchase', date: '2026-04-01' },
];
