import { Setting } from "../models/setting.model";
import { connectDB } from "@/lib/mongoose";

export interface SystemSettings {
  // Platform Configuration
  platformCurrency: "LRD" | "USD";
  platformLogo?: string;

  // Listing Configuration
  listingExpirationDays: number;
  maxListingPhotos: number;

  // Feature Toggles
  monetizationEnabled: boolean;
  registrationEnabled: boolean;
  maintenanceMode: boolean;

  // Payment Configuration
  paymentContactInfo: {
    mobile?: string;
    bank?: string;
    email?: string;
  };

  // Monetization Settings
  monetizationPrices?: any;
  monetizationPaymentDetails?: any;
}

export class SettingsService {
  private static readonly SETTING_KEYS = {
    PLATFORM_CURRENCY: "platform_currency",
    PLATFORM_LOGO: "platform_logo",
    LISTING_EXPIRATION_DAYS: "listing_expiration_days",
    MAX_LISTING_PHOTOS: "max_listing_photos",
    MONETIZATION_ENABLED: "monetization_enabled",
    REGISTRATION_ENABLED: "registration_enabled",
    MAINTENANCE_MODE: "maintenance_mode",
    PAYMENT_CONTACT_INFO: "payment_contact_info",
    MONETIZATION_PRICES: "monetization_prices",
    MONETIZATION_PAYMENT_DETAILS: "monetization_payment_details",
  };

  /**
   * Initialize default settings in database if they don't exist
   */
  static async initializeDefaultSettings(): Promise<void> {
    await connectDB();

    const defaultSettings = this.getDefaultSettings();

    for (const [key, value] of Object.entries(defaultSettings)) {
      await Setting.findOneAndUpdate(
        { key },
        { $setOnInsert: { key, value } },
        { upsert: true, new: true }
      );
    }
  }

  /**
   * Get all system settings (loads from database)
   */
  static async getAllSettings(): Promise<SystemSettings> {
    await connectDB();

    // Initialize defaults if not present
    await this.initializeDefaultSettings();

    const settings = await Setting.find({
      key: { $in: Object.values(this.SETTING_KEYS) },
    });

    console.log(
      `[GET SETTINGS] Found ${settings.length} settings in DB:`,
      settings
    );

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    console.log(`[GET SETTINGS] Settings map:`, settingsMap);

    return {
      platformCurrency:
        settingsMap[this.SETTING_KEYS.PLATFORM_CURRENCY] || "USD",
      platformLogo: settingsMap[this.SETTING_KEYS.PLATFORM_LOGO] || "",
      listingExpirationDays:
        settingsMap[this.SETTING_KEYS.LISTING_EXPIRATION_DAYS] ?? 90,
      maxListingPhotos: settingsMap[this.SETTING_KEYS.MAX_LISTING_PHOTOS] ?? 10,
      monetizationEnabled: Boolean(
        settingsMap[this.SETTING_KEYS.MONETIZATION_ENABLED]
      ),
      registrationEnabled:
        settingsMap[this.SETTING_KEYS.REGISTRATION_ENABLED] !== false,
      maintenanceMode: Boolean(settingsMap[this.SETTING_KEYS.MAINTENANCE_MODE]),
      paymentContactInfo:
        settingsMap[this.SETTING_KEYS.PAYMENT_CONTACT_INFO] || {},
      monetizationPrices:
        settingsMap[this.SETTING_KEYS.MONETIZATION_PRICES] || {},
      monetizationPaymentDetails:
        settingsMap[this.SETTING_KEYS.MONETIZATION_PAYMENT_DETAILS] || {},
    };
  }

  /**
   * Update a specific setting
   */
  static async updateSetting(key: string, value: any): Promise<void> {
    await connectDB();

    console.log(`[UPDATE SETTING] Updating ${key} with value:`, value);

    // First check if setting exists
    const existing = await Setting.findOne({ key });
    console.log(`[UPDATE SETTING] Existing setting:`, existing);

    const result = await Setting.findOneAndUpdate(
      { key },
      { $set: { key, value } },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`[UPDATE SETTING] Update result:`, result);

    // Verify the update
    const verify = await Setting.findOne({ key });
    console.log(`[UPDATE SETTING] Verification after update:`, verify);
  }

  /**
   * Update multiple settings at once
   */
  static async updateSettings(updates: Partial<SystemSettings>): Promise<void> {
    await connectDB();

    const updatePromises = Object.entries(updates).map(async ([key, value]) => {
      const settingKey = this.getSettingKey(key as keyof SystemSettings);
      if (settingKey) {
        await this.updateSetting(settingKey, value);
      }
    });

    await Promise.all(updatePromises);
  }

  /**
   * Get a specific setting value
   */
  static async getSetting(key: string): Promise<any> {
    await connectDB();

    const setting = await Setting.findOne({ key });
    return setting?.value;
  }

  /**
   * Check if monetization is enabled
   */
  static async isMonetizationEnabled(): Promise<boolean> {
    const enabled = await this.getSetting(
      this.SETTING_KEYS.MONETIZATION_ENABLED
    );
    return !!enabled;
  }

  /**
   * Check if registration is enabled
   */
  static async isRegistrationEnabled(): Promise<boolean> {
    const enabled = await this.getSetting(
      this.SETTING_KEYS.REGISTRATION_ENABLED
    );
    return enabled ?? true; // Default true
  }

  /**
   * Check if maintenance mode is enabled
   */
  static async isMaintenanceMode(): Promise<boolean> {
    const enabled = await this.getSetting(this.SETTING_KEYS.MAINTENANCE_MODE);
    return !!enabled;
  }

  /**
   * Get platform currency
   */
  static async getPlatformCurrency(): Promise<"LRD" | "USD"> {
    const currency = await this.getSetting(this.SETTING_KEYS.PLATFORM_CURRENCY);
    return currency ?? "USD";
  }

  /**
   * Get listing expiration days
   */
  static async getListingExpirationDays(): Promise<number> {
    const days = await this.getSetting(
      this.SETTING_KEYS.LISTING_EXPIRATION_DAYS
    );
    return days ?? 90;
  }

  /**
   * Get max listing photos
   */
  static async getMaxListingPhotos(): Promise<number> {
    const max = await this.getSetting(this.SETTING_KEYS.MAX_LISTING_PHOTOS);
    return max ?? 10;
  }

  /**
   * Get default settings for initialization and resets
   */
  private static getDefaultSettings(): Record<string, any> {
    return {
      [this.SETTING_KEYS.PLATFORM_CURRENCY]: "LRD",
      [this.SETTING_KEYS.PLATFORM_LOGO]: "",
      [this.SETTING_KEYS.LISTING_EXPIRATION_DAYS]: 90,
      [this.SETTING_KEYS.MAX_LISTING_PHOTOS]: 10,
      [this.SETTING_KEYS.MONETIZATION_ENABLED]: false,
      [this.SETTING_KEYS.REGISTRATION_ENABLED]: true,
      [this.SETTING_KEYS.MAINTENANCE_MODE]: false,
      [this.SETTING_KEYS.PAYMENT_CONTACT_INFO]: {},
      [this.SETTING_KEYS.MONETIZATION_PRICES]: {
        featured_listing: {
          "3_days": { 
            price: 150, 
            duration: 3, 
            label: "3 Days",
            description: "Feature your listing for 3 days"
          },
          "7_days": { 
            price: 300, 
            duration: 7, 
            label: "7 Days",
            description: "Feature your listing for 1 week"
          },
          "14_days": { 
            price: 500, 
            duration: 14, 
            label: "14 Days",
            description: "Feature your listing for 2 weeks"
          }
        }
      },
      [this.SETTING_KEYS.MONETIZATION_PAYMENT_DETAILS]: {
        mtn: {
          number: "",
          name: "",
          instructions: "Send payment to the MTN number above and enter your transaction ID"
        },
        orange: {
          number: "",
          name: "",
          instructions: "Send payment to the Orange number above and enter your transaction ID"
        },
        bank: {
          accountNumber: "",
          accountName: "",
          bankName: "",
          instructions: "Transfer to the bank account above and upload your payment receipt"
        }
      },
    };
  }

  /**
   * Clear all settings and reinitialize (for debugging)
   */
  static async clearAndReinitialize(): Promise<void> {
    await connectDB();

    console.log("[CLEAR] Clearing all settings...");
    await Setting.deleteMany({});

    console.log("[CLEAR] Reinitializing with defaults...");
    await this.initializeDefaultSettings();

    const allSettings = await Setting.find({});
    console.log("[CLEAR] Settings after reinitialization:", allSettings);
  }

  /**
   * Reset specific settings to their default values
   */
  static async resetSettings(props: (keyof SystemSettings)[]): Promise<void> {
    await connectDB();

    const defaults = this.getDefaultSettings();
    const keys = props
      .map((p) => this.getSettingKey(p))
      .filter((k): k is string => !!k);

    if (keys.length === 0) return;

    for (const key of keys) {
      await Setting.findOneAndUpdate(
        { key },
        { $set: { value: defaults[key] } },
        { upsert: true, new: true }
      );
    }
  }

  /**
   * Map setting property names to database keys
   */
  static getSettingKey(property: keyof SystemSettings): string | null {
    const keyMap: Record<keyof SystemSettings, string> = {
      platformCurrency: this.SETTING_KEYS.PLATFORM_CURRENCY,
      platformLogo: this.SETTING_KEYS.PLATFORM_LOGO,
      listingExpirationDays: this.SETTING_KEYS.LISTING_EXPIRATION_DAYS,
      maxListingPhotos: this.SETTING_KEYS.MAX_LISTING_PHOTOS,
      monetizationEnabled: this.SETTING_KEYS.MONETIZATION_ENABLED,
      registrationEnabled: this.SETTING_KEYS.REGISTRATION_ENABLED,
      maintenanceMode: this.SETTING_KEYS.MAINTENANCE_MODE,
      paymentContactInfo: this.SETTING_KEYS.PAYMENT_CONTACT_INFO,
      monetizationPrices: this.SETTING_KEYS.MONETIZATION_PRICES,
      monetizationPaymentDetails:
        this.SETTING_KEYS.MONETIZATION_PAYMENT_DETAILS,
    };

    return keyMap[property] || null;
  }
}
