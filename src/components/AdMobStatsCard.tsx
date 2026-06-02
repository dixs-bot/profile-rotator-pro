import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdStore } from '../store/adStore';
import { useAppStore } from '../store/appStore';

export function AdMobStatsCard() {
  const { isDarkMode } = useAppStore();
  const { 
    bannerLoaded, 
    interstitialLoaded, 
    rewardedLoaded, 
    analytics,
    settings,
    activeBannerPosition
  } = useAdStore();

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;

  const calculateSuccessRate = () => {
    const total = analytics.loaded + analytics.failed;
    if (total === 0) return '100%';
    return `${Math.round((analytics.loaded / total) * 100)}%`;
  };

  return (
    <View style={[styles.cardBase, cardBgStyle]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.titleSmall, subTextStyle]}>Smart AdMob Engine</Text>
          <Text style={[styles.titleLarge, textStyle]}>Revenue & Status</Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={[styles.gridCell, isDarkMode ? styles.gridCellDark : styles.gridCellLight]}>
          <Text style={[styles.gridLabel, subTextStyle]}>SUCCESS RATE</Text>
          <Text style={styles.gridValuePrimary}>{calculateSuccessRate()}</Text>
        </View>

        <View style={[styles.gridCell, isDarkMode ? styles.gridCellDark : styles.gridCellLight]}>
          <Text style={[styles.gridLabel, subTextStyle]}>ACTIVE PLACEMENT</Text>
          <Text style={[styles.gridValueNormal, textStyle]}>
            {settings.banner_rotation_enabled ? activeBannerPosition : 'Static'}
          </Text>
        </View>
      </View>

      <View style={[styles.footerSection, isDarkMode ? styles.footerBorderDark : styles.footerBorderLight]}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, subTextStyle]}>Banner Ads Status</Text>
          <Text style={[styles.statusValue, bannerLoaded ? styles.statusSuccess : styles.statusPending]}>
            {bannerLoaded ? 'LOADED' : 'PENDING'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, subTextStyle]}>Interstitial (Next Preloaded)</Text>
          <Text style={[styles.statusValue, interstitialLoaded ? styles.statusSuccess : styles.statusPending]}>
            {interstitialLoaded ? 'READY' : 'PENDING'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, subTextStyle]}>Rewarded Video Ads</Text>
          <Text style={[styles.statusValue, rewardedLoaded ? styles.statusSuccess : styles.statusPending]}>
            {rewardedLoaded ? 'READY' : 'PENDING'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleLarge: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCell: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridCellDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  gridCellLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  gridCellMargin: {
    marginRight: 8,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridValuePrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 2,
  },
  gridValueNormal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  footerSection: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerBorderDark: {
    borderTopColor: '#334155',
  },
  footerBorderLight: {
    borderTopColor: '#F1F5F9',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusLabel: {
    fontSize: 12,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusPending: {
    color: '#94A3B8',
  },
});

export default AdMobStatsCard;