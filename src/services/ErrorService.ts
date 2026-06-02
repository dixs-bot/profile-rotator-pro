import Toast from 'react-native-toast-message';

export type ErrorSeverity = 'WARNING' | 'ERROR' | 'CRITICAL';
export type ErrorCategory = 'NETWORK' | 'SUPABASE' | 'AUTH' | 'ADMOB' | 'UNKNOWN' | 'SYNC';

export interface AppError {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  raw?: any;
}

export class ErrorService {
  private static errorListeners: ((error: AppError) => void)[] = [];

  public static addErrorListener(listener: (error: AppError) => void) {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  private static triggerError(error: AppError) {
    // Console log output
    const formattedMsg = `[${error.timestamp}] [${error.severity}] [${error.category}] ${error.message}`;
    if (error.severity === 'WARNING') {
      console.warn(formattedMsg, error.raw || '');
    } else {
      console.error(formattedMsg, error.raw || '');
    }

    // Trigger visual toast overlay notification
    Toast.show({
      type: error.severity === 'WARNING' ? 'info' : 'error',
      text1: `${error.category} Alert`,
      text2: error.message,
      position: 'bottom',
      visibilityTime: 4000,
    });

    // Notify custom listeners
    this.errorListeners.forEach(listener => listener(error));
  }

  public static logWarning(message: string, category: ErrorCategory = 'UNKNOWN', raw?: any) {
    this.triggerError({
      message,
      category,
      severity: 'WARNING',
      timestamp: new Date().toISOString(),
      raw
    });
  }

  public static logError(message: string, category: ErrorCategory = 'UNKNOWN', raw?: any) {
    this.triggerError({
      message,
      category,
      severity: 'ERROR',
      timestamp: new Date().toISOString(),
      raw
    });
  }

  public static logCritical(message: string, category: ErrorCategory = 'UNKNOWN', raw?: any) {
    this.triggerError({
      message,
      category,
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      raw
    });
  }

  public static handleSyncError(error: any): { retry: boolean; message: string } {
    const isNetworkOffline = error?.message?.includes('Network request failed') || error?.status === 0;
    const category: ErrorCategory = isNetworkOffline ? 'NETWORK' : 'SUPABASE';
    const msg = error?.message || 'Database synchronization error.';

    this.logError(`Sync Engine failed: ${msg}`, category, error);
    
    return {
      retry: isNetworkOffline,
      message: isNetworkOffline ? 'Network offline. Operations enqueued.' : msg
    };
  }

  public static handleVpnError(error: any): string {
    const msg = error?.message || 'VPN Connection handshake timed out.';
    this.logError(msg, 'NETWORK', error);
    return msg;
  }

  public static handleProfileError(error: any): string {
    const msg = error?.message || 'Profile storage read/write mismatch.';
    this.logError(msg, 'SUPABASE', error);
    return msg;
  }
}
