import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Setting } from '../app/api/modules/shared/models/setting.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/buysell';

const DEFAULTS: Record<string, any> = {
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

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const [key, value] of Object.entries(DEFAULTS)) {
      const existing = await Setting.findOne({ key });
      if (existing) {
        console.log(`Skipping '${key}' (already exists)`);
        continue;
      }
      await Setting.create({ key, value });
      console.log(`Seeded setting '${key}'`);
    }

    console.log('System settings seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('System settings seeding error:', err);
    process.exit(1);
  }
}

run();


