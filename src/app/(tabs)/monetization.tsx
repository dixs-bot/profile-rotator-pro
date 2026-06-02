import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, TextInput, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useAdStore } from '../../store/adStore';
import { AdManager } from '../../features/admob/AdManager';
import { InterstitialManager } from '../../features/admob/InterstitialManager';
import { RewardedManager } from '../../features/admob/RewardedManager';
import { BannerRotationEngine } from '../../features/admob/BannerRotationEngine';

export default function MonetizationScreen() {
  const { isDarkMode } = useAppStore();
  const { 
    bannerLoaded, 
    interstitialLoaded, 
    rewardedLoaded, 
    analytics,
    settings,
    activeBannerPosition,
    rewardTransactions,
    updateSettings,
    fetchSettings,
    fetchRewardTransactions
  } = useAdStore();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [refreshInput, setRefreshInput] = useState(settings.banner_refresh_seconds.toString());
  const [cooldownInput, setCooldownInput] = useState(settings.interstitial_cooldown_seconds.toString());

  useEffect(() => {
    fetchSettings();
    fetchRewardTransactions();
  }, []);

  useEffect(() => {
    setRefreshInput(settings.banner_refresh_seconds.toString());
    setCooldownInput(settings.interstitial_cooldown_seconds.toString());
  }, [settings]);

  const handleUpdateRefresh = async () => {
    const val = parseInt(refreshInput, 10);
    if (isNaN(val) || val < 10) {
      Alert.alert('Invalid Range', 'Banner refresh rate must be a number and at least 10 seconds.');
      return;
    }
    await updateSettings({ banner_refresh_seconds: val });
    // Restart rotation engine with new timer
    BannerRotationEngine.getInstance().stopEngine();
    BannerRotationEngine.getInstance().startEngine();
    Alert.alert('Success', `Banner refresh rate updated to ${val} seconds.`);
  };

  const handleUpdateCooldown = async () => {
    const val = parseInt(cooldownInput, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid Range', 'Cooldown must be a positive number of seconds.');
      return;
    }
    await updateSettings({ interstitial_cooldown_seconds: val });
    Alert.alert('Success', `Interstitial cooldown updated to ${val} seconds.`);
  };

  const testInterstitial = async () => {
    setLoadingAction('interstitial');
    const shown = await InterstitialManager.getInstance().showInterstitial();
    setLoadingAction(null);
    if (!shown) {
      Alert.alert(
        'Cooldown Active or Not Loaded',
        `An ad cannot be shown. Either the ${settings.interstitial_cooldown_seconds}s cooldown is active or the ad asset is still preloading.`
      );
    }
  };

  const testRewarded = async () => {
    setLoadingAction('rewarded');
    const success = await RewardedManager.getInstance().showRewarded((type, amount) => {
      Alert.alert('Reward Claimed', `${amount} ${type} has been successfully credited to your profile!`);
    });
    setLoadingAction(null);
    if (!success) {
      Alert.alert('No Fill', 'Rewarded video ad not ready or disabled. Preload requested.');
    }
  };

  const triggerForceReload = async () => {
    setLoadingAction('reload');
    await AdManager.getInstance().initialize();
    setLoadingAction(null);
    Alert.alert('Reload Complete', 'All active ad SDK pipelines forced to cache and refresh.');
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const inputBgStyle = isDarkMode ? styles.inputDark : styles.inputLight;

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, textStyle]}>Ad Monetization Engine</Text>
        <Text style={[styles.headerSubtitle, subTextStyle]}>Smart adaptive ad placement, preloading & rotation system</Text>
      </View>

      {/* Ad SDK Status Dashboard */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb6]}>
        <Text style={[styles.sectionTitle, subTextStyle]}>SDK LIVE FORMAT STATUS</Text>
        
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, textStyle]}>Adaptive Banner Ad (At: {activeBannerPosition})</Text>
            <View style={[styles.badge, bannerLoaded ? styles.badgeSuccess : styles.badgeInactive]}>
              <Text style={[styles.badgeText, bannerLoaded ? styles.textSuccess : styles.textSecondary]}>
                {bannerLoaded ? 'ACTIVE / READY' : 'CACHING'}
              </Text>
            </View>
          </View>

          <View style={[styles.statusRow, styles.borderTop, isDarkMode ? styles.borderDark : styles.borderLight]}>
            <Text style={[styles.statusLabel, textStyle]}>Interstitial Ad</Text>
            <View style={[styles.badge, interstitialLoaded ? styles.badgeSuccess : styles.badgeInactive]}>
              <Text style={[styles.badgeText, interstitialLoaded ? styles.textSuccess : styles.textSecondary]}>
                {interstitialLoaded ? 'READY' : 'CACHING'}
              </Text>
            </View>
          </View>

          <View style={[styles.statusRow, styles.borderTop, isDarkMode ? styles.borderDark : styles.borderLight]}>
            <Text style={[styles.statusLabel, textStyle]}>Rewarded Video Ad</Text>
            <View style={[styles.badge, rewardedLoaded ? styles.badgeSuccess : styles.badgeInactive]}>
              <Text style={[styles.badgeText, rewardedLoaded ? styles.textSuccess : styles.textSecondary]}>
                {rewardedLoaded ? 'READY' : 'CACHING'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={triggerForceReload}
          disabled={loadingAction !== null}
          style={styles.reloadBtn}
        >
          <Text style={styles.reloadBtnText}>
            {loadingAction === 'reload' ? 'Re-initializing SDK...' : 'Force Smart SDK Re-Initialization ↻'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Panel */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb6]}>
        <Text style={[styles.sectionTitle, subTextStyle]}>ENGINE SETTINGS</Text>

        {/* Rotation Toggle */}
        <View style={[styles.rowBetween, styles.mb4]}>
          <View style={styles.flex1}>
            <Text style={[styles.settingTitle, textStyle]}>Banner Position Rotation</Text>
            <Text style={[styles.settingSubtitle, subTextStyle]}>Automatically cycle banner views across active screens</Text>
          </View>
          <Switch
            value={settings.banner_rotation_enabled}
            onValueChange={(val) => updateSettings({ banner_rotation_enabled: val })}
          />
        </View>

        {/* Preload Toggle */}
        <View style={[styles.rowBetween, styles.mb6]}>
          <View style={styles.flex1}>
            <Text style={[styles.settingTitle, textStyle]}>Rewarded Preloading</Text>
            <Text style={[styles.settingSubtitle, subTextStyle]}>Automatically keep a rewarded ad filled in background</Text>
          </View>
          <Switch
            value={settings.rewarded_preload_enabled}
            onValueChange={(val) => {
              updateSettings({ rewarded_preload_enabled: val });
              if (val) RewardedManager.getInstance().preload();
            }}
          />
        </View>

        {/* Refresh seconds */}
        <View style={styles.mb4}>
          <Text style={[styles.inputLabel, textStyle]}>Banner Rotation/Refresh Interval (seconds)</Text>
          <View style={styles.formRow}>
            <TextInput
              value={refreshInput}
              onChangeText={setRefreshInput}
              keyboardType="number-pad"
              style={[styles.input, inputBgStyle]}
            />
            <TouchableOpacity onPress={handleUpdateRefresh} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cooldown seconds */}
        <View style={styles.mb2}>
          <Text style={[styles.inputLabel, textStyle]}>Interstitial Frequency Cooldown (seconds)</Text>
          <View style={styles.formRow}>
            <TextInput
              value={cooldownInput}
              onChangeText={setCooldownInput}
              keyboardType="number-pad"
              style={[styles.input, inputBgStyle]}
            />
            <TouchableOpacity onPress={handleUpdateCooldown} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Ads Testing Playground */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb6]}>
        <Text style={[styles.sectionTitle, subTextStyle]}>INTERACTIVE AD PLACEMENT TESTS</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            onPress={testInterstitial}
            disabled={loadingAction !== null}
            style={[styles.actionBtn, styles.btnPrimary]}
          >
            <Text style={styles.btnText}>Trigger Interstitial (Dynamic Cooldown)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={testRewarded}
            disabled={loadingAction !== null}
            style={[styles.actionBtn, styles.btnSuccess]}
          >
            <Text style={styles.btnText}>Trigger Rewarded Video (Earn Premium Credit)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Analytics Summary */}
      <View style={[styles.rowBetween, styles.mb6]}>
        <View style={[styles.cardBase, cardBgStyle, styles.analyticsCell, styles.mr1]}>
          <Text style={[styles.analyticsLabel, subTextStyle]}>TOTAL VIEWED</Text>
          <Text style={[styles.analyticsValue, textStyle]}>{analytics.views}</Text>
        </View>
        <View style={[styles.cardBase, cardBgStyle, styles.analyticsCell, styles.mx1]}>
          <Text style={[styles.analyticsLabel, subTextStyle]}>REWARDS ACCRUED</Text>
          <Text style={[styles.analyticsValue, styles.textSuccess]}>{analytics.rewardsEarned}</Text>
        </View>
        <View style={[styles.cardBase, cardBgStyle, styles.analyticsCell, styles.ml1]}>
          <Text style={[styles.analyticsLabel, subTextStyle]}>FAIL/NO-FILLS</Text>
          <Text style={[styles.analyticsValue, styles.textDanger]}>{analytics.failed}</Text>
        </View>
      </View>

      {/* Reward Transactions Log */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb12]}>
        <Text style={[styles.sectionTitle, subTextStyle]}>REWARD LOGS & TRANSACTION HISTORY</Text>
        
        {rewardTransactions.length === 0 ? (
          <Text style={[styles.emptyText, subTextStyle]}>No reward transactions documented yet.</Text>
        ) : (
          <View style={styles.logsContainer}>
            {rewardTransactions.slice(0, 10).map((tx) => (
              <View key={tx.id} style={[styles.logItem, styles.borderBottom, isDarkMode ? styles.borderDark : styles.borderLight]}>
                <View>
                  <Text style={[styles.logType, textStyle]}>{tx.reward_type}</Text>
                  <Text style={[styles.logDate, subTextStyle]}>{new Date(tx.created_at).toLocaleString()}</Text>
                </View>
                <Text style={styles.logAmount}>+{tx.reward_amount}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
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
  scrollContent: {
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
  textDanger: {
    color: '#EF4444',
  },
  textSecondary: {
    color: '#94A3B8',
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
  },
  mb6: {
    marginBottom: 24,
  },
  mb4: {
    marginBottom: 16,
  },
  mb2: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  borderTop: {
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 12,
  },
  borderDark: {
    borderTopColor: '#334155',
  },
  borderLight: {
    borderTopColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reloadBtn: {
    backgroundColor: 'rgba(37, 99, 230, 0.1)',
    borderColor: 'rgba(37, 99, 230, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reloadBtnText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: 'semibold',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'semibold',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  inputLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    marginLeft: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: 'column',
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
  },
  btnSuccess: {
    backgroundColor: '#10B981',
    marginBottom: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  analyticsCell: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  mr1: {
    marginRight: 4,
  },
  mx1: {
    marginHorizontal: 4,
  },
  ml1: {
    marginLeft: 4,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
  logsContainer: {
    flexDirection: 'column',
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  logType: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  logDate: {
    fontSize: 10,
    marginTop: 2,
  },
  logAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
});