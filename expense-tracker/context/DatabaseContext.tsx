import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '../types';
import {
  initDatabase,
  getAllTransactions,
  updateTransactionCategory,
  deleteTransaction,
  seedWithMockData,
  clearAllData,
  insertTransaction,
} from '../utils/database';
import { MOCK_TRANSACTIONS, MOCK_TRANSACTIONS_APRIL } from '../constants/MockData';
import { CategoryId } from '../types';

interface DatabaseContextValue {
  transactions: Transaction[];
  isLoading: boolean;
  refreshTransactions: () => Promise<void>;
  updateCategory: (id: string, category: CategoryId) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addTransaction: (t: Transaction) => Promise<void>;
  wipeAllData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await seedWithMockData([...MOCK_TRANSACTIONS, ...MOCK_TRANSACTIONS_APRIL]);
      await loadTransactions();
      setIsLoading(false);
    })();
  }, []);

  async function loadTransactions() {
    const txns = await getAllTransactions();
    setTransactions(txns);
  }

  async function refreshTransactions() {
    await loadTransactions();
  }

  async function updateCategory(id: string, category: CategoryId) {
    await updateTransactionCategory(id, category);
    await loadTransactions();
  }

  async function removeTransaction(id: string) {
    await deleteTransaction(id);
    await loadTransactions();
  }

  async function addTransaction(t: Transaction) {
    await insertTransaction(t);
    await loadTransactions();
  }

  async function wipeAllData() {
    await clearAllData();
    await loadTransactions();
  }

  return (
    <DatabaseContext.Provider
      value={{
        transactions,
        isLoading,
        refreshTransactions,
        updateCategory,
        removeTransaction,
        addTransaction,
        wipeAllData,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}
