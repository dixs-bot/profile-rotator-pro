import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useRotationStore } from '../../store/rotationStore';
import { RotationEngine } from '../../engine/RotationEngine';

export default function RotationScreen() {
  const { isDarkMode } = useAppStore();
  const { settings, logs, timeLeft, setRotationInterval } = useRotationStore();
  const [newInterval, setNewInterval] = useState(settings.rotation_interval.toString());

  const toggleRotation = async (value: boolean) => {
    if (value) {
      await RotationEngine.start();
    } else {
      await RotationEngine.stop();
    }
  };

  const updateInterval = () => {
    const val = parseInt(newInterval, 10);
    if (!isNaN(val) && val > 0) {
      setRotationInterval(val);
    }
  };

  const triggerForceRotate = async () => {
    await RotationEngine.rotate();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const inputBgStyle = isDarkMode ? styles.inputDark : styles.inputLight;

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, textStyle]}>Rotation Engine</Text>
        <Text style={[styles.headerSubtitle, subTextStyle]}>Automated identity & network spoofing cycles</Text>
      </View>

      {/* Control Panel */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb6]}>
        <View style={styles.controlRow}>
          <View>
            <Text style={[styles.controlTitle, textStyle]}>Enable Rotation</Text>
            <Text style={[styles.controlSubtitle, subTextStyle]}>Interval scheduling switch</Text>
          </View>
          <Switch value={settings.rotation_enabled} onValueChange={toggleRotation} />
        </View>

        <View style={[styles.formRow, isDarkMode ? styles.borderDark : styles.borderLight]}>
          <View style={styles.flex1}>
            <Text style={[styles.formLabel, subTextStyle]}>INTERVAL (SECONDS)</Text>
            <TextInput
              value={newInterval}
              onChangeText={setNewInterval}
              keyboardType="number-pad"
              style={[styles.input, inputBgStyle]}
            />
          </View>
          <TouchableOpacity onPress={updateInterval} style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={triggerForceRotate}
          style={styles.forceBtn}
        >
          <Text style={styles.forceBtnText}>Force Immediate Rotation ↻</Text>
        </TouchableOpacity>
      </View>

      {/* Live Timer Visualizer */}
      <View style={[styles.cardBase, cardBgStyle, styles.mb6, styles.alignCenter]}>
        <Text style={[styles.timerLabel, subTextStyle]}>TIME REMAINING UNTIL ROTATION</Text>
        <Text style={[styles.timerValue, textStyle]}>
          {formatTime(timeLeft)}
        </Text>
      </View>

      {/* Modern Timeline Historical Logs */}
      <Text style={[styles.historyHeader, subTextStyle]}>HISTORICAL ROTATION LOGS</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardBaseLog, cardBgStyle]}>
            <View style={styles.flex1}>
              <View style={styles.logHeaderRow}>
                <View style={[
                  styles.statusDot, 
                  item.status === 'SUCCESS' ? styles.dotSuccess : item.status === 'WARNING' ? styles.dotWarning : styles.dotDanger
                ]} />
                <Text style={[styles.logProfileName, textStyle]}>{item.profile_name}</Text>
              </View>
              <Text style={[styles.logDetails, subTextStyle]}>
                VPN: {item.vpn_profile_name} | From: {item.old_state}
              </Text>
            </View>
            <Text style={[styles.logTime, subTextStyle]}>
              {new Date(item.rotation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  bgDark: {
    backgroundColor: '#0F172A',
  },
  bgLight: {
    backgroundColor: '#F8FAFC',
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
  mb6: {
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlSubtitle: {
    fontSize: 12,
  },
  formRow: {
    borderTopWidth: 1,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  borderDark: {
    borderTopColor: '#334155',
  },
  borderLight: {
    borderTopColor: '#F1F5F9',
  },
  flex1: {
    flex: 1,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  inputLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  updateBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 16,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  forceBtn: {
    backgroundColor: 'rgba(37, 99, 230, 0.1)',
    borderColor: 'rgba(37, 99, 230, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  forceBtnText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  alignCenter: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  historyHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardBaseLog: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotSuccess: {
    backgroundColor: '#10B981',
  },
  dotWarning: {
    backgroundColor: '#F59E0B',
  },
  dotDanger: {
    backgroundColor: '#EF4444',
  },
  logProfileName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  logDetails: {
    fontSize: 10,
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});