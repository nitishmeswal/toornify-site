#!/usr/bin/env node
/**
 * Test Discord OAuth Credentials
 * Run this after updating your DISCORD_CLIENT_SECRET
 */

import 'dotenv/config';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}`);
console.log(`${BLUE}      Discord OAuth Credentials Test${RESET}`);
console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}\n`);

const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const callbackUrl = process.env.DISCORD_CALLBACK_URL;

// Check if variables are loaded
console.log('1️⃣  Environment Variables Check:\n');
console.log(`   Client ID: ${clientId ? `${GREEN}✓${RESET} ${clientId}` : `${RED}✗ Missing${RESET}`}`);
console.log(`   Secret:    ${clientSecret ? `${GREEN}✓${RESET} ${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 5)}` : `${RED}✗ Missing${RESET}`}`);
console.log(`   Callback:  ${callbackUrl ? `${GREEN}✓${RESET} ${callbackUrl}` : `${YELLOW}⚠ Using default${RESET}`}\n`);

// Check for issues
console.log('2️⃣  Credential Validation:\n');

let hasIssues = false;

if (clientSecret) {
  if (/\s/.test(clientSecret)) {
    console.log(`   ${RED}✗ Secret contains whitespace${RESET}`);
    hasIssues = true;
  } else {
    console.log(`   ${GREEN}✓ No whitespace in secret${RESET}`);
  }

  if (clientSecret.length < 20) {
    console.log(`   ${YELLOW}⚠ Secret seems short (${clientSecret.length} chars)${RESET}`);
    hasIssues = true;
  } else {
    console.log(`   ${GREEN}✓ Secret length looks good (${clientSecret.length} chars)${RESET}`);
  }

  if (clientSecret === 'Yo1ElaiLtBpiegOLOsxb5DSYQNsdNXdjU') {
    console.log(`   ${RED}✗ Still using OLD secret (this is causing the error!)${RESET}`);
    console.log(`   ${YELLOW}→ You MUST reset it in Discord Portal${RESET}`);
    hasIssues = true;
  }
}

console.log('');

// Test Discord API
console.log('3️⃣  Testing Discord API Connection:\n');

try {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'identify',
    }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`   ${GREEN}✓ Discord API accepted your credentials!${RESET}`);
    console.log(`   ${GREEN}✓ Your Client ID and Secret are VALID!${RESET}\n`);

    console.log(`${GREEN}═══════════════════════════════════════════════════${RESET}`);
    console.log(`${GREEN}SUCCESS! Your credentials are working!${RESET}`);
    console.log(`${GREEN}═══════════════════════════════════════════════════${RESET}\n`);

    console.log('Next steps:');
    console.log('1. Restart your server: npm start');
    console.log('2. Test OAuth: http://localhost:8002/api/v1/auth/discord\n');

  } else {
    console.log(`   ${RED}✗ Discord API Error: ${data.error}${RESET}`);

    if (data.error === 'invalid_client') {
      console.log(`   ${RED}✗ Your credentials are INVALID${RESET}\n`);

      console.log(`${RED}═══════════════════════════════════════════════════${RESET}`);
      console.log(`${RED}FIX REQUIRED: Update your Discord Client Secret${RESET}`);
      console.log(`${RED}═══════════════════════════════════════════════════${RESET}\n`);

      console.log('How to fix:');
      console.log(`1. Go to: ${BLUE}https://discord.com/developers/applications/${clientId}${RESET}`);
      console.log('2. Click: OAuth2 → General');
      console.log('3. Click: "Reset Secret" button');
      console.log('4. Copy the NEW secret');
      console.log('5. Update DISCORD_CLIENT_SECRET in your .env file');
      console.log('6. Run this script again to verify\n');

      process.exit(1);
    } else {
      console.log(`   ${YELLOW}Description: ${data.error_description}${RESET}\n`);
    }
  }
} catch (error) {
  console.log(`   ${RED}✗ Failed to connect to Discord: ${error.message}${RESET}\n`);
}

if (hasIssues) {
  console.log(`${YELLOW}⚠ Please fix the issues above and run this script again.${RESET}\n`);
}

