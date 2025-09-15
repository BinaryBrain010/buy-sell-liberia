import Setting from '@/models/Setting';
import { connectDB } from '@/lib/mongoose';

// Cache for settings to avoid repeated DB calls
let settingsCache: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default fallback values
const DEFAULTS = {
  platform_currency: 'LRD',
  listing_expiration_days: 30,
  max_listing_photos: 10,
  payment_mobile_numbers: { mtn: '', orange: '' },
  payment_bank_info: { bank_name: '', account_name: '', account_number: '' },
  logo_path: '/logo/buySellLogo.png',
  monetization_enabled: false,
  registration_enabled: true,
  maintenance_mode: false,
};

export type PlatformSettings = typeof DEFAULTS;

/**
 * Get all platform settings from DB with caching
 */
export async function getSettings(): Promise<PlatformSettings> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return { ...DEFAULTS, ...settingsCache };
  }

  try {
    await connectDB();
    const docs = await Setting.find({
      key: { $in: Object.keys(DEFAULTS) }
    });
    
    const dbSettings: Record<string, any> = {};
    docs.forEach((doc) => {
      dbSettings[doc.key] = doc.value;
    });
    
    // Update cache
    settingsCache = dbSettings;
    cacheTimestamp = now;
    
    return { ...DEFAULTS, ...dbSettings };
  } catch (error) {
    console.error('[SETTINGS] Error fetching settings:', error);
    return DEFAULTS;
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof PlatformSettings>(
  key: K
): Promise<PlatformSettings[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Clear settings cache (useful after admin updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Client-side settings fetcher (for React components)
 */
export async function getClientSettings(): Promise<PlatformSettings> {
  try {
    const response = await fetch('/api/settings', {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const settings = await response.json();
    return { ...DEFAULTS, ...settings };
  } catch (error) {
    console.error('[SETTINGS] Client error:', error);
    return DEFAULTS;
  }
}
