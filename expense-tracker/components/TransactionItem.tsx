import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants/Categories';
import Colors from '../constants/Colors';
import { formatCurrency, formatDateShort } from '../utils/transactions';

interface Props {
  transaction: Transaction;
  showDate?: boolean;
  onPress?: () => void;
}

export default function TransactionItem({ transaction, showDate = false, onPress }: Props) {
  const category = CATEGORIES[transaction.category];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: category.color + '22' }]}>
        <Ionicons name={category.icon as any} size={20} color={category.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchant}</Text>
        <Text style={styles.category}>{category.label}{showDate ? `  ·  ${formatDateShort(transaction.date)}` : ''}</Text>
      </View>
      <Text style={styles.amount}>
        -{formatCurrency(transaction.amount, transaction.currency)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
});
