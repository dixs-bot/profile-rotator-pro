import { supabase } from '../lib/supabase';
import { useProfileStore } from '../store/profileStore';
import { useAppStore } from '../store/appStore';
import { Profile } from '../types';
import { ErrorService } from '../services/ErrorService';

export class ProfileEngine {
  static async loadProfiles() {
    const profileStore = useProfileStore.getState();
    const appStore = useAppStore.getState();
    
    profileStore.setLoading(true);
    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mappedData: Profile[] = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          model: p.model,
          android_version: p.android_version,
          user_agent: p.user_agent,
          language: p.language,
          timezone: p.timezone,
          country: p.country,
          notes: p.notes,
          is_active: p.is_active,
          created_at: p.created_at,
        }));
        
        await profileStore.setProfiles(mappedData);
        
        const active = mappedData.find(p => p.is_active) || null;
        await profileStore.setActiveProfile(active);
      } else {
        await profileStore.loadCachedProfiles();
      }
    } catch (e: any) {
      const errMsg = ErrorService.handleProfileError(e);
      profileStore.setError(errMsg);
      await profileStore.loadCachedProfiles();
    } finally {
      profileStore.setLoading(false);
    }
  }

  static async createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'is_active'>) {
    const profileStore = useProfileStore.getState();
    const appStore = useAppStore.getState();
    
    const newProfile: Profile = {
      ...profile,
      id: Math.random().toString(36).substring(7),
      is_active: false,
      created_at: new Date().toISOString()
    };

    // Optimistic Update
    profileStore.addProfile(newProfile);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase.from('profiles').insert({
          ...newProfile,
          user_id: user.id
        });
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'CREATE',
          table: 'profiles',
          payload: newProfile
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync created profile';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async updateProfile(profile: Profile) {
    const profileStore = useProfileStore.getState();
    const appStore = useAppStore.getState();

    profileStore.updateProfile(profile);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('profiles')
          .update({ ...profile, user_id: user.id })
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'UPDATE',
          table: 'profiles',
          payload: profile
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync updated profile';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async deleteProfile(id: string) {
    const profileStore = useProfileStore.getState();
    const appStore = useAppStore.getState();

    profileStore.deleteProfile(id);

    try {
      if (appStore.isOnline) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'DELETE',
          table: 'profiles',
          payload: { id }
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync profile deletion';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async setActiveProfile(id: string | null) {
    const profileStore = useProfileStore.getState();
    const active = profileStore.profiles.find(p => p.id === id) || null;
    
    const updatedProfiles = profileStore.profiles.map(p => ({
      ...p,
      is_active: p.id === id
    }));
    
    await profileStore.setProfiles(updatedProfiles);
    await profileStore.setActiveProfile(active);

    for (const p of updatedProfiles) {
      await this.updateProfile(p);
    }
  }
}
