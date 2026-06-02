import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdStore } from '../store/adStore';

export function BannerAdComponent() {
  const { bannerLoaded } = useAdStore();

  if (!bannerLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>LOADING BANNER SPONSOR...</Text>
      </View>
    );
  }

  return (
    <View style={styles.sponsorContainer}>
      <View style={styles.sponsorLeft}>
        <View style={styles.sponsorHeader}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>SPONSOR</Text>
          </View>
          <Text style={styles.sponsorTitle}>PRO ROTATOR SUITE V2</Text>
        </View>
        <Text style={styles.sponsorDescription}>
          Unlock unlimited lightning speeds & premium geo-locations instantly!
        </Text>
      </View>
      <View style={styles.upgradeBtn}>
        <Text style={styles.upgradeText}>UPGRADE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  loadingText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sponsorContainer: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sponsorLeft: {
    flex: 1,
    marginRight: 16,
  },
  sponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeContainer: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sponsorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sponsorDescription: {
    fontSize: 11,
    color: '#94A3B8',
  },
  upgradeBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BannerAdComponent;