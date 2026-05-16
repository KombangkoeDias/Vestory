import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { useDatabase } from '../../context/DatabaseContext';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingRow({ icon, iconColor, label, value, onPress, showArrow = true }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const SUPPORTED_BANKS = [
  { name: 'DBS / POSB', country: 'Singapore', logo: '🏦' },
  { name: 'UOB', country: 'Singapore', logo: '🏦' },
  { name: 'OCBC', country: 'Singapore', logo: '🏦' },
  { name: 'Maybank', country: 'Singapore', logo: '🏦' },
  { name: 'Krungthai Bank', country: 'Thailand', logo: '🏦' },
  { name: 'Bangkok Bank', country: 'Thailand', logo: '🏦' },
  { name: 'Kasikorn Bank', country: 'Thailand', logo: '🏦' },
];

export default function SettingsScreen() {
  const { wipeAllData } = useDatabase();

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: wipeAllData,
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Gmail connection card */}
        <LinearGradient
          colors={['#1A1A35', '#1A2540']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectCard}
        >
          <View style={styles.connectIcon}>
            <Ionicons name="mail" size={28} color={Colors.dark.primary} />
          </View>
          <Text style={styles.connectTitle}>Connect Gmail</Text>
          <Text style={styles.connectText}>
            Grant read-only access to scan bank notification emails. Your emails never leave your device.
          </Text>
          <TouchableOpacity style={styles.connectBtn}>
            <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.connectBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Privacy notice */}
        <View style={styles.privacyBanner}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.dark.success} />
          <Text style={styles.privacyText}>
            All parsing happens on your device. No email content is sent to any server.
          </Text>
        </View>

        {/* Sync settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync</Text>
          <View style={styles.card}>
            <SettingRow
              icon="refresh-circle"
              iconColor={Colors.dark.primary}
              label="Sync Emails"
              value="Not connected"
              showArrow={false}
            />
            <View style={styles.separator} />
            <SettingRow
              icon="calendar"
              iconColor={Colors.dark.transport}
              label="Sync Range"
              value="Last 3 months"
            />
          </View>
        </View>

        {/* Supported banks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Banks</Text>
          <View style={styles.card}>
            {SUPPORTED_BANKS.map((bank, idx) => (
              <React.Fragment key={bank.name}>
                <View style={styles.bankRow}>
                  <Text style={styles.bankLogo}>{bank.logo}</Text>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{bank.name}</Text>
                    <Text style={styles.bankCountry}>{bank.country}</Text>
                  </View>
                  <View style={styles.bankBadge}>
                    <Text style={styles.bankBadgeText}>Supported</Text>
                  </View>
                </View>
                {idx < SUPPORTED_BANKS.length - 1 && <View style={styles.separator} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow
              icon="cash"
              iconColor={Colors.dark.success}
              label="Default Currency"
              value="SGD"
            />
            <View style={styles.separator} />
            <SettingRow
              icon="notifications"
              iconColor={Colors.dark.warning}
              label="Spending Alerts"
              value="Off"
            />
            <View style={styles.separator} />
            <SettingRow
              icon="color-palette"
              iconColor={Colors.dark.entertainment}
              label="Appearance"
              value="Dark"
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <SettingRow
              icon="download"
              iconColor={Colors.dark.primary}
              label="Export to CSV"
            />
            <View style={styles.separator} />
            <SettingRow
              icon="trash"
              iconColor={Colors.dark.error}
              label="Clear All Data"
              showArrow={false}
              onPress={handleClearData}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow
              icon="information-circle"
              iconColor={Colors.dark.textMuted}
              label="Version"
              value="1.0.0"
              showArrow={false}
            />
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.textPrimary,
    letterSpacing: -0.5,
  },
  connectCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.primary + '44',
  },
  connectIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  connectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
  },
  connectText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 19,
    marginBottom: 20,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  connectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.dark.successBg,
    borderRadius: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.success,
    lineHeight: 17,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.textPrimary,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.dark.surfaceBorder,
    marginLeft: 62,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bankLogo: {
    fontSize: 22,
    marginRight: 12,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  bankCountry: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  bankBadge: {
    backgroundColor: Colors.dark.successBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bankBadgeText: {
    fontSize: 11,
    color: Colors.dark.success,
    fontWeight: '600',
  },
  bottomPad: {
    height: 40,
  },
});
