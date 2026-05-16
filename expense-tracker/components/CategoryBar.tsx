import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategorySummary } from '../types';
import { CATEGORIES } from '../constants/Categories';
import Colors from '../constants/Colors';
import { formatCurrency } from '../utils/transactions';

interface Props {
  summary: CategorySummary;
  maxAmount: number;
}

export default function CategoryBar({ summary, maxAmount }: Props) {
  const category = CATEGORIES[summary.category];
  const barWidth = maxAmount > 0 ? (summary.total / maxAmount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: category.color }]} />
          <Ionicons name={category.icon as any} size={14} color={Colors.dark.textSecondary} style={styles.icon} />
          <Text style={styles.label}>{category.label}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>{formatCurrency(summary.total)}</Text>
          <Text style={styles.percentage}>{summary.percentage.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${barWidth}%` as any, backgroundColor: category.color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  icon: {
    marginRight: 5,
    color: Colors.dark.textSecondary,
  },
  label: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  percentage: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    minWidth: 38,
    textAlign: 'right',
  },
  barTrack: {
    height: 5,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
