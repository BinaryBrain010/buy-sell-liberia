import { Setting } from '../models/setting.model';

const MONETIZATION_KEY = 'monetization_enabled';
const PRICES_KEY = 'monetization_prices';
const PAYMENT_DETAILS_KEY = 'monetization_payment_details';

export async function isMonetizationEnabled(): Promise<boolean> {
  const setting = await Setting.findOne({ key: MONETIZATION_KEY });
  return !!(setting && setting.value);
}

export async function getMonetizationPrices(): Promise<any> {
  const setting = await Setting.findOne({ key: PRICES_KEY });
  return setting?.value || {};
}

export async function getMonetizationPaymentDetails(): Promise<any> {
  const setting = await Setting.findOne({ key: PAYMENT_DETAILS_KEY });
  return setting?.value || {};
}
