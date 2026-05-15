#!/bin/bash

echo "=================================="
echo "Security Check - Production Build"
echo "=================================="
echo ""

cd "/Volumes/Macintosh HD/Users/ginnamann/sanity_react"

echo "Building production bundle..."
npm run build

echo ""
echo "Checking for exposed console logs in production bundle..."
echo "-----------------------------------------------------------"

# Check for console.log in the built files
if grep -r "console\.log" dist/assets/*.js > /dev/null 2>&1; then
  echo "❌ WARNING: console.log found in production build!"
  grep -r "console\.log" dist/assets/*.js | head -5
else
  echo "✅ No console.log found in production build"
fi

echo ""
echo "Checking for exposed tokens..."
echo "-----------------------------------------------------------"

# Check for token references
if grep -r "authToken\|refreshToken\|password" dist/assets/*.js > /dev/null 2>&1; then
  echo "⚠️  Token/password references found (may be in code, check context):"
  grep -r "authToken\|refreshToken\|password" dist/assets/*.js | head -3
else
  echo "✅ No obvious token references found"
fi

echo ""
echo "Checking environment variables..."
echo "-----------------------------------------------------------"

# Check what VITE_ vars are exposed
echo "Exposed environment variables:"
grep -ro "VITE_[A-Z_]*" dist/assets/*.js 2>/dev/null | sort -u | head -10

echo ""
echo "Checking security headers configuration..."
echo "-----------------------------------------------------------"

if grep -q "X-Frame-Options" vercel.json; then
  echo "✅ Security headers configured in vercel.json"
else
  echo "❌ No security headers found in vercel.json"
fi

echo ""
echo "Checking source maps..."
echo "-----------------------------------------------------------"

if ls dist/assets/*.map > /dev/null 2>&1; then
  echo "⚠️  Source maps found (may expose source code)"
  ls -lh dist/assets/*.map | head -3
else
  echo "✅ No source maps in production build"
fi

echo ""
echo "=================================="
echo "Security Check Complete"
echo "=================================="
