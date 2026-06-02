import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/appStore';
import { useProfileStore } from '../../store/profileStore';
import { ProfileEngine } from '../../engine/ProfileEngine';
import { BannerAdComponent } from '../../ads/BannerAdComponent';
import { Profile } from '../../types';

export default function ProfilesScreen() {
  const { isDarkMode } = useAppStore();
  const { profiles, activeProfile, loading } = useProfileStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form states with validations
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('Galaxy S24');
  const [androidVersion, setAndroidVersion] = useState('14');
  const [userAgent, setUserAgent] = useState('Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile');
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('America/New_York');
  const [country, setCountry] = useState('US');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingProfile(null);
    setName('');
    setBrand('Samsung');
    setModel('Galaxy S24');
    setAndroidVersion('14');
    setUserAgent('Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile');
    setLanguage('en-US');
    setTimezone('America/New_York');
    setCountry('US');
    setNotes('');
    setModalVisible(true);
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setName(profile.name);
    setBrand(profile.brand);
    setModel(profile.model);
    setAndroidVersion(profile.android_version);
    setUserAgent(profile.user_agent);
    setLanguage(profile.language);
    setTimezone(profile.timezone);
    setCountry(profile.country);
    setNotes(profile.notes || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingProfile) {
      await ProfileEngine.updateProfile({
        ...editingProfile,
        name,
        brand,
        model,
        android_version: androidVersion,
        user_agent: userAgent,
        language,
        timezone,
        country,
        notes,
      });
    } else {
      await ProfileEngine.createProfile({
        name,
        brand,
        model,
        android_version: androidVersion,
        user_agent: userAgent,
        language,
        timezone,
        country,
        notes,
      });
    }
    setModalVisible(false);
  };

  const handleDelete = async (id: string) => {
    await ProfileEngine.deleteProfile(id);
  };

  const handleActivate = async (id: string) => {
    await ProfileEngine.setActiveProfile(id);
  };

  const textStyle = isDarkMode ? styles.textLight : styles.textDark;
  const subTextStyle = isDarkMode ? styles.subLight : styles.subDark;
  const cardBgStyle = isDarkMode ? styles.cardDark : styles.cardLight;
  const inputBgStyle = isDarkMode ? styles.inputDark : styles.inputLight;

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, textStyle]}>User Profiles</Text>
            <Text style={[styles.headerSubtitle, subTextStyle]}>Spoof fingerprint database</Text>
          </View>
          <TouchableOpacity 
            onPress={openCreateModal}
            style={styles.createBtn}
          >
            <Text style={styles.createBtnText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = activeProfile?.id === item.id;
            return (
              <View style={[
                styles.cardBase, 
                cardBgStyle, 
                isActive ? styles.cardActive : null
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex1}>
                    <Text style={[styles.cardTitle, textStyle]}>{item.name}</Text>
                    <Text style={[styles.cardSubtitle, subTextStyle]}>{item.brand} {item.model} (Android {item.android_version})</Text>
                  </View>
                  {isActive ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => handleActivate(item.id)}
                      style={[styles.activateBtn, isDarkMode ? styles.activateBtnDark : styles.activateBtnLight]}
                    >
                      <Text style={[styles.activateBtnText, textStyle]}>Activate</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={[styles.uaText, subTextStyle]} numberOfLines={1}>
                  UA: {item.user_agent}
                </Text>

                <View style={[styles.cardFooter, isDarkMode ? styles.borderDark : styles.borderLight]}>
                  <Text style={[styles.footerText, subTextStyle]}>Lang: {item.language} | {item.timezone}</Text>
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
      </View>

      {/* Dynamic Banner Integration */}
      <BannerAdComponent />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalContentDark : styles.modalContentLight]}>
            <Text style={[styles.modalTitle, textStyle]}>
              {editingProfile ? 'Edit Profile' : 'New Profile'}
            </Text>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>PROFILE NAME</Text>
                <TextInput 
                  value={name} 
                  onChangeText={setName} 
                  placeholder="e.g. Pixel 8 - US"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  style={[styles.input, inputBgStyle]}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.flex1, styles.mr2]}>
                  <Text style={[styles.formLabel, subTextStyle]}>BRAND</Text>
                  <TextInput value={brand} onChangeText={setBrand} style={[styles.input, inputBgStyle]} />
                </View>
                <View style={[styles.flex1, styles.ml2]}>
                  <Text style={[styles.formLabel, subTextStyle]}>MODEL</Text>
                  <TextInput value={model} onChangeText={setModel} style={[styles.input, inputBgStyle]} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>ANDROID VERSION</Text>
                <TextInput value={androidVersion} onChangeText={setAndroidVersion} style={[styles.input, inputBgStyle]} />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>USER AGENT</Text>
                <TextInput value={userAgent} onChangeText={setUserAgent} multiline numberOfLines={3} style={[styles.input, styles.textarea, inputBgStyle]} />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.flex1, styles.mr2]}>
                  <Text style={[styles.formLabel, subTextStyle]}>LANG</Text>
                  <TextInput value={language} onChangeText={setLanguage} style={[styles.input, inputBgStyle]} />
                </View>
                <View style={[styles.flex1, styles.ml2]}>
                  <Text style={[styles.formLabel, subTextStyle]}>COUNTRY</Text>
                  <TextInput value={country} onChangeText={setCountry} style={[styles.input, inputBgStyle]} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>TIMEZONE</Text>
                <TextInput value={timezone} onChangeText={setTimezone} style={[styles.input, inputBgStyle]} />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, subTextStyle]}>NOTES (OPTIONAL)</Text>
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
  },
  bgDark: {
    backgroundColor: '#0F172A',
  },
  bgLight: {
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
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
  cardActive: {
    borderColor: '#2563EB',
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
  activeBadge: {
    backgroundColor: 'rgba(37, 99, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 230, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: 'semibold',
  },
  activateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activateBtnDark: {
    backgroundColor: '#334155',
  },
  activateBtnLight: {
    backgroundColor: '#E2E8F0',
  },
  activateBtnText: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  uaText: {
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
  footerText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  mr3: {
    marginRight: 12,
  },
  mr2: {
    marginRight: 6,
  },
  ml2: {
    marginLeft: 6,
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  textarea: {
    height: 80,
    textAlignVertical: 'top',
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