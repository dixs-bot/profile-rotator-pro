import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useProfileStore } from '../../store/profileStore';
import { useRotationStore } from '../../store/rotationStore';
import { useVpnStore } from '../../store/vpnStore';
import { ProfileEngine } from '../../engine/ProfileEngine';
import { VpnEngine } from '../../engine/VpnEngine';
import { BannerAdComponent } from '../../ads/BannerAdComponent';
import { AdMobStatsCard } from '../../components/AdMobStatsCard';

export default function DashboardScreen() {
  const { isDarkMode, isOnline, setOnlineStatus } = useAppStore();
  const { activeProfile, profiles, loading } = useProfileStore();
  const { timeLeft, settings } = useRotationStore();
  const { activeVpn, isConnected, isConnecting } = useVpnStore();

  const handleRefresh = async () => {
    await ProfileEngine.loadProfiles();
    await VpnEngine.loadVpnProfiles();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={['#2563EB']} />
        }
      >
        {/* Network & SaaS Header Status */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, textStyle]}>PROFILE ROTATOR PRO</Text>
            <Text style={[styles.headerSubtitle, subTextStyle]}>Premium Control Dashboard</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setOnlineStatus(!isOnline)} 
            style={[
              styles.statusBadge, 
              isOnline ? styles.badgeOnline : styles.badgeOffline
            ]}
          >
            <Text style={[styles.badgeText, isOnline ? styles.textSuccess : styles.textDanger]}>
              ● {isOnline ? 'CLOUD SYNC' : 'OFFLINE MODE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry Indicator Section */}
        <View style={[styles.cardBase, cardBgStyle, styles.mb6]}>
          <Text style={[styles.telemetryLabel, subTextStyle]}>ACTIVE TELEMETRY</Text>
          <View style={styles.telemetryRow}>
            <View>
              <Text style={[styles.profileName, textStyle]}>
                {activeProfile ? activeProfile.name : 'No Active Profile'}
              </Text>
              <Text style={[styles.profileDetails, subTextStyle]}>
                {activeProfile ? `OS: Android ${activeProfile.android_version} | Language: ${activeProfile.language}` : 'Activate a profile below'}
              </Text>
            </View>
            <View style={[styles.avatar, activeProfile ? styles.avatarActive : styles.avatarInactive]}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </View>

          {activeProfile && (
            <View style={[styles.uaSection, isDarkMode ? styles.borderDark : styles.borderLight]}>
              <Text style={[styles.uaText, subTextStyle]} numberOfLines={2}>
                UA: {activeProfile.user_agent}
              </Text>
            </View>
          )}
        </View>

        {/* Rotation Status Visualizer */}
        <View style={styles.row}>
          <View style={[styles.cardBase, cardBgStyle, styles.flex1, styles.mr2]}>
            <Text style={[styles.cardLabel, subTextStyle]}>ROTATOR ENGINE</Text>
            <Text style={[styles.engineStatus, settings.rotation_enabled ? styles.textSuccess : styles.textDanger]}>
              {settings.rotation_enabled ? 'RUNNING' : 'STOPPED'}
            </Text>
            <Text style={[styles.timeText, textStyle]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={[styles.smallLabel, subTextStyle]}>Next state rotation cycle</Text>
          </View>

          <View style={[styles.cardBase, cardBgStyle, styles.flex1, styles.ml2]}>
            <Text style={[styles.cardLabel, subTextStyle]}>VPN ENCRYPTOR</Text>
            <Text style={[styles.engineStatus, isConnected ? styles.textSuccess : isConnecting ? styles.textWarning : styles.textDanger]}>
              {isConnecting ? 'HANDSHAKE' : isConnected ? 'PROTECTED' : 'DISCONNECTED'}
            </Text>
            <Text style={[styles.timeText, textStyle]}>
              {activeVpn ? activeVpn.country : 'NONE'}
            </Text>
            <Text style={[styles.smallLabel, subTextStyle]} numberOfLines={1}>
              {activeVpn ? `${activeVpn.server_name}` : 'No server active'}
            </Text>
          </View>
        </View>

        {/* AdMob Statistics Card */}
        <View style={styles.mb6}>
          <AdMobStatsCard />
        </View>

        {/* Summary Analytics Cards */}
        <View style={styles.row}>
          <View style={[styles.cardBase, cardBgStyle, styles.flex1, styles.mr2, styles.centerAlign]}>
            <Text style={[styles.analyticsLabel, subTextStyle]}>TOTAL PROFILES</Text>
            <Text style={[styles.analyticsValue, textStyle]}>{profiles.length}</Text>
          </View>
          <View style={[styles.cardBase, cardBgStyle, styles.flex1, styles.ml2, styles.centerAlign]}>
            <Text style={[styles.analyticsLabel, subTextStyle]}>ROTATION RATE</Text>
            <Text style={[styles.analyticsValue, textStyle]}>{settings.rotation_interval}s</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Dynamic Banner Integration */}
      <BannerAdComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
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
  textDanger: {
    color: '#EF4444',
  },
  textWarning: {
    color: '#F59E0B',
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
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  mb6: {
    marginBottom: 24,
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: 'rgba(37, 99, 230, 0.1)',
  },
  avatarInactive: {
    backgroundColor: '#F1F5F9',
  },
  avatarText: {
    fontSize: 20,
  },
  uaSection: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  borderDark: {
    borderTopColor: '#334155',
  },
  borderLight: {
    borderTopColor: '#F1F5F9',
  },
  uaText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  flex1: {
    flex: 1,
  },
  mr2: {
    marginRight: 8,
  },
  ml2: {
    marginLeft: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  engineStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: '900',
    marginVertical: 8,
  },
  smallLabel: {
    fontSize: 10,
  },
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
});