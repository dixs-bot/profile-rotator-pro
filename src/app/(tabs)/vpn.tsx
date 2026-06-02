import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useVpnStore } from '../../store/vpnStore';
import { VpnEngine } from '../../engine/VpnEngine';
import { InterstitialService } from '../../ads/InterstitialService';
import { VpnProfile } from '../../types';

export default function VpnScreen() {
  const { isDarkMode } = useAppStore();
  const { vpnProfiles, activeVpn, isConnected, isConnecting } = useVpnStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingVpn, setEditingVpn] = useState<VpnProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [country, setCountry] = useState('United States');
  const [serverName, setServerName] = useState('us-nyc-01.premiumvpn.com');
  const [serverId, setServerId] = useState('US_NYC_01');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingVpn(null);
    setName('');
    setCountry('United States');
    setServerName('us-nyc-01.premiumvpn.com');
    setServerId('US_NYC_01');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (vpn: VpnProfile) => {
    setEditingVpn(vpn);
    setName(vpn.name);
    setCountry(vpn.country);
    setServerName(vpn.server_name);
    setServerId(vpn.server_id);
    setNotes(vpn.notes || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingVpn) {
      await VpnEngine.updateVpnProfile({
        ...editingVpn,
        name,
        country,
        server_name: serverName,
        server_id: serverId,
        notes,
      });
    } else {
      await VpnEngine.createVpnProfile({
        name,
        country,
        server_name: serverName,
        server_id: serverId,
        notes,
      });
    }
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    await VpnEngine.deleteVpnProfile(id);
  };

  const handleConnectToggle = async (id: string) => {
    try {
      const shown = await InterstitialService.triggerAdShow();
      if (!shown) {
        console.log('[VpnScreen] Frequency cap active, skipping interstitial display.');
      }
    } catch (e) {
      console.warn('[VpnScreen] Error launching interstitial display', e);
    }

    if (activeVpn?.id === id && isConnected) {
      await VpnEngine.disconnectVPN();
    } else {
      await VpnEngine.connectVPN(id);
    }
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const inputBgStyle = isDarkMode ? styles.inputDark : styles.inputLight;

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, textStyle]}>VPN Servers</Text>
          <Text style={[styles.headerSubtitle, subTextStyle]}>Rotated network proxy gateways</Text>
        </View>
        <TouchableOpacity 
          onPress={openCreateModal}
          style={styles.createBtn}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vpnProfiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = activeVpn?.id === item.id;
          return (
            <View style={[
              styles.cardBase, 
              cardBgStyle, 
              isActive && isConnected ? styles.cardSuccess : isActive && isConnecting ? styles.cardWarning : null
            ]}>
              <View style={styles.cardHeader}>
                <View style={styles.flex1}>
                  <Text style={[styles.cardTitle, textStyle]}>{item.name}</Text>
                  <Text style={[styles.cardSubtitle, subTextStyle]}>{item.country} | ID: {item.server_id}</Text>
                </View>
                
                <TouchableOpacity 
                  onPress={() => handleConnectToggle(item.id)}
                  style={[
                    styles.connectBadge,
                    isActive && isConnected ? styles.badgeSuccess : isActive && isConnecting ? styles.badgeWarning : styles.badgeInactive
                  ]}
                >
                  <Text style={[
                    styles.connectBadgeText,
                    isActive && isConnected ? styles.textSuccess : isActive && isConnecting ? styles.textWarning : textStyle
                  ]}>
                    {isActive && isConnected ? 'Connected' : isActive && isConnecting ? 'Handshake' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.hostText, subTextStyle]}>
                Host: {item.server_name}
              </Text>

              <View style={[styles.cardFooter, isDarkMode ? styles.borderDark : styles.borderLight]}>
                <Text style={[styles.notesText, subTextStyle]}>{item.notes || 'No custom notes'}</Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={styles.mr3}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalContentDark : styles.modalContentLight]}>
            <Text style={[styles.modalTitle, textStyle]}>
              {editingVpn ? 'Edit VPN Config' : 'New VPN Config'}
            </Text>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>GATEWAY NAME</Text>
                <TextInput 
                  value={name} 
                  onChangeText={setName} 
                  placeholder="e.g. US - New York Core"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  style={[styles.input, inputBgStyle]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>COUNTRY</Text>
                <TextInput value={country} onChangeText={setCountry} style={[styles.input, inputBgStyle]} />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>SERVER HOSTNAME / IP</Text>
                <TextInput value={serverName} onChangeText={setServerName} style={[styles.input, inputBgStyle]} />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>SERVER CONFIG ID</Text>
                <TextInput value={serverId} onChangeText={setServerId} style={[styles.input, inputBgStyle]} />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>NOTES</Text>
                <TextInput value={notes} onChangeText={setNotes} style={[styles.input, inputBgStyle]} />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.actionBtn, styles.cancelBtn, isDarkMode ? styles.cancelBtnDark : styles.cancelBtnLight]}
              >
                <Text style={[styles.actionBtnText, textStyle]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave} 
                style={[styles.actionBtn, styles.saveBtn]}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFFFFF',
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
    padding: 16,
    marginBottom: 12,
  },
  cardSuccess: {
    borderColor: '#10B981',
  },
  cardWarning: {
    borderColor: '#F59E0B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  connectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  connectBadgeText: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  textSuccess: {
    color: '#10B981',
  },
  textWarning: {
    color: '#F59E0B',
  },
  hostText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borderDark: {
    borderTopColor: '#334155',
  },
  borderLight: {
    borderTopColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  mr3: {
    marginRight: 12,
  },
  editBtnText: {
    color: '#2563EB',
    fontWeight: 'semibold',
    fontSize: 12,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: 'semibold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
  },
  modalContentLight: {
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalScroll: {
    paddingBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
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
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    marginRight: 12,
  },
  cancelBtnDark: {
    backgroundColor: '#334155',
  },
  cancelBtnLight: {
    backgroundColor: '#E2E8F0',
  },
  actionBtnText: {
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});