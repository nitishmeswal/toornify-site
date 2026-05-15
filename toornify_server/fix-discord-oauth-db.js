// Fix Discord OAuth Database Script
// This drops the old email index to allow sparse index creation

import mongoose from 'mongoose';
import 'dotenv/config';

const DB_URL = process.env.DB_URL || process.env.MONGODB_URI;

async function fixDatabase() {
  try {
    console.log('🔧 Discord OAuth Database Fix');
    console.log('==============================\n');

    if (!DB_URL) {
      console.error('❌ Error: DB_URL environment variable is not set');
      process.exit(1);
    }

    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get existing indexes
    console.log('📝 Current indexes on users collection:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      if (idx.sparse) console.log(`    (sparse: true)`);
    });
    console.log('');

    // Try to drop the old email index
    try {
      console.log('🗑️  Dropping old email_1 index...');
      await usersCollection.dropIndex('email_1');
      console.log('✅ Successfully dropped email_1 index\n');
    } catch (err) {
      if (err.code === 27 || err.codeName === 'IndexNotFound') {
        console.log('ℹ️  Index email_1 does not exist (this is fine)\n');
      } else {
        console.error('❌ Error dropping index:', err.message, '\n');
      }
    }

    // Check for compound index with email
    const emailRoleIndex = indexes.find(idx =>
      idx.key.email === 1 && idx.key.role === 1
    );

    if (emailRoleIndex && !emailRoleIndex.sparse) {
      try {
        console.log(`🗑️  Dropping old ${emailRoleIndex.name} compound index...`);
        await usersCollection.dropIndex(emailRoleIndex.name);
        console.log(`✅ Successfully dropped ${emailRoleIndex.name} index\n`);
      } catch (err) {
        console.error('❌ Error dropping compound index:', err.message, '\n');
      }
    }

    console.log('✅ Database fix complete!\n');
    console.log('Next steps:');
    console.log('1. The sparse indexes will be created automatically when you restart the server');
    console.log('2. Start your server: npm start');
    console.log('3. Test Discord OAuth login\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixDatabase();

