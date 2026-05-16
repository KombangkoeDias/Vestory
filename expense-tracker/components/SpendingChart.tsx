import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  dailyTotals: { day: number; total: number }[];
  highlightToday?: boolean;
}

export default function SpendingChart({ dailyTotals, highlightToday }: Props) {
  const today = new Date().getDate();
  const max = Math.max(...dailyTotals.map(d => d.total), 1);

  // Show every 7th day label
  const showLabel = (day: number) => day === 1 || day % 7 === 0;

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {dailyTotals.map(({ day, total }) => {
          const heightPct = (total / max) * 100;
          const isToday = highlightToday && day === today;
          const hasSpend = total > 0;
          return (
            <View key={day} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPct, hasSpend ? 8 : 0)}%`,
                      backgroundColor: isToday
                        ? Colors.dark.primary
                        : hasSpend
                        ? Colors.dark.primaryLight + '99'
                        : Colors.dark.surfaceElevated,
                    },
                  ]}
                />
              </View>
              {showLabel(day) && (
                <Text style={styles.dayLabel}>{day}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 3,
  },
});
