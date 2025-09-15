import { useState, useEffect } from 'react';
import { getClientSettings, type PlatformSettings } from '@/lib/settings';

/**
 * React hook to fetch and cache platform settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settingsData = await getClientSettings();
        setSettings(settingsData);
        setError(null);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    isMonetizationEnabled: settings?.monetization_enabled || false,
    isRegistrationEnabled: settings?.registration_enabled !== false,
    isMaintenanceMode: settings?.maintenance_mode || false,
    platformCurrency: settings?.platform_currency || 'LRD',
    maxListingPhotos: settings?.max_listing_photos || 10,
    listingExpirationDays: settings?.listing_expiration_days || 30,
    logoPath: settings?.logo_path || '/logo/buySellLogo.png',
    paymentInfo: {
      mobileNumbers: settings?.payment_mobile_numbers || { mtn: '', orange: '' },
      bankInfo: settings?.payment_bank_info || { bank_name: '', account_name: '', account_number: '' }
    }
  };
}

/**
 * Hook specifically for monetization status
 */
export function useMonetization() {
  const { isMonetizationEnabled, loading, error } = useSettings();
  return { isMonetizationEnabled, loading, error };
}

/**
 * Hook specifically for maintenance mode
 */
export function useMaintenanceMode() {
  const { isMaintenanceMode, loading, error } = useSettings();
  return { isMaintenanceMode, loading, error };
}
