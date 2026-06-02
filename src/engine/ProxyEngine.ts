import { supabase } from '../lib/supabase';
import { useProxyStore } from '../store/proxyStore';
import { useAppStore } from '../store/appStore';
import { ProxyProfile } from '../store/proxyStore';
import { ErrorService } from '../services/ErrorService';

export class ProxyEngine {
  static async loadProxies() {
    const proxyStore = useProxyStore.getState();
    const appStore = useAppStore.getState();
    
    proxyStore.setLoading(true);
    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('proxy_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mappedData: ProxyProfile[] = (data || []).map(p => ({
          id: p.id,
          name: p.name,
          provider: p.provider,
          host: p.host,
          port: p.port,
          username: p.username,
          password: p.password,
          is_active: p.is_active,
          created_at: p.created_at,
        }));
        
        await proxyStore.setProxies(mappedData);
        
        const active = mappedData.find(p => p.is_active) || null;
        await proxyStore.setActiveProxy(active);
      } else {
        await proxyStore.loadCachedProxies();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch proxy profiles';
      ErrorService.logError(message, 'SUPABASE', e);
      await proxyStore.loadCachedProxies();
    } finally {
      proxyStore.setLoading(false);
    }
  }

  static async createProxy(proxy: Omit<ProxyProfile, 'id' | 'created_at' | 'is_active'>) {
    const proxyStore = useProxyStore.getState();
    const appStore = useAppStore.getState();
    
    const newProxy: ProxyProfile = {
      ...proxy,
      id: Math.random().toString(36).substring(7),
      is_active: false,
      created_at: new Date().toISOString()
    };

    proxyStore.addProxy(newProxy);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase.from('proxy_profiles').insert({
          ...newProxy,
          user_id: user.id
        });
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'CREATE',
          table: 'proxy_profiles',
          payload: newProxy
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync created proxy';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async updateProxy(proxy: ProxyProfile) {
    const proxyStore = useProxyStore.getState();
    const appStore = useAppStore.getState();

    proxyStore.updateProxy(proxy);

    try {
      if (appStore.isOnline) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('proxy_profiles')
          .update({ ...proxy, user_id: user.id })
          .eq('id', proxy.id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'UPDATE',
          table: 'proxy_profiles',
          payload: proxy
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync updated proxy';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async deleteProxy(id: string) {
    const proxyStore = useProxyStore.getState();
    const appStore = useAppStore.getState();

    proxyStore.deleteProxy(id);

    try {
      if (appStore.isOnline) {
        const { error } = await supabase
          .from('proxy_profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } else {
        await appStore.addToSyncQueue({
          action: 'DELETE',
          table: 'proxy_profiles',
          payload: { id }
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to sync proxy deletion';
      ErrorService.logError(message, 'SUPABASE', e);
    }
  }

  static async setActiveProxy(id: string | null) {
    const proxyStore = useProxyStore.getState();
    const active = proxyStore.proxies.find(p => p.id === id) || null;
    
    const updatedProxies = proxyStore.proxies.map(p => ({
      ...p,
      is_active: p.id === id
    }));
    
    await proxyStore.setProxies(updatedProxies);
    await proxyStore.setActiveProxy(active);

    for (const p of updatedProxies) {
      await this.updateProxy(p);
    }
  }
}
