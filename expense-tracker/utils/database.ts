import * as SQLite from 'expo-sqlite';
import { Transaction, CategoryId } from '../types';

const DB_NAME = 'vestory.db';

let db: SQLite.SQLiteDatabase | null = null;

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id          TEXT PRIMARY KEY,
      merchant    TEXT NOT NULL,
      amount      REAL NOT NULL,
      currency    TEXT NOT NULL DEFAULT 'SGD',
      category    TEXT NOT NULL DEFAULT 'others',
      type        TEXT NOT NULL DEFAULT 'purchase',
      date        TEXT NOT NULL,
      email_id    TEXT,
      raw_subject TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_email_id ON transactions(email_id)
      WHERE email_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS merchant_overrides (
      merchant_name TEXT PRIMARY KEY,
      category      TEXT NOT NULL
    );
  `);
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialised. Call initDatabase() first.');
  return db;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function insertTransaction(t: Transaction): Promise<void> {
  await getDb().runAsync(
    `INSERT OR IGNORE INTO transactions
       (id, merchant, amount, currency, category, type, date, email_id, raw_subject)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    t.id,
    t.merchant,
    t.amount,
    t.currency,
    t.category,
    t.type,
    t.date,
    t.emailId ?? null,
    t.rawSubject ?? null,
  );
}

export async function insertTransactions(txns: Transaction[]): Promise<void> {
  const database = getDb();
  await database.withTransactionAsync(async () => {
    for (const t of txns) {
      await database.runAsync(
        `INSERT OR IGNORE INTO transactions
           (id, merchant, amount, currency, category, type, date, email_id, raw_subject)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        t.id,
        t.merchant,
        t.amount,
        t.currency,
        t.category,
        t.type,
        t.date,
        t.emailId ?? null,
        t.rawSubject ?? null,
      );
    }
  });
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const rows = await getDb().getAllAsync<Transaction>(
    `SELECT id, merchant, amount, currency, category, type, date, email_id as emailId, raw_subject as rawSubject
     FROM transactions
     ORDER BY date DESC, created_at DESC`,
  );
  return rows;
}

export async function getTransactionsByMonth(yearMonth: string): Promise<Transaction[]> {
  const rows = await getDb().getAllAsync<Transaction>(
    `SELECT id, merchant, amount, currency, category, type, date, email_id as emailId, raw_subject as rawSubject
     FROM transactions
     WHERE date LIKE ?
     ORDER BY date DESC, created_at DESC`,
    `${yearMonth}%`,
  );
  return rows;
}

export async function updateTransactionCategory(id: string, category: CategoryId): Promise<void> {
  await getDb().runAsync(
    `UPDATE transactions SET category = ? WHERE id = ?`,
    category,
    id,
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  await getDb().runAsync(`DELETE FROM transactions WHERE id = ?`, id);
}

export async function getTransactionCount(): Promise<number> {
  const result = await getDb().getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM transactions`,
  );
  return result?.count ?? 0;
}

// Returns email IDs already stored — used to skip re-parsing duplicates
export async function getStoredEmailIds(): Promise<Set<string>> {
  const rows = await getDb().getAllAsync<{ email_id: string }>(
    `SELECT email_id FROM transactions WHERE email_id IS NOT NULL`,
  );
  return new Set(rows.map(r => r.email_id));
}

// ---------------------------------------------------------------------------
// Merchant overrides
// ---------------------------------------------------------------------------

export async function getMerchantOverrides(): Promise<Record<string, CategoryId>> {
  const rows = await getDb().getAllAsync<{ merchant_name: string; category: string }>(
    `SELECT merchant_name, category FROM merchant_overrides`,
  );
  const map: Record<string, CategoryId> = {};
  rows.forEach(r => {
    map[r.merchant_name] = r.category as CategoryId;
  });
  return map;
}

export async function setMerchantOverride(merchantName: string, category: CategoryId): Promise<void> {
  await getDb().runAsync(
    `INSERT OR REPLACE INTO merchant_overrides (merchant_name, category) VALUES (?, ?)`,
    merchantName.toLowerCase(),
    category,
  );
}

// ---------------------------------------------------------------------------
// Seed with mock data (dev only)
// ---------------------------------------------------------------------------

export async function seedWithMockData(transactions: Transaction[]): Promise<void> {
  const count = await getTransactionCount();
  if (count > 0) return; // Already seeded
  await insertTransactions(transactions);
}

// ---------------------------------------------------------------------------
// Wipe (used in Settings → Clear All Data)
// ---------------------------------------------------------------------------

export async function clearAllData(): Promise<void> {
  await getDb().execAsync(`
    DELETE FROM transactions;
    DELETE FROM merchant_overrides;
  `);
}
