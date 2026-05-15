# Toornify - Tournament Management Platform

A modern, feature-rich tournament management platform built with React, TypeScript, and Vite.

## Features

- 🏆 Tournament creation and management
- 👥 Team management and registration
- 🎮 Game integration
- 📊 Interactive bracket visualization
- 🔐 Multiple authentication methods (Email, Google, Discord)
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 📝 Content management with Sanity CMS

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend Integration
- RESTful API
- JWT authentication
- OAuth 2.0 (Google, Discord)

### CMS
- **Sanity CMS** - Content management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A backend server (API) running
- Google OAuth credentials (optional, for Google login)
- Discord OAuth credentials (optional, for Discord login)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sanity_react
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   # API Configuration
   VITE_API_URL=https://toornify-server.vercel.app
   VITE_LICHESS_API_URL=https://lichess.org
   VITE_LICHESS_CLIENT_ID=toornify-web
   VITE_LICHESS_OAUTH_SCOPES=email:read tournament:write
   
   # Sanity CMS
   VITE_SANITY_PROJECT_ID=your-project-id
   VITE_SANITY_DATASET=production
   VITE_SANITY_API_VERSION=2025-03-15
   
   # Google OAuth (optional)
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
   
   # Discord OAuth (optional)
   VITE_DISCORD_CLIENT_ID=your-discord-client-id
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Setting Up Google OAuth

For detailed instructions on setting up Google OAuth authentication, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md).

Quick steps:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Update environment variables
6. Test the authentication flow

## Project Structure

```
sanity_react/
├── public/              # Static assets
├── sanity/              # Sanity CMS schemas
│   └── schemas/         # Content type definitions
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable React components
│   │   └── ui/          # UI components (Button, Input, etc.)
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   │   ├── services/    # API service modules
│   │   ├── api-client.ts
│   │   └── api-config.ts
│   ├── pages/           # Page components
│   │   └── onboarding/  # Onboarding flow pages
│   └── utils/           # Helper functions
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The application supports three authentication methods:

### 1. Email/Password
Traditional authentication with email and password.

### 2. Google OAuth
Sign in with Google account. Requires Google OAuth credentials setup.

### 3. Discord OAuth
Sign in with Discord account. Requires Discord OAuth credentials setup.

For detailed authentication documentation, see [AUTHENTICATION.md](./AUTHENTICATION.md).

## API Integration

The frontend communicates with a RESTful backend API. API configuration is in `src/lib/api-config.ts`.

### Base URLs:
- Development: `http://localhost:8002` (or `VITE_API_URL`)
- Production: `https://toornify-server.vercel.app`

### Authentication:
API requests automatically include JWT tokens from localStorage. Token refresh is handled automatically on 401 responses.

### Lichess API integration:
- Base URL via `VITE_LICHESS_API_URL` (defaults to `https://lichess.org`)
- OAuth client id via `VITE_LICHESS_CLIENT_ID`
- OAuth scopes via `VITE_LICHESS_OAUTH_SCOPES`
- Optional token via `VITE_LICHESS_TOKEN` or runtime localStorage key `lichessToken`
- Service module: `src/lib/services/lichess.service.ts`
- Exported from: `src/lib/services/index.ts`

## State Management

- **Authentication State**: React Context (`AuthContext`)
- **Form State**: React Hook Form
- **Server State**: Direct API calls with Axios
- **Local State**: React useState/useReducer

## Styling

The project uses:
- Tailwind CSS for utility-first styling
- Custom components in `src/components/ui/`
- CSS modules for component-specific styles
- Framer Motion for animations

## CMS Integration

Content is managed through Sanity CMS:

- Blog posts and news articles
- Site settings and configuration
- Team member profiles
- Content types defined in `sanity/schemas/`

## Protected Routes

Routes that require authentication are wrapped with `ProtectedRoute`:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

Unauthenticated users are redirected to the sign-in page.

## Environment Modes

### Development
```bash
npm run dev
```
- Hot module replacement
- Source maps
- Development API URL
- Detailed error messages

### Production
```bash
npm run build
npm run preview
```
- Optimized bundle
- Minified code
- Production API URL
- Error tracking (if configured)

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard
4. Configure with `vercel.json` (already included)

### Deploy to Other Platforms

The built files in `dist/` can be deployed to:
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Any static hosting service

**Important:** Set environment variables on your hosting platform!

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### OAuth Login Not Working

1. Check environment variables are set correctly
2. Verify redirect URIs match in OAuth provider settings
3. Check browser console for errors
4. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed steps

### API Connection Issues

1. Verify `VITE_API_URL` is set correctly
2. Check backend server is running
3. Check CORS configuration on backend
4. Verify network connectivity

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript errors:
   ```bash
   npm run lint
   ```

3. Verify all environment variables are set

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Documentation

- [Authentication Setup](./AUTHENTICATION.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Backend Integration](./BRACKET_BACKEND_CHANGES.md)
- [Sanity Integration](./SANITY_INTEGRATION.md)

## License

[Your License Here]

## Support

For issues and questions:
- Check existing documentation
- Review closed issues
- Open a new issue with detailed information

---

**Built with ❤️ by the Toornify Team**
