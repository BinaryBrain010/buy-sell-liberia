import { SettingsService } from './settings.service';

export async function isMonetizationEnabled(): Promise<boolean> {
  return await SettingsService.isMonetizationEnabled();
}

export async function getMonetizationPrices(): Promise<any> {
  const settings = await SettingsService.getAllSettings();
  return settings.monetizationPrices || {};
}

export async function getMonetizationPaymentDetails(): Promise<any> {
  const settings = await SettingsService.getAllSettings();
  return settings.monetizationPaymentDetails || {};
}
