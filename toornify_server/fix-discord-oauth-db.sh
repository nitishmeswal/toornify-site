#!/bin/bash

# Discord OAuth Database Fix Script
# This script drops the old email index and allows the application to recreate it as sparse

echo "🔧 Discord OAuth Database Fix"
echo "=============================="
echo ""

# Check if MongoDB connection string is available
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    echo "Please set it first: export MONGODB_URI='your_connection_string'"
    exit 1
fi

echo "📊 Connecting to MongoDB..."
echo ""

# Drop the old email index
mongosh "$MONGODB_URI" --eval "
print('🗑️  Dropping old email index...');
db.users.dropIndex('email_1').catch(err => {
    if (err.code === 27) {
        print('ℹ️  Index email_1 does not exist (this is fine)');
    } else {
        print('❌ Error dropping index:', err.message);
    }
});

print('');
print('✅ Database fix complete!');
print('');
print('📝 Current indexes on users collection:');
db.users.getIndexes().forEach(idx => {
    print('  - ' + idx.name + ': ' + JSON.stringify(idx.key));
});
print('');
print('Next steps:');
print('1. Restart your server to apply the schema changes');
print('2. The new sparse email index will be created automatically');
print('3. Test Discord OAuth login');
"

echo ""
echo "✅ Script completed!"
echo ""
echo "🚀 Now restart your server:"
echo "   npm start"

