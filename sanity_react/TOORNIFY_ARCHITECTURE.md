# Toornify — CTO-Level Architecture Knowledge

> **Last updated:** May 2026  
> **Repo:** `nitishmeswal/toornify`  
> **Status:** Beta (pre-launch)

---

## 1. What Is Toornify?

Toornify is an **esports tournament management platform** — think "Challonge meets Discord meets Lichess." It lets:

- **Players** register, join teams, compete in tournaments, and chat in real-time
- **Organisers** create & manage tournaments with brackets, prizes, and scheduling
- **Creators** build content profiles and connect with the esports community

The platform also integrates with **Lichess** (chess platform) for tournament federation and with **Sanity CMS** for blog/news content.

---

## 2. High-Level Architecture Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TOORNIFY SYSTEM MAP                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────── FRONTEND (sanity_react/) ──────────────────┐     │
│  │                                                            │     │
│  │  React 19 + TypeScript + Vite 7                           │     │
│  │  ┌────────────────────────────────────────────────┐       │     │
│  │  │              App Router (react-router v7)       │       │     │
│  │  │  /              → Home (Hero + Features)        │       │     │
│  │  │  /tournaments   → Tournament listings           │       │     │
│  │  │  /tournaments/:id → Tournament detail           │       │     │
│  │  │  /teams         → Team browser                  │       │     │
│  │  │  /teams/:id     → Team detail                   │       │     │
│  │  │  /bracket       → Bracket listings              │       │     │
│  │  │  /bracket/:id   → Bracket viewer                │       │     │
│  │  │  /games         → Game catalogue                │       │     │
│  │  │  /blogs         → Sanity-powered blog           │       │     │
│  │  │  /blogs/:slug   → Blog post (from Sanity CMS)  │       │     │
│  │  │  /news          → GNews API-powered news        │       │     │
│  │  │  /about-us      → About page                    │       │     │
│  │  │  /sign-in       → Auth (email/Google/Discord)   │       │     │
│  │  │  /sign-up       → Registration                  │       │     │
│  │  │  /auth/callback → OAuth callback handler        │       │     │
│  │  │  /dashboard     → User dashboard (protected)    │       │     │
│  │  │  /admin         → Admin panel (protected)       │       │     │
│  │  │  /studio/*      → Sanity Studio (protected)     │       │     │
│  │  │  /onboarding/*  → Role-based onboarding         │       │     │
│  │  │  /users/:id     → Public user profile           │       │     │
│  │  └────────────────────────────────────────────────┘       │     │
│  │                                                            │     │
│  │  State: AuthContext (user/JWT) + SocketContext (chat)      │     │
│  │  Styling: Tailwind CSS + Framer Motion + GSAP             │     │
│  │  UI: Radix UI primitives + custom components              │     │
│  │  API Layer: Axios apiClient with JWT interceptors         │     │
│  │  CMS: Sanity Client for blogs/content                     │     │
│  │  Chess: Lichess OAuth + API integration                   │     │
│  │                                                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│       │              │                │                             │
│       │ REST/HTTP    │ WebSocket      │ Sanity CDN                 │
│       ▼              ▼                ▼                             │
│  ┌─────────── BACKEND (toornify_server/) ─────────────────┐       │
│  │                                                         │       │
│  │  Node.js + Express 5 (ES Modules)                      │       │
│  │  ┌───────────────────────────────────────────────┐     │       │
│  │  │          API Routes (/api/v1/...)              │     │       │
│  │  │                                                │     │       │
│  │  │  /auth     → signup, signin, signout,          │     │       │
│  │  │              Google OAuth, Discord OAuth        │     │       │
│  │  │  /users    → profile CRUD, role-based update   │     │       │
│  │  │  /tournaments → CRUD + registration + visibility│    │       │
│  │  │  /teams    → CRUD + logo upload + filtering    │     │       │
│  │  │  /brackets → CRUD + match management           │     │       │
│  │  │              (single/double elim + round robin)  │    │       │
│  │  │  /games    → game catalogue read               │     │       │
│  │  │  /players  → player listing                    │     │       │
│  │  │  /chat     → REST chat endpoints               │     │       │
│  │  │  /news     → GNews API proxy                   │     │       │
│  │  └───────────────────────────────────────────────┘     │       │
│  │                                                         │       │
│  │  Auth: JWT (access + refresh tokens) + Passport.js      │       │
│  │  WebSocket: Socket.IO (chat rooms + real-time messages) │       │
│  │  File Upload: Multer (disk storage → /public/)          │       │
│  │  Views: EJS (legacy server-rendered pages)              │       │
│  │  Middleware: verifyJWT + errorHandler                    │       │
│  │                                                         │       │
│  └─────────────────────────────────────────────────────────┘       │
│       │                                                             │
│       ▼                                                             │
│  ┌──────────── DATABASE ──────────────────────────────────┐        │
│  │  MongoDB (via Mongoose ODM)                             │        │
│  │                                                         │        │
│  │  Collections:                                           │        │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐    │        │
│  │  │  UserModel   │ │  Tournament  │ │  TeamModel   │    │        │
│  │  │  (auth,role) │ │  (full CRUD) │ │  (players)   │    │        │
│  │  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘    │        │
│  │         │               │                │              │        │
│  │  ┌──────┴──────┐ ┌─────┴────────┐ ┌────┴─────────┐   │        │
│  │  │  PlayerModel│ │   Bracket    │ │    Games      │   │        │
│  │  │  (profile)  │ │  (matches)   │ │  (catalogue)  │   │        │
│  │  └─────────────┘ └──────────────┘ └──────────────┘    │        │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐   │        │
│  │  │ OrganiserMdl│ │   Creator    │ │    Chat      │   │        │
│  │  │ (KYC,brand) │ │  (content)   │ │  (messages)  │   │        │
│  │  └─────────────┘ └──────────────┘ └──────────────┘    │        │
│  │  ┌─────────────┐                                       │        │
│  │  │   Address   │                                       │        │
│  │  │  (location) │                                       │        │
│  │  └─────────────┘                                       │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                     │
│  ┌──────────── EXTERNAL SERVICES ─────────────────────────┐        │
│  │  • Sanity CMS     → Blog posts, team bios, site config │        │
│  │  • Lichess API    → Chess tournaments, accounts, games  │        │
│  │  • GNews API      → Esports news feed                  │        │
│  │  • Google OAuth   → Social login                        │        │
│  │  • Discord OAuth  → Social login                        │        │
│  │  • Vercel         → Frontend deployment                 │        │
│  │  • Azure App Svc  → Backend deployment                  │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                     │
│  ┌──────────── DEPLOYMENT ────────────────────────────────┐        │
│  │  Frontend: Vercel (sanity_react/)                       │        │
│  │  Backend:  Azure App Service OR Vercel Serverless       │        │
│  │  Prod URLs:                                             │        │
│  │    Frontend → toornify.com                              │        │
│  │    Backend  → toornify.azurewebsites.net                │        │
│  │              toornify-server.vercel.app (fallback)      │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Deep-Dive (sanity_react/)

### 3.1 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | 5.9 |
| Build | Vite + SWC | 7.2 |
| Routing | react-router-dom | 7.11 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion + GSAP | 12.24 / 3.14 |
| UI Primitives | Radix UI (Dialog, Dropdown, Select, Tabs, Toast, Tooltip, etc.) | latest |
| Forms | React Hook Form + Zod | 7.70 / 4.3 |
| HTTP | Axios | 1.13 |
| Real-time | Socket.IO Client | 4.8 |
| CMS | Sanity Client | 7.14 |
| Icons | Lucide React + Tabler Icons + React Icons | mixed |
| 3D | Three.js | 0.167 |

### 3.2 Directory Structure

```
sanity_react/
├── src/
│   ├── App.tsx              ← Main router (lazy-loaded pages)
│   ├── main.tsx             ← Entry point (StrictMode)
│   ├── index.css            ← Global styles + Tailwind directives
│   ├── App.css              ← App-level styles
│   │
│   ├── components/          ← 30+ components
│   │   ├── Layout.tsx       ← Shell: Navbar + children + Footer (skips studio routes)
│   │   ├── Navbar.tsx       ← Responsive nav, auth-aware, dropdown profile
│   │   ├── Footer.tsx       ← Links, social icons
│   │   ├── HeroSection.tsx  ← Landing hero with email capture + GradientText + GlitchText
│   │   ├── FeatureSection.tsx ← Discord + Globe feature cards
│   │   ├── BackgroundEffects.tsx ← Animated background particles
│   │   ├── ProtectedRoute.tsx   ← JWT guard + onboarding redirect
│   │   ├── OnboardingLayout.tsx ← Role-specific onboarding wrapper
│   │   ├── GlobalChat.tsx   ← Real-time Socket.IO chat widget
│   │   ├── P2PChat.tsx      ← P2P direct messaging
│   │   ├── BracketVisualization.tsx ← Tournament bracket renderer
│   │   ├── CustomBracket.tsx    ← Interactive bracket builder
│   │   │
│   │   ├── [Effect Components] ← Visual effects (JSX)
│   │   │   ├── BorderGlow.jsx   ← Mouse-tracking glow border
│   │   │   ├── GlitchText.jsx  ← Glitch animation text
│   │   │   ├── GradientText.jsx ← Animated gradient text
│   │   │   ├── LightPillar.jsx ← Light beam effect
│   │   │   ├── LiquidEther.jsx ← WebGL fluid background
│   │   │   └── StarBorder.jsx  ← Animated star border
│   │   │
│   │   ├── [Modal Components]
│   │   │   ├── CreateTournamentModal.tsx
│   │   │   ├── CreateTeamModal.tsx
│   │   │   ├── CreateBracketModal.tsx
│   │   │   ├── EditMatchModal.tsx
│   │   │   ├── TournamentRegistrationModal.tsx
│   │   │   └── UpdateRoleModal.tsx
│   │   │
│   │   └── ui/              ← Reusable design system
│   │       ├── Button.tsx, Card.tsx, Input.tsx, Select.tsx
│   │       ├── Checkbox.tsx, FileUpload.tsx, Loader.tsx
│   │       └── DropdownMenu.tsx
│   │
│   ├── pages/               ← Route-level components (all lazy-loaded)
│   │   ├── Home.tsx         ← Hero + Features + LiquidEther background
│   │   ├── Tournaments.tsx  ← Tournament browser with filters
│   │   ├── TournamentDetails.tsx ← Single tournament view
│   │   ├── Teams.tsx        ← Team browser
│   │   ├── TeamView.tsx     ← Single team view
│   │   ├── Bracket.tsx      ← Bracket listings
│   │   ├── BracketDetail.tsx ← Single bracket view + match editing
│   │   ├── Games.tsx        ← Game catalogue
│   │   ├── Blogs.tsx / BlogDetail.tsx ← Sanity CMS blog
│   │   ├── News.tsx         ← GNews-powered news feed
│   │   ├── AboutUs.tsx      ← Team + company info
│   │   ├── SignIn.tsx / SignUp.tsx ← Auth pages
│   │   ├── OAuthCallback.tsx ← OAuth redirect handler
│   │   ├── Dashboard.tsx    ← User dashboard (protected)
│   │   ├── AdminPanel.tsx   ← Admin panel (protected)
│   │   ├── Studio.tsx       ← Sanity Studio embed (protected)
│   │   ├── UserProfile.tsx  ← Public profile view
│   │   ├── SelectRole.tsx   ← Onboarding role picker
│   │   └── onborading/      ← Role-specific onboarding forms
│   │       ├── Player.tsx
│   │       ├── Organiser.tsx
│   │       └── Creator.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx   ← JWT auth state, sign-in/up/out, user refresh
│   │   └── SocketContext.tsx ← Socket.IO connection, rooms, chat messages
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts, useLocalStorage.ts, useMediaQuery.ts
│   │   ├── usePageTracking.ts, usePagination.ts
│   │   ├── useTeams.ts, useTournaments.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── api-client.ts    ← Axios instance with JWT interceptors + token refresh
│   │   ├── api-config.ts    ← All API endpoints + env-aware URL resolution
│   │   ├── sanity-client.ts ← Sanity CMS client
│   │   ├── utils.ts         ← Utility functions (cn, avatar helpers)
│   │   └── services/        ← Service layer (one per domain)
│   │       ├── auth.service.ts       ← Sign up/in/out + Lichess OAuth + token mgmt
│   │       ├── tournament.service.ts ← Tournament CRUD + registration
│   │       ├── team.service.ts       ← Team CRUD + logo upload
│   │       ├── bracket.service.ts    ← Bracket CRUD + match editing
│   │       ├── game.service.ts       ← Game catalogue
│   │       ├── user.service.ts       ← Profile CRUD
│   │       ├── news.service.ts       ← GNews proxy
│   │       ├── sanity.service.ts     ← Sanity CMS queries
│   │       ├── lichess.service.ts    ← Full Lichess API (850+ lines)
│   │       ├── leeches.service.ts    ← Additional Lichess helpers
│   │       └── index.ts             ← Re-exports all services
│   │
│   ├── utils/
│   │   ├── analytics.ts    ← GA4 page tracking
│   │   ├── cn.ts           ← clsx + twMerge utility
│   │   └── logger.ts       ← Console logger wrapper
│   │
│   └── types/               ← Module declarations for JSX components
│
├── sanity/schemas/           ← Sanity CMS content types
│   ├── post.ts, news.ts, author.ts, category.ts
│   ├── teamMember.ts, siteSettings.ts
│   └── index.ts
│
├── tailwind.config.js        ← shadcn/ui-style CSS variable tokens
├── vite.config.ts            ← SWC plugin + @ alias + proxy + terser
├── vercel.json               ← Vercel deployment config
└── .env.example              ← All env vars documented
```

### 3.3 How Auth Works (Frontend)

```
User clicks Sign In
        │
        ├── Email/Password → POST /api/v1/auth/signin
        │   Returns: { authToken, refreshToken, loggedInUser }
        │   Stored in: localStorage (authToken, refreshToken, user)
        │
        ├── Google OAuth → Redirect to /api/v1/auth/google
        │   Server redirects to Google → callback → redirects to /auth/callback?token=...
        │   OAuthCallback.tsx parses URL params → stores tokens
        │
        └── Discord OAuth → Same flow via /api/v1/auth/discord
        
On every API call:
  apiClient interceptor adds: Authorization: Bearer <authToken>
  
On 401 response:
  If TokenExpiredError → clear tokens → redirect to /sign-in
  Else → attempt refresh via POST /auth/refresh-token
  If refresh fails → clear tokens → redirect to /sign-in
```

### 3.4 How Real-time Chat Works

```
SocketContext mounts → connects to Socket.IO server
  │
  joinRoom(roomId)    → socket.emit("join room", roomId)
                      → socket.emit("get history", roomId)
  │
  Server responds     → "chat history" event (full message array)
  │
  sendMessage(...)    → socket.emit("chat message", { room, message, sender, senderId })
  │
  Server broadcasts   → "chat message" event to all room members
  │
  Messages stored in MongoDB "Chat" collection
```

---

## 4. Backend Deep-Dive (toornify_server/)

### 4.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 8.14 |
| Auth | JWT (jsonwebtoken) + Passport.js |
| OAuth | passport-google-oauth20 + passport-discord |
| Real-time | Socket.IO 4.8 |
| File Upload | Multer (disk storage) |
| Password | bcrypt |
| Views | EJS (legacy) |
| HTTP Client | Axios (for GNews proxy) |

### 4.2 Directory Structure

```
toornify_server/
├── index.js              ← Entry point: loads env → connectDB → createServer → initSockets
├── app.js                ← Express app: middleware + routes + error handler
├── config/
│   └── env.js            ← dotenv + env validation (DB_URL, tokens)
│
├── models/               ← Mongoose schemas (9 models)
│   ├── users.models.js   ← Core user (auth, roles, JWT methods)
│   ├── tournament.model.js ← Tournament (dates, teams, brackets, prizes)
│   ├── team.models.js    ← Team (players, game, owner)
│   ├── brackets.model.js ← Bracket (matches, format, teams)
│   ├── games.models.js   ← Game catalogue (name, category, genre)
│   ├── chat.models.js    ← Chat messages (room, sender, message)
│   ├── player.models.js  ← Extended player profile (game profiles, education)
│   ├── organizer.models.js ← Organiser profile (KYC, branding, payout)
│   ├── creator.models.js ← Creator profile (socials, experience)
│   └── address.models.js ← User address
│
├── controllers/          ← Business logic (10 controllers)
│   ├── auth.controllers.js    ← register, login, signOut, Google/Discord callbacks
│   ├── users.controller.js    ← profile CRUD, role-based profile creation
│   ├── tournaments.controller.js ← CRUD + status calculation + registration
│   ├── teams.controllers.js   ← CRUD + filtering + logo upload
│   ├── brackets.controller.js ← CRUD + bracket generation algorithms
│   ├── games.controllers.js   ← Game listing + by-id
│   ├── players.controllers.js ← All-players listing
│   ├── chat.controllers.js    ← REST send/history endpoints
│   ├── news.controllers.js    ← GNews API proxy
│   └── products.controllers.js ← Empty placeholder
│
├── routes/               ← Express routers (9 route files)
│   ├── auth.routes.js    ← Conditional OAuth route registration
│   ├── users.routes.js   ← Protected user endpoints
│   ├── tournaments.routes.js ← Multer upload + CRUD
│   ├── teams.routes.js   ← Team CRUD + logo upload
│   ├── brackets.routes.js ← Bracket CRUD + match management
│   ├── games.routes.js   ← Public game endpoints
│   ├── players.routes.js ← Public player listing
│   ├── chat.routes.js    ← REST chat
│   └── news.routes.js    ← News proxy
│
├── middlewares/
│   ├── auth.middlewares.js ← JWT verification (verifyJWT)
│   └── error.middlewares.js ← Global error handler
│
├── utils/
│   ├── asyncHandler.js   ← try/catch wrapper for async controllers
│   ├── ApiResponse.js    ← Standard success response
│   ├── ApiErrorResponse.js ← Standard error response
│   ├── helper.js         ← extractInput() + generateAccessAndRefreshToken()
│   └── passport.config.js ← Google + Discord strategy setup
│
├── sockets/
│   └── index.js          ← Socket.IO event handlers (join room, chat, history)
│
├── views/                ← Legacy EJS templates (home, about, test)
├── public/               ← Static file serving (uploads)
│
├── Toornify-API-Complete.postman_collection.json ← Full API docs
├── Toornify-Tournaments.postman_collection.json
├── .github/workflows/    ← CI/CD (Azure App Service + optimizations)
└── vercel.json           ← Vercel serverless config
```

### 4.3 API Endpoint Map

| Method | Endpoint | Auth? | Purpose |
|--------|----------|-------|---------|
| POST | `/api/v1/auth/signup` | No | Register user (email/password) |
| POST | `/api/v1/auth/signin` | No | Login (returns JWT) |
| POST | `/api/v1/auth/signout` | JWT | Logout (clears cookies) |
| GET | `/api/v1/auth/methods` | No | Available auth methods |
| GET | `/api/v1/auth/google` | No | Google OAuth initiation |
| GET | `/api/v1/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/v1/auth/discord` | No | Discord OAuth initiation |
| GET | `/api/v1/auth/discord/callback` | No | Discord OAuth callback |
| GET | `/api/v1/users/user-details` | JWT | Current user profile |
| GET | `/api/v1/users/user-by-id/:id` | No | Public user profile |
| GET | `/api/v1/users/getAllUsers` | No | All users listing |
| POST | `/api/v1/users/update-profile` | JWT | Role-based profile update (Player/Organiser/Creator) |
| GET | `/api/v1/tournaments/getTournaments` | No | All tournaments (with status calc) |
| GET | `/api/v1/tournaments/getTournamentById/:id` | No | Single tournament detail |
| POST | `/api/v1/tournaments/createTournament` | JWT | Create tournament (with file uploads) |
| POST | `/api/v1/tournaments/registerForTournament` | JWT | Register for tournament |
| POST | `/api/v1/tournaments/updateVisibility` | JWT | Toggle public/private |
| GET | `/api/v1/teams/getTeams` | No | All teams (with filters) |
| GET | `/api/v1/teams/fetchUserTeams` | JWT | Current user's teams |
| POST | `/api/v1/teams/createTeam` | JWT | Create team |
| POST | `/api/v1/teams/uploadTeamLogo` | JWT | Upload team logo |
| PUT | `/api/v1/teams/updateTeam/:id` | JWT | Update team |
| DELETE | `/api/v1/teams/deleteTeam/:id` | JWT | Delete team |
| GET | `/api/v1/brackets/getBrackets` | No | All brackets |
| GET | `/api/v1/brackets/getBracketById/:id` | No | Single bracket |
| POST | `/api/v1/brackets/createBracket` | JWT | Create bracket |
| PUT | `/api/v1/brackets/updateBracketMatch/:id` | JWT | Update match result |
| DELETE | `/api/v1/brackets/deleteBracket/:id` | JWT | Delete bracket |
| GET | `/api/v1/games/getGames` | No | All games |
| GET | `/api/v1/games/getGameById/:id` | No | Single game |
| GET | `/api/v1/players` | No | All players (actually all users) |
| GET | `/api/v1/news` | No | GNews proxy |
| POST | `/api/v1/chat` | No | Send chat message |
| GET | `/api/v1/chat/:room` | No | Chat history |
| GET | `/health` | No | Health check (DB status) |

### 4.4 Data Model Relationships

```
UserModel (core identity)
    │
    ├── 1:1 → PlayerModel   (extended profile: game profiles, education)
    ├── 1:1 → OrganiserModel (KYC, branding, payout details)
    ├── 1:1 → Creator        (socials, niche, experience)
    ├── 1:1 → Address        (location)
    │
    ├── 1:N → TeamModel      (as owner)
    ├── N:M → TeamModel      (as player member)
    ├── N:M → Tournament     (as participant)
    ├── N:M → Games          (games played)
    └── 1:N → Bracket        (as creator)

Tournament
    ├── N:1 → UserModel      (organizerId)
    ├── N:1 → Games          (gameId)
    ├── N:M → UserModel      (participants)
    └── 1:N → Bracket        (brackets)

TeamModel
    ├── N:1 → UserModel      (owner)
    ├── N:M → UserModel      (players)
    └── N:1 → Games          (game)

Bracket
    ├── N:1 → Tournament     (tournament_id)
    ├── N:1 → UserModel      (userId / creator)
    └── embeds → Match[]     (round, team1, team2, winner)

Chat
    └── indexed by room (string-based room names)
```

### 4.5 User Roles

| Role | Capabilities |
|------|-------------|
| `user` | Default. Can browse, register for tournaments |
| `player` | Extended profile with game profiles, team membership |
| `organiser` | Create tournaments, manage brackets, KYC verification |
| `creator` | Content creator profile (socials, portfolio) |
| `admin` | Full platform access (AdminPanel) |

### 4.6 Bracket Generation Algorithms

The backend includes three bracket generation algorithms:

1. **Single Elimination**: Standard knockout. `ceil(log2(n))` rounds, byes for odd team counts.
2. **Double Elimination**: Winners bracket + losers bracket + grand final. `2n - 2` total matches.
3. **Round Robin**: Every team plays every other team. `n(n-1)/2` total matches.

---

## 5. External Integrations

### 5.1 Sanity CMS
- **Used for**: Blog posts, team member bios, site settings
- **Schemas**: post, news, author, category, teamMember, siteSettings
- **Access**: Read via Sanity Client in frontend; Studio embedded at `/studio`

### 5.2 Lichess Integration (Extensive)
- **OAuth PKCE flow** for user authentication with Lichess
- **Arena tournaments**: create, join, monitor status, view results
- **Broadcast**: top broadcasts listing
- **Player data**: account profile, email, game exports
- **Bracket generation** from arena results
- **855+ lines** of typed service code

### 5.3 GNews API
- Proxied through backend (`/api/v1/news`)
- Searches esports news by query, language, country
- **Note**: API key is hardcoded in `news.controllers.js` (security issue)

---

## 6. Known Issues & Technical Debt

### Critical
1. **Hardcoded API key** in `news.controllers.js` (GNews API key exposed in source)
2. **`cors: origin: "*"`** — Wide-open CORS in production (security risk)
3. **Session secret fallback** — `"your-secret-key"` used if env var missing
4. **No rate limiting** on any endpoints
5. **No input sanitization** — extractInput() passes raw user input to DB queries

### Architecture Issues
6. **Mixed file types** — JSX and TSX components coexist (BorderGlow, GlitchText, etc. are JSX)
7. **`_id` vs `id` inconsistency** — Frontend has dual id fields throughout AuthContext
8. **`players.controllers.js` returns ALL users** — Not filtered to actual player role
9. **Empty `constants.js`** and `products.controllers.js` — Dead code
10. **Backup files committed** — `auth.service.ts.backup` in repo
11. **Typo in folder name** — `onborading/` should be `onboarding/`
12. **`.idea/` committed** — IDE config in git

### Frontend Issues
13. **Excessive console.logs** in auth service (debugging left in)
14. **Duplicate services** — `leeches.service.ts` seems like a typo of `lichess.service.ts`
15. **No error boundaries** — App will white-screen on unhandled errors
16. **No loading states** on many pages
17. **Feature section hardcodes "Sanity Gaming"** — Should say "Toornify"

### Backend Issues
18. **No pagination** on most listing endpoints (tournaments, teams, players)
19. **File uploads stored on disk** — Won't persist across serverless deploys on Vercel
20. **Tournament status calculated on every GET** — Should be a scheduled job or stored field
21. **No soft delete** — Hard deletes throughout

---

## 7. Environment Variables

### Frontend (.env)
| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8002` |
| `VITE_API_URL_PROD` | Production API URL | `https://toornify-server.vercel.app` |
| `VITE_LICHESS_API_URL` | Lichess API | `https://lichess.org` |
| `VITE_LICHESS_CLIENT_ID` | Lichess OAuth client | `toornify-web` |
| `VITE_OAUTH_REDIRECT_URI` | OAuth callback | `http://localhost:5173/auth/callback` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth | — |
| `VITE_DISCORD_CLIENT_ID` | Discord OAuth | — |
| `VITE_SANITY_PROJECT_ID` | Sanity project | — |
| `VITE_SANITY_DATASET` | Sanity dataset | `production` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics | — |

### Backend (.env)
| Variable | Purpose | Required |
|----------|---------|----------|
| `DB_URL` | MongoDB connection string | Yes |
| `ACCESS_TOKEN_SECRET` | JWT signing key | Yes |
| `REFRESH_TOKEN_SECRET` | JWT refresh signing key | Yes |
| `PORT` | Server port | No (default: 3000) |
| `CORS_ORIGIN` | Allowed origins | No |
| `SESSION_SECRET` | Express session secret | No |
| `FRONTEND_URL` | OAuth redirect base | No |
| `SERVER_URL` | Backend public URL | No |
| `GOOGLE_CLIENT_ID` | Google OAuth | No (disables Google login) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | No |
| `DISCORD_CLIENT_ID` | Discord OAuth | No (disables Discord login) |
| `DISCORD_CLIENT_SECRET` | Discord OAuth | No |

---

## 8. Deployment Architecture

```
GitHub Repo
    │
    ├── sanity_react/ → Vercel (static SPA)
    │   ├── Build: tsc -b && vite build
    │   ├── Output: dist/
    │   └── vercel.json: rewrites all routes to index.html
    │
    └── toornify_server/ → Azure App Service OR Vercel Serverless
        ├── Start: node index.js
        ├── CI/CD: .github/workflows/azure-app-service.yml
        └── vercel.json: rewrites /api/* to index.js
```

---

## 9. Frontend Revamp Assessment

### Current State
The current frontend has a **dark gaming aesthetic** with purple gradients, glassmorphism effects, and animated backgrounds (LiquidEther WebGL). It uses custom JSX effect components that aren't typed and mix with the TypeScript codebase. The design is functional but lacks the polish, consistency, and interaction quality of an Awwwards-level site.

### What Needs to Change for Awwwards Quality
1. **Design System Overhaul**: Move from ad-hoc Tailwind classes to a proper token-based design system
2. **Typography**: Professional font pairing (currently using system defaults)
3. **Motion Design**: Cohesive scroll-driven animations (GSAP ScrollTrigger is already installed)
4. **Component Library**: Upgrade from scattered Radix primitives to a unified shadcn/ui system
5. **Page Transitions**: Smooth route transitions (currently just lazy-load flash)
6. **Micro-interactions**: Hover states, loading skeletons, toast feedback
7. **Layout**: Move from basic grid to intentional whitespace + editorial layouts
8. **3D/WebGL**: Enhance or replace LiquidEther with something more on-brand
9. **Responsive Excellence**: Currently responsive but not beautifully responsive
10. **Performance**: Optimize bundle size, lazy-load heavy components, reduce JS payload

---

## 10. About the UI/UX Skill Repo

The **[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** repo is a design intelligence toolkit. It includes:

- **67 UI styles** (glassmorphism, minimalism, brutalism, etc.)
- **161 color palettes** by product type
- **57 font pairings** with Google Fonts imports
- **99 UX guidelines** and best practices
- **25 chart types** with library recommendations
- **Stack-specific guidance** for React, Next.js, Tailwind, shadcn/ui, etc.

**Verdict: Yes, this is useful for the revamp.** The search scripts can provide data-driven design decisions — style recommendations, color palettes, typography pairings, and UX patterns specifically suited for an esports/gaming platform. We can use it to generate a design system before writing any code.

---

*This document gives you the complete CTO-level picture. When you're ready to share your frontend vision, I'll use this knowledge + the UI/UX toolkit to build an Awwwards-worthy implementation plan.*
