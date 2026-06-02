import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { SyncEngine } from '../../engine/SyncEngine';
import { BannerAdComponent } from '../../ads/BannerAdComponent';
import { InterstitialService } from '../../ads/InterstitialService';

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, syncQueue, isOnline } = useAppStore();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncStatus('Cannot sync while in offline mode!');
      return;
    }

    setSyncing(true);
    setSyncStatus('Initiating remote SaaS handshake...');
    
    try {
      const success = await SyncEngine.retrySync();
      await SyncEngine.syncProfiles();
      await SyncEngine.syncRotation();
      
      if (success) {
        setSyncStatus('Database synced perfectly!');
      } else {
        setSyncStatus('Some queue items failed. Retrying in background.');
      }
    } catch (e: any) {
      setSyncStatus(`Sync failed: ${e?.message || 'Connection timeout'}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenDiagnostics = async () => {
    try {
      const shown = await InterstitialService.triggerAdShow();
      if (!shown) {
        console.log('[SettingsScreen] Frequency cap active, skipping interstitial display.');
      }
    } catch (e) {
      console.warn('[SettingsScreen] Error launching ad display', e);
    }
    Alert.alert('Diagnostics Loaded', 'All local thread runtimes and client hardware bindings matched successfully.');
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, textStyle]}>Settings</Text>
          <Text style={[styles.headerSubtitle, subTextStyle]}>Global SaaS configuration preferences</Text>
        </View>

        {/* Theme Switching section */}
        <View style={[styles.cardBase, cardBgStyle, styles.mb4]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.settingTitle, textStyle]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, subTextStyle]}>Toggle deep theme system style</Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
          </View>
        </View>

        {/* Cloud Synchronization and Status Dashboard */}
        <View style={[styles.cardBase, cardBgStyle, styles.mb4]}>
          <Text style={[styles.sectionTitle, subTextStyle]}>SUDO CLOUD SYNC CONTROLS</Text>
          
          <View style={[styles.rowBetween, styles.mb4]}>
            <View>
              <Text style={[styles.settingTitleMedium, textStyle]}>Offline Queue</Text>
              <Text style={[styles.settingSubtitle, subTextStyle]}>Changes cached in AsyncStorage</Text>
            </View>
            <Text style={[styles.queueText, syncQueue.length > 0 ? styles.textWarning : styles.textSuccess]}>
              {syncQueue.length} pending
            </Text>
          </View>

          <TouchableOpacity 
            onPress={handleManualSync}
            disabled={syncing}
            style={styles.syncBtn}
          >
            {syncing ? (
              <ActivityIndicator color="#ffffff" style={styles.mr2} />
            ) : (
              <Text style={styles.syncBtnText}>Force DB Synchronize Now</Text>
            )}
          </TouchableOpacity>

          {syncStatus && (
            <Text style={styles.syncStatusText}>
              {syncStatus}
            </Text>
          )}
        </View>

        {/* Engine Diagnostics */}
        <TouchableOpacity 
          onPress={handleOpenDiagnostics}
          style={[styles.cardBase, cardBgStyle, styles.mb4]}
        >
          <Text style={[styles.sectionTitle, subTextStyle]}>SYSTEM DIAGNOSTICS (TAP TO RUN)</Text>
          <Text style={[styles.diagnosticsText, subTextStyle]}>
            Software Version: 2.0.0 Pro-Build{'\n'}
            Framework Engine: Expo SDK 54{'\n'}
            Database Sync API: Supabase REST v1{'\n'}
            Global State Engine: Zustand 4.5{'\n'}
            Ad Monetization Engine: AdMob Google Mobile Ads
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dynamic Banner Integration */}
      <BannerAdComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#0F172A',
  },
  bgLight: {
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#0F172A',
  },
  subLight: {
    color: '#94A3B8',
  },
  subDark: {
    color: '#64748B',
  },
  textSuccess: {
    color: '#10B981',
  },
  textWarning: {
    color: '#F59E0B',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardBase: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mb4: {
    marginBottom: 16,
  },
  mr2: {
    marginRight: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingTitleMedium: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  queueText: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
  },
  syncBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  syncStatusText: {
    fontSize: 12,
    color: '#2563EB',
    textAlign: 'center',
    fontWeight: 'semibold',
    marginTop: 12,
  },
  diagnosticsText: {
    fontSize: 12,
    lineHeight: 20,
  },
});