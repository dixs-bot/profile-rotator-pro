import AdManager from './AdManager';

export class InterstitialService {
  static async triggerAdShow(): Promise<boolean> {
    return await AdManager.showInterstitial();
  }

  static reload() {
    AdManager.loadInterstitial();
  }
}
