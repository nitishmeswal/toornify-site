---
name: testing-auth
description: Test the authentication (signup/signin) flow end-to-end on toornify-site. Use when verifying auth UI or API changes.
---

# Testing Auth Flow — toornify-site

## Environment

- **Frontend (production):** https://toornify-site.vercel.app
- **Backend:** https://toornify.azurewebsites.net
- **Signup page:** `/sign-up`
- **Signin page:** `/sign-in`
- **Frontend source:** `sanity_react/src/`

## Key Files

- `sanity_react/src/lib/services/auth.service.ts` — auth API calls (`signUp`, `signIn`, `parseAuthResponse`)
- `sanity_react/src/context/AuthContext.tsx` — auth state management, token storage
- `sanity_react/src/pages/SignUp.tsx` — signup form UI
- `sanity_react/src/pages/SignIn.tsx` — signin form UI
- `sanity_react/src/lib/api-client.ts` — axios instance with interceptors

## Backend Error Handling Pattern

The backend returns **HTTP 200** for business errors (e.g., duplicate signup) with:
```json
{"statusCode": 403, "data": {}, "message": "User Already Exists!", "success": false}
```

The frontend must check `response.data.success === false` before trying to parse user data. If this check is missing, the empty `data: {}` causes a generic "Invalid response structure" error instead of surfacing the real message.

## Test Scenarios

### 1. Duplicate Signup (Error Path)
- Use a known existing email (e.g., `nitishmeswal@gmail.com`)
- Fill all fields: name, email, password, confirm password, role (Player is default)
- Check the "I agree to Terms" checkbox
- Click "Create Account"
- **Expected:** Error banner shows backend message (e.g., "User Already Exists!")
- **Red flag:** If it shows "Invalid response structure from server" — the success check might be broken

### 2. New Account Signup (Happy Path)
- Generate a unique email: `devintest_<timestamp>@example.com`
- Fill all fields with valid data (password >= 6 chars)
- Check terms checkbox
- Click "Create Account"
- **Expected:** Redirects to home page (`/`) with "Dashboard" button in header (authenticated)
- The signup auto-authenticates and the `useEffect` in SignUp.tsx redirects authenticated users

### 3. Sign-In with Existing Account
- Clear localStorage first: `localStorage.clear()` in browser console
- Navigate to `/sign-in`
- Enter valid credentials
- Click "Log In"
- **Expected:** Redirects to home page with "Dashboard" button visible

## Tips

- To verify the backend is reachable, curl it directly:
  ```bash
  curl -s -X POST https://toornify.azurewebsites.net/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"nitishmeswal@gmail.com","password":"test1234"}'
  ```
- The Vercel preview deployments follow the pattern: `toornify-site-git-<branch>-nitishmeswals-projects.vercel.app`
- Error messages in SignUp.tsx are extracted at lines 87-99 in the catch block
- Error messages in SignIn.tsx are extracted at lines 65-72
- To log out for testing: `localStorage.clear()` then navigate to `/sign-in`
- The backend might be slow to respond (Azure cold starts) — wait up to 10s for API responses

## Devin Secrets Needed

No secrets required — the backend is publicly accessible and test accounts can be created with any email.
