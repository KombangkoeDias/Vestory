import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { useDatabase } from '../../context/DatabaseContext';
import MonthSelector from '../../components/MonthSelector';
import CategoryBar from '../../components/CategoryBar';
import SpendingChart from '../../components/SpendingChart';
import TransactionItem from '../../components/TransactionItem';
import {
  getTodayYearMonth,
  computeMonthSummary,
  filterByMonth,
  formatCurrency,
} from '../../utils/transactions';

export default function DashboardScreen() {
  const { transactions, isLoading } = useDatabase();
  const [yearMonth, setYearMonth] = useState(getTodayYearMonth());

  const summary = useMemo(
    () => computeMonthSummary(transactions, yearMonth),
    [transactions, yearMonth]
  );

  const recentTransactions = useMemo(
    () => filterByMonth(transactions, yearMonth).slice(0, 5),
    [transactions, yearMonth]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.dark.primary} size="large" />
      </SafeAreaView>
    );
  }

  const maxCategoryAmount = summary.byCategory[0]?.total ?? 1;
  const isCurrentMonth = yearMonth === getTodayYearMonth();

  const dailyAvg = useMemo(() => {
    const today = new Date().getDate();
    const daysElapsed = isCurrentMonth ? today : summary.dailyTotals.length;
    return daysElapsed > 0 ? summary.total / daysElapsed : 0;
  }, [summary, isCurrentMonth]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Pars</Text>
            <Text style={styles.subtitle}>Expense Tracker</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Month selector */}
        <MonthSelector yearMonth={yearMonth} onChange={setYearMonth} />

        {/* Hero spending card */}
        <LinearGradient
          colors={['#3D35C8', '#6C63FF', '#8B84FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Total Spent</Text>
          <Text style={styles.heroAmount}>{formatCurrency(summary.total)}</Text>
          <Text style={styles.heroCount}>{summary.transactionCount} transactions</Text>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(dailyAvg)}</Text>
              <Text style={styles.statLabel}>Daily avg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{summary.byCategory.length}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {summary.byCategory[0]
                  ? CATEGORY_LABEL_SHORT[summary.byCategory[0].category]
                  : '—'}
              </Text>
              <Text style={styles.statLabel}>Top category</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Daily spending chart */}
        {summary.dailyTotals.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Spending</Text>
            <SpendingChart
              dailyTotals={summary.dailyTotals}
              highlightToday={isCurrentMonth}
            />
          </View>
        )}

        {/* Category breakdown */}
        {summary.byCategory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>By Category</Text>
            {summary.byCategory.map(cat => (
              <CategoryBar key={cat.category} summary={cat} maxAmount={maxCategoryAmount} />
            ))}
          </View>
        )}

        {/* Recent transactions */}
        {recentTransactions.length > 0 && (
          <View style={[styles.card, styles.cardNoPad]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Recent</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.map((t, idx) => (
              <React.Fragment key={t.id}>
                <TransactionItem transaction={t} showDate />
                {idx < recentTransactions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Empty state */}
        {summary.transactionCount === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No transactions</Text>
            <Text style={styles.emptyText}>
              Connect your Gmail to automatically import bank notifications.
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CATEGORY_LABEL_SHORT: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  groceries: 'Groceries',
  shopping: 'Shopping',
  entertainment: 'Entertain.',
  health: 'Health',
  utilities: 'Utilities',
  travel: 'Travel',
  others: 'Others',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
  },
  cardNoPad: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    marginBottom: 14,
    paddingHorizontal: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.dark.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.surfaceBorder,
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPad: {
    height: 32,
  },
});
