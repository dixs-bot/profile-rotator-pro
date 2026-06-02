import AdManager from './AdManager';

export class RewardedInterstitialService {
  static async showAdAndGrantReward(onReward: (type: string, amount: number) => void): Promise<boolean> {
    return await AdManager.showRewardedInterstitial(onReward);
  }

  static reload() {
    AdManager.loadRewardedInterstitial();
  }
}
