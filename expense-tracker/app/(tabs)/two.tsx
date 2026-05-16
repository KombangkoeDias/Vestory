import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { MOCK_TRANSACTIONS, MOCK_TRANSACTIONS_APRIL } from '../../constants/MockData';
import { CATEGORY_LIST } from '../../constants/Categories';
import { CategoryId } from '../../types';
import TransactionItem from '../../components/TransactionItem';
import {
  groupByDate,
  formatDate,
  formatCurrency,
  getTodayYearMonth,
  filterByMonth,
  addMonths,
  getMonthLabel,
} from '../../utils/transactions';

const ALL_TRANSACTIONS = [...MOCK_TRANSACTIONS, ...MOCK_TRANSACTIONS_APRIL];

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [yearMonth, setYearMonth] = useState(getTodayYearMonth());

  const filtered = useMemo(() => {
    let txns = filterByMonth(ALL_TRANSACTIONS, yearMonth);
    if (activeCategory !== 'all') {
      txns = txns.filter(t => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(t => t.merchant.toLowerCase().includes(q));
    }
    return txns;
  }, [search, activeCategory, yearMonth]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const sections = grouped.map(g => ({
    title: g.date,
    data: g.items,
    dayTotal: g.items.reduce((s, t) => s + t.amount, 0),
  }));

  const monthTotal = filtered.reduce((s, t) => s + t.amount, 0);
  const isCurrentMonth = yearMonth === getTodayYearMonth();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setYearMonth(addMonths(yearMonth, -1))} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{getMonthLabel(yearMonth)}</Text>
          <TouchableOpacity
            onPress={() => !isCurrentMonth && setYearMonth(addMonths(yearMonth, 1))}
            style={styles.navBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isCurrentMonth ? Colors.dark.textMuted : Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.dark.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant..."
          placeholderTextColor={Colors.dark.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <TouchableOpacity
          style={[styles.chip, activeCategory === 'all' && styles.chipActive]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.chipText, activeCategory === 'all' && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORY_LIST.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chip,
              activeCategory === cat.id && styles.chipActive,
              activeCategory === cat.id && { backgroundColor: cat.color + '33', borderColor: cat.color },
            ]}
            onPress={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={12}
              color={activeCategory === cat.id ? cat.color : Colors.dark.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.chipText,
                activeCategory === cat.id && { ...styles.chipTextActive, color: cat.color },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction list */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{formatDate(section.title)}</Text>
              <Text style={styles.sectionTotal}>{formatCurrency(section.dayTotal)}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <>
              <TransactionItem transaction={item} />
              {index < section.data.length - 1 && <View style={styles.divider} />}
            </>
          )}
          renderSectionFooter={() => <View style={styles.sectionFooter} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={40} color={Colors.dark.textMuted} />
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  monthTotal: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.textPrimary,
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    backgroundColor: Colors.dark.surface,
  },
  chipActive: {
    backgroundColor: Colors.dark.primary + '22',
    borderColor: Colors.dark.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark.bg,
  },
  sectionDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  sectionTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.surfaceBorder,
    marginHorizontal: 16,
  },
  sectionFooter: {
    height: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
});
