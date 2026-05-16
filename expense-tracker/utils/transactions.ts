import { Transaction, CategoryId, CategorySummary, MonthSummary } from '../types';

export function formatCurrency(amount: number, currency: string = 'SGD'): string {
  const symbols: Record<string, string> = {
    SGD: 'S$',
    USD: 'US$',
    THB: '฿',
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
}

export function getYearMonth(dateStr: string): string {
  return dateStr.substring(0, 7);
}

export function filterByMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter(t => getYearMonth(t.date) === yearMonth);
}

export function computeMonthSummary(transactions: Transaction[], yearMonth: string): MonthSummary {
  const filtered = filterByMonth(transactions, yearMonth);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap: Record<CategoryId, number> = {} as Record<CategoryId, number>;
  filtered.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
  });

  const byCategory: CategorySummary[] = Object.entries(categoryMap)
    .map(([cat, catTotal]) => ({
      category: cat as CategoryId,
      total: catTotal,
      count: filtered.filter(t => t.category === cat).length,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // daily totals for the month
  const dailyMap: Record<number, number> = {};
  filtered.forEach(t => {
    const day = parseInt(t.date.split('-')[2]);
    dailyMap[day] = (dailyMap[day] ?? 0) + t.amount;
  });
  const daysInMonth = new Date(parseInt(yearMonth.split('-')[0]), parseInt(yearMonth.split('-')[1]), 0).getDate();
  const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    total: dailyMap[i + 1] ?? 0,
  }));

  return {
    month: yearMonth,
    total,
    currency: 'SGD',
    byCategory,
    dailyTotals,
    transactionCount: filtered.length,
  };
}

export function groupByDate(transactions: Transaction[]): { date: string; items: Transaction[] }[] {
  const map: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

export function getTodayYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
