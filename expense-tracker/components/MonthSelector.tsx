import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { getMonthLabel, addMonths, getTodayYearMonth } from '../utils/transactions';

interface Props {
  yearMonth: string;
  onChange: (yearMonth: string) => void;
}

export default function MonthSelector({ yearMonth, onChange }: Props) {
  const isCurrentMonth = yearMonth === getTodayYearMonth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange(addMonths(yearMonth, -1))} style={styles.arrow}>
        <Ionicons name="chevron-back" size={20} color={Colors.dark.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.label}>{getMonthLabel(yearMonth)}</Text>
      <TouchableOpacity
        onPress={() => !isCurrentMonth && onChange(addMonths(yearMonth, 1))}
        style={styles.arrow}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isCurrentMonth ? Colors.dark.textMuted : Colors.dark.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  arrow: {
    padding: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    minWidth: 140,
    textAlign: 'center',
  },
});
