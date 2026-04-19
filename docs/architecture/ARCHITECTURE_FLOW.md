# Architecture — Game Library App

---

## 1. Project Overview

**What it is:** A desktop-first web application for browsing and discovering video games, organized by platform (PlayStation, Xbox, PC, Nintendo, etc.).

**Core purpose:** Give users a rich, fast catalog experience — similar to romSphere or Filmflix — where they can explore games by console, search the full library, view game details, and access trailers and store links.

**Target user:** PC/console gamer who wants to browse a curated game library without the noise of a storefront. Primarily uses a large screen (1440px+).

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Client)                    │
│                                                     │
│  Next.js Pages (App Router)                         │
│  React Components  ←→  Zustand Stores               │
│  TanStack Query (client cache + data fetching)      │
│  /tiken (visual reference — Astro build)            │
└──────────────────┬──────────────────────────────────┘
                   │ fetch /api/*
┌──────────────────▼──────────────────────────────────┐
│              Next.js Server Layer                    │
│                                                     │
│  Route Handlers (app/api/)                          │
│  lib/rawgClient.ts  ←  RAWG_API_KEY (process.env)  │
│  lib/normalizer.ts  (raw → ViewModel)               │
│  lib/cache.ts       (unstable_cache + TTL)          │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────┐
│              External APIs                           │
│                                                     │
│  RAWG API (api.rawg.io)   — primary data source     │
│  YouTube Data API         — trailer embeds (future) │
│  Spotify API              — soundtracks (future)    │
└─────────────────────────────────────────────────────┘
```

### Frontend: Next.js 14 App Router
- Server Components by default; Client Components only when the browser is required (event handlers, `useState`, `useEffect`, browser APIs)
- `/tiken` is the compiled Astro/HTML visual reference used to extract the design system and layout patterns
- Tailwind CSS + shadcn/ui for styling and primitives
- TanStack Query for client-side data fetching and cache deduplication
- Zustand for global UI state (search query, active filter)

### Backend: Next.js API Routes
- All external API calls go through Route Handlers in `app/api/` — no client component calls RAWG directly
- `lib/rawgClient.ts` injects the API key from `process.env` and handles retry, timeout, and error mapping
- `lib/normalizer.ts` transforms raw RAWG JSON into typed ViewModels before any response is sent
- `lib/cache.ts` wraps `unstable_cache` with TTL constants per data type

### External APIs
| API | Use | Status |
|-----|-----|--------|
| RAWG | Game catalog, platforms, genres, screenshots, stores, trailers | Active |
| YouTube Data API | Trailer embeds on game detail page | Planned |
| Spotify API | Game soundtracks | Future (post-v1.0.0) |

---

## 3. Data Flow

### Game List (Home / Platform Section)
```
User selects platform in sidebar
  → filterStore updates platformId
  → useInfiniteGames(platformId) triggers TanStack Query
  → GET /api/games?platforms=18&page=1&page_size=40
  → Route Handler checks unstable_cache (TTL: 5 min)
    → MISS: rawgClient fetches RAWG /games endpoint
    → normalizer transforms raw → GameCardVM[]
    → cache stores result
  → GameCardVM[] returned to client
  → PlatformSection renders grid of GameCard components
```

### Game Detail
```
User clicks a GameCard → router.push(/games/[slug])
  → GET /api/games/[slug]
  → Route Handler runs 4 parallel fetches with Promise.allSettled:
    - /games/{id}           → game metadata
    - /games/{id}/screenshots → gallery images
    - /games/{id}/stores    → purchase links
    - /games/{id}/movies    → trailers (graceful empty if 404)
  → normalizer transforms each → GameDetailVM
  → 30-min cache stored
  → GameDetail page renders with SSR (SEO + Open Graph)
```

### Search (Command Palette)
```
User presses ⌘K → CommandPalette opens
User types "zelda"
  → useDebounce(300ms) fires
  → TanStack Query checks in-memory cache for "zelda"
    → MISS: GET /api/games?search=zelda&page_size=10
    → Route Handler → rawgClient → normalizer
    → 10 GameCardVM results returned
  → Palette displays game suggestions with cover thumbnails
User selects a game → router.push(/games/[slug])
```

### Trailer & Soundtrack Integration
- **Trailers:** RAWG `/games/{id}/movies` endpoint; embedded via YouTube iframe (no separate API call needed for RAWG-hosted trailers). YouTube iframe domain allowlisted in CSP.
- **Soundtracks:** Spotify API integration planned for post-v1.0.0. Will require a server-side OAuth flow — client secret never exposed.

### Caching Strategy
| Layer | Technology | Scope |
|-------|-----------|-------|
| L1: In-memory | TanStack Query | Per browser tab; deduplicates concurrent requests |
| L2: Server-side | `unstable_cache` | Shared across all users; reduces RAWG rate limit usage |
| L3: Edge CDN | Vercel Edge Cache / `Cache-Control` | For static and highly stable routes (platforms, genres) |

TTL per endpoint:
| Endpoint | TTL |
|----------|-----|
| `/api/games` (list/search) | 5 min |
| `/api/games/[slug]` (detail) | 30 min |
| `/api/platforms` | 24 h |
| `/api/genres` | 24 h |
| screenshots / stores | 30 min |
| trailers | 1 h |

---

## 4. Folder Structure

```
/                              ← Next.js project root
├── app/                       ← Next.js App Router pages and API routes
│   ├── page.tsx               ← Home: SSR with initial platform list
│   ├── games/
│   │   └── [slug]/
│   │       └── page.tsx       ← Game detail: SSR for SEO + OG metadata
│   └── api/
│       ├── games/
│       │   ├── route.ts       ← GET /api/games (list, search, filter, paginate)
│       │   └── [slug]/
│       │       └── route.ts   ← GET /api/games/[slug] (aggregated detail)
│       └── platforms/
│           └── route.ts       ← GET /api/platforms (24h cache)
│
├── components/                ← UI component tree
│   ├── CommandPalette/
│   │   ├── CommandPalette.tsx
│   │   └── useCommandPalette.ts
│   ├── GameCard/
│   │   ├── GameCard.tsx
│   │   └── GameCard.skeleton.tsx
│   ├── PlatformSection/
│   │   └── PlatformSection.tsx
│   └── GameDetail/
│       ├── GameDetail.tsx
│       ├── ScreenshotGallery.tsx
│       └── StoreLinks.tsx
│
├── lib/                       ← Server-only data layer
│   ├── rawgClient.ts          ← RAWG fetch client (API key, retry, timeout)
│   ├── normalizer.ts          ← raw RAWG JSON → typed ViewModels
│   ├── consoleSections.ts     ← Platform groupings for sidebar
│   ├── storeIdMap.ts          ← RAWG store_id → store name mapping
│   └── tikenCollections.ts    ← UI collection configs from /tiken reference
│
├── hooks/                     ← Shared React hooks
│   ├── useDebounce.ts         ← Debounce utility for search input
│   └── useGames.ts            ← TanStack Query hook for game data fetching
│
├── types/                     ← TypeScript type definitions
│   ├── rawg.ts                ← Raw RAWG API response shapes (do not use in UI)
│   └── viewModels.ts          ← GameCardVM, GameDetailVM, PlatformVM
│
├── tiken/                     ← Visual reference build (Astro/HTML output)
│   ├── index.html             ← Compiled reference UI
│   ├── api/                   ← Static data files from reference build
│   ├── images/                ← Reference assets
│   └── resources/             ← Reference stylesheets/scripts
│
├── public/                    ← Static assets served by Next.js
├── agents/                    ← Agent definitions (one file per role)
├── docs/                      ← Project documentation
│   ├── architecture/          ← System design docs
│   ├── planning/              ← Roadmap and issue tracking
│   ├── data/                  ← API and data layer docs
│   └── devops/                ← Release, versioning, CI docs
├── .env.example               ← Environment variable template (no real values)
├── next.config.ts             ← Next.js configuration (CSP headers, image domains)
├── tailwind.config.ts         ← Design tokens (colors, fonts, spacing)
└── tsconfig.json              ← TypeScript config with path aliases
```

---

## 5. Feature Modules

### Game Listing
- Platform sidebar with console icons (PS5, Xbox, PC, Nintendo Switch, etc.)
- Clicking a platform updates the active filter → `PlatformSection` re-renders
- 40 cards per page (RAWG max), infinite scroll with `IntersectionObserver`
- `GameCard` shows: cover image, title, release year, Metacritic score (if not null), platform icons

### Game Detail Page
- SSR-rendered for SEO and Open Graph metadata
- Hero image, title, description (sanitized RAWG HTML rendered as prose)
- Metacritic badge (only when not null)
- Screenshots gallery with lightbox (Client Component)
- Store links with icons (PlayStation Store, Steam, Xbox, Epic, etc.)
- Trailer embed when RAWG `/movies` returns results

### Search & Filters
- Command Palette triggered by `⌘K`
- Debounced input (300ms) → `/api/games?search=`
- Results list with cover thumbnails; keyboard navigable (↑↓ Enter Esc)
- URL param sync via `nuqs` (shareable search URLs)
- Filter by genre and ordering (future)

### Media Integration
- **Trailers:** Fetched from RAWG `/games/{id}/movies`. Low coverage (< 15% of catalog) — always handle empty array gracefully. Rendered as YouTube iframe in an isolated section.
- **Soundtracks (planned):** Spotify API will require a server-side OAuth flow. Spotify `client_secret` stays in `process.env` only. Client receives a Spotify embed token.

---

## 6. Scalability Strategy

### API Abstraction
All external API access goes through `lib/rawgClient.ts`. If RAWG is replaced or a second game data source is added, only this file and `lib/normalizer.ts` change — no component or Route Handler changes required.

### Caching
- `unstable_cache` with `revalidateTag` allows targeted cache invalidation without full deploys
- Platform and genre data cached for 24h — these rarely change and consume significant RAWG quota
- RAWG free tier: ~20,000 req/month. With 24h cache on stable endpoints, this comfortably supports hundreds of daily active users

### Future DB Integration
The normalizer pattern isolates the data transformation logic. When a database is added (e.g., for user libraries, favorites, or ratings), ViewModels remain unchanged — only the data source behind the Route Handlers changes. No component needs to know about the database.

### Infinite Scroll Architecture
`useInfiniteGames` uses TanStack Query's `useInfiniteQuery`. Adding a new filterable dimension (e.g., genre, year range) requires only adding a param to the query key and the Route Handler — no component restructuring.

---

## 7. Security Considerations

### API Key Handling
- `RAWG_API_KEY` lives only in `.env.local` (not committed) and `process.env` at runtime
- The key is injected by `lib/rawgClient.ts` on the server — never serialized to the client
- `.env.example` contains placeholder values only; verified in CI
- Rule enforced by ESLint: `no-restricted-imports` prevents any component from importing `lib/rawgClient.ts` or `types/rawg.ts`

### XSS Prevention
- RAWG game descriptions are raw HTML — always sanitized with `sanitize-html` before rendering
- Only semantic HTML tags allowed (no `<script>`, no inline `style`, no `<iframe>`)
- YouTube embeds use `youtube-nocookie.com` domain; CSP restricts iframe sources

### Input Validation
- All Route Handler params validated with Zod before reaching any external API call
- `slug` validated as non-empty string; `page` and `page_size` validated as positive integers

### Content Security Policy
Configured in `next.config.ts`:
```
Content-Security-Policy:
  default-src 'self';
  img-src 'self' media.rawg.io data:;
  frame-src https://www.youtube-nocookie.com;
  script-src 'self' 'unsafe-inline';
```

### Rate Limiting
- Server-side `unstable_cache` prevents repeated RAWG calls from the same data request
- RAWG 429 responses handled with exponential backoff in `rawgClient.ts`
- Consider adding Vercel Edge rate limiting on `/api/*` routes before public launch

---

## 8. Deployment Strategy

### Platform: Vercel
- **Production:** `main` branch → auto-deploy to production URL
- **Preview:** Every PR → auto-deploy to a preview URL (used by QA Tester for validation)
- **Environment variables:** Set in Vercel dashboard per environment (never in code)

### Environment Separation
| Environment | Branch | Purpose |
|-------------|--------|---------|
| Development | local | `npm run dev` with `.env.local` |
| Preview | feature branches | Vercel preview per PR |
| Production | `main` | Vercel production deploy |

### Build Verification
- `npm run build` must pass before any PR merges (enforced by GitHub Actions CI)
- Lighthouse scores checked post-deploy: Performance ≥ 85, Accessibility ≥ 90
- Bundle size tracked with `@next/bundle-analyzer`; no new dependency > 50kB without review

### Rollback Strategy
- Vercel instant rollback to previous successful deploy via dashboard
- Git tags mark every production release — `git checkout v1.x.x` for emergency hotfixes
- No `git push --force` on `main` — all changes via PRs

---

## Server vs Client Component Reference

```
app/page.tsx                    → Server Component (SSR, SEO)
  ├── PlatformSidebar           → Server Component (stable data, no interaction)
  └── GameGrid                  → Server Component (SSR initial render)
       └── GameCard             → Client Component (hover prefetch, skeleton)

app/games/[slug]/page.tsx       → Server Component (SSR, OG metadata)
  ├── ScreenshotGallery         → Client Component (lightbox, focus trap)
  ├── StoreLinks                → Server Component (static links)
  └── TrailerEmbed              → Client Component (YouTube iframe)

CommandPalette                  → Client Component (⌘K, keyboard nav, debounce)
```

> Rule: a component is a Server Component by default. It becomes a Client Component only when it requires `useState`, `useEffect`, event handlers, or browser APIs.
