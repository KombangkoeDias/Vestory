import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { syncEmails, SyncProgress } from '../../utils/emailSync';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  destructive?: boolean;
}

function SettingRow({ icon, iconColor, label, value, onPress, showArrow = true, destructive }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, destructive && { color: Colors.dark.error }]}>{label}</Text>
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
  { name: 'DBS / POSB', country: 'Singapore' },
  { name: 'UOB', country: 'Singapore' },
  { name: 'OCBC', country: 'Singapore' },
  { name: 'Maybank', country: 'Singapore' },
  { name: 'Citibank', country: 'Singapore' },
  { name: 'Krungthai Bank (KTB)', country: 'Thailand' },
  { name: 'Bangkok Bank', country: 'Thailand' },
  { name: 'Kasikorn Bank', country: 'Thailand' },
];

export default function SettingsScreen() {
  const { wipeAllData } = useDatabase();
  const { isAuthenticated, isAuthLoading, userEmail, userName, signIn, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Everything', style: 'destructive', onPress: wipeAllData },
      ],
    );
  }

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'You will need to sign in again to sync emails.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ],
    );
  }

  async function handleSync() {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncMessage('Starting sync...');
    try {
      const result = await syncEmails((progress: SyncProgress) => {
        setSyncMessage(progress.message);
      });
      setSyncMessage(`Done — ${result.inserted} new transactions added.`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message ?? 'Something went wrong.');
      setSyncMessage(null);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Gmail connection */}
        {isAuthenticated ? (
          <View style={styles.connectedCard}>
            <View style={styles.connectedRow}>
              <View style={styles.connectedIcon}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.dark.success} />
              </View>
              <View style={styles.connectedInfo}>
                <Text style={styles.connectedName}>{userName ?? 'Google Account'}</Text>
                <Text style={styles.connectedEmail}>{userEmail}</Text>
              </View>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
                <Text style={styles.signOutText}>Sign out</Text>
              </TouchableOpacity>
            </View>

            {/* Sync button */}
            <TouchableOpacity
              style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="sync" size={16} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.syncBtnText}>
                {isSyncing ? 'Syncing...' : 'Sync Emails Now'}
              </Text>
            </TouchableOpacity>

            {syncMessage && (
              <Text style={styles.syncMessage}>{syncMessage}</Text>
            )}
          </View>
        ) : (
          <>
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
                Grant read-only access so Vestory can scan bank notification emails. Your emails never leave your device.
              </Text>
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={signIn}
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.connectBtnText}>Sign in with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.privacyBanner}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.dark.success} />
              <Text style={styles.privacyText}>
                All parsing happens on your device. No email content is sent to any server.
              </Text>
            </View>
          </>
        )}

        {/* Supported banks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supported Banks</Text>
          <View style={styles.card}>
            {SUPPORTED_BANKS.map((bank, idx) => (
              <React.Fragment key={bank.name}>
                <View style={styles.bankRow}>
                  <Ionicons name="business" size={18} color={Colors.dark.primary} style={styles.bankIcon} />
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

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <SettingRow
              icon="trash"
              iconColor={Colors.dark.error}
              label="Clear All Data"
              showArrow={false}
              destructive
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
  safe: { flex: 1, backgroundColor: Colors.dark.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },

  connectedCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 16,
  },
  connectedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  connectedIcon: { marginRight: 12 },
  connectedInfo: { flex: 1 },
  connectedName: { fontSize: 15, fontWeight: '700', color: Colors.dark.textPrimary },
  connectedEmail: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 2 },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.dark.surfaceElevated },
  signOutText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '600' },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  syncBtnDisabled: { opacity: 0.6 },
  syncBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  syncMessage: { fontSize: 12, color: Colors.dark.textSecondary, textAlign: 'center', marginTop: 10 },

  connectCard: {
    marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: Colors.dark.primary + '44',
  },
  connectIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Colors.dark.primary + '22',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  connectTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.textPrimary, marginBottom: 8 },
  connectText: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 19, marginBottom: 20 },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.dark.primary, borderRadius: 12, paddingVertical: 13,
  },
  connectBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  privacyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, padding: 12,
    backgroundColor: Colors.dark.successBg, borderRadius: 10,
  },
  privacyText: { flex: 1, fontSize: 12, color: Colors.dark.success, lineHeight: 17 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: Colors.dark.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4,
  },
  card: { backgroundColor: Colors.dark.surface, borderRadius: 16, overflow: 'hidden' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.dark.textPrimary, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: Colors.dark.textSecondary },

  separator: { height: 1, backgroundColor: Colors.dark.surfaceBorder, marginLeft: 62 },

  bankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  bankIcon: { marginRight: 12 },
  bankInfo: { flex: 1 },
  bankName: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  bankCountry: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 1 },
  bankBadge: { backgroundColor: Colors.dark.successBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  bankBadgeText: { fontSize: 11, color: Colors.dark.success, fontWeight: '600' },

  bottomPad: { height: 40 },
});
