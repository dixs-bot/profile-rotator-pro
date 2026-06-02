# PROFILE ROTATOR PRO V2

Upgrade with a complete premium **Google Mobile Ads (AdMob)** Monetization Suite!

Built using **TypeScript**, **Expo Router**, **Supabase**, **Zustand**, **React Query**, **AsyncStorage**, and **NativeWind (Tailwind)**.

---

## What's New in V2

1. **AdMob Monetization System**:
   - Integration with `react-native-google-mobile-ads` (v14.2.2).
   - Singleton design `AdManager.ts` dynamically handles adaptive banners, standard interstitials, rewarded videos, and rewarded interstitials.
   - Built-in automatic reload/re-caching loops for seamless back-to-back delivery.

2. **Secure Frequency Cap Manager**:
   - Limits interstitial displays strictly to **max 1 ad every 2 minutes** verified using microsecond timestamps stored within Zustand app memory.
   - Guardrails integrated securely on crucial state flow changes: Rotations, VPN Gateway connections, and Settings Analytics.

3. **Ad Rewards DB Migration (`supabase/migrations/...`)**:
   - Creates `ad_rewards` relational logs in Supabase.
   - Secure Row Level Security (RLS) policies allowing users only to CRUD logs referencing their authenticated user ID.

4. **Beautiful Monetization Hub Screen**:
   - Access via the **💰 Monetize** bottom tab.
   - Loaded status monitors, testing playgrounds, and detailed view performance analytics.

---

## Directory Structure

```text
profile-rotator-pro/
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── README.md
├── global.css
├── supabase/
│   └── migrations/
│       └── 20260601000000_add_ad_rewards.sql   # SQL Migration script with RLS
└── src/
    ├── types/
    │   ├── index.ts
    │   └── ads.ts                              # New AdReward typings
    ├── lib/
    │   └── supabase.ts
    ├── services/
    │   └── ErrorService.ts
    ├── ads/                                    # New Ads Service Suite
    │   ├── AdManager.ts
    │   ├── BannerAdComponent.tsx
    │   ├── InterstitialService.ts
    │   ├── RewardedService.ts
    │   └── RewardedInterstitialService.ts
    ├── store/
    │   ├── appStore.ts
    │   ├── profileStore.ts
    │   ├── rotationStore.ts
    │   ├── vpnStore.ts
    │   └── adStore.ts                          # New Ad state and analytics tracking
    ├── engine/
    │   ├── ProfileEngine.ts
    │   ├── RotationEngine.ts                   # Frequency capped ad triggers added
    │   ├── SchedulerEngine.ts
    │   ├── SyncEngine.ts
    │   └── VpnEngine.ts
    └── app/
        ├── _layout.tsx
        └── (tabs)/
            ├── _layout.tsx
            ├── index.tsx                       # Adaptive Banner integrated
            ├── profiles.tsx                    # Adaptive Banner integrated
            ├── rotation.tsx
            ├── vpn.tsx                         # Frequency capped ad on connect
            ├── monetization.tsx                # Monetization dashboard and playground
            └── settings.tsx                    # Adaptive Banner & Diagnostics frequency ad
```

---

## Environment Keys

Support for production AdMob IDs with fallbacks to Google test units:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

EXPO_PUBLIC_ADMOB_APP_ID=ca-app-pub-3940256099942544~3347511713
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-3940256099942544/6300978111
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-3940256099942544/1033173712
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-3940256099942544/5224354917
EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ID=ca-app-pub-3940256099942544/5354046379
```

---

## Execution Guidelines

1. **Unzip & Install**:
   ```bash
   unzip profile-rotator-pro-v2.zip
   cd profile-rotator-pro
   npm install
   ```

2. **Boot App Server**:
   ```bash
   npx expo start
   ```
