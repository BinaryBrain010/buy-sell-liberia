const mongoose = require('mongoose');
require('dotenv').config();

// Use the correct path and handle .default for ESModule transpiled exports
let User;
try {
  User = require('./models/User');
  User = User.default || User;
} catch (e) {
  console.error('Failed to load User model:', e);
  process.exit(1);
}

async function migrateUsers() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find({});
  for (const user of users) {
    let needsUpdate = false;
    if (!user.fullName) {
      user.fullName = user.username || user.email || 'Unknown';
      needsUpdate = true;
    }
    if (!user.username) {
      user.username = user.email ? user.email.split('@')[0] : 'user' + user._id;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await user.save();
      console.log(`Updated user ${user._id}: fullName=${user.fullName}, username=${user.username}`);
    }
  }
  console.log('Migration complete.');
  process.exit();
}

migrateUsers();
