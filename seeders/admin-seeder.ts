import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Admin } from '../app/api/modules/auth/models/admin.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_SUPER_EMAIL = process.env.ADMIN_SUPER_EMAIL;
const ADMIN_SUPER_PASSWORD = process.env.ADMIN_SUPER_PASSWORD;

async function seedSuperAdmin() {
  if (!MONGO_URI || !ADMIN_SUPER_EMAIL || !ADMIN_SUPER_PASSWORD) {
    console.error('Missing env vars');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const exists = await Admin.findOne({ email: ADMIN_SUPER_EMAIL });
  if (exists) {
    console.log('Super admin already exists');
    process.exit(0);
  }
  const hashed = await bcrypt.hash(ADMIN_SUPER_PASSWORD, 10);
  await Admin.create({
    email: ADMIN_SUPER_EMAIL,
    password: hashed,
    name: 'BinaryBrains',
    role: 'super_admin',
  });
  console.log('Super admin seeded');
  process.exit(0);
}

seedSuperAdmin();
