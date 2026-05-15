// Load environment variables FIRST before anything else
import dotenv from "dotenv";
dotenv.config();

// Optionally validate critical environment variables
const requiredVars = ['DB_URL', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('   Please check your .env file');
}

// Log OAuth configuration status
console.log("🔧 OAuth Configuration Status:");
console.log("  Google OAuth:", (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? "✅ Enabled" : "⏭️  Disabled");
console.log("  Discord OAuth:", (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) ? "✅ Enabled" : "⏭️  Disabled");

