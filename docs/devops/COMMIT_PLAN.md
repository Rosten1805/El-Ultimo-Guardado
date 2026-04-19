# Plan de Commits Atómicos — Game Library MVP
> Conventional Commits · Next.js 14 · RAWG API · Inspirada en romSphere

---

## Tabla de Commits

| # | Commit | Tipo | Scope | Tag | Riesgo |
|---|--------|------|-------|-----|--------|
| 01 | `chore(setup): scaffold Next.js 14 with TS, Tailwind and path aliases` | chore | setup | — | 🟢 Bajo |
| 02 | `data(rawg): add typed HTTP client with key injection, retry and timeout` | feat | rawg | — | 🟡 Medio |
| 03 | `data(normalizer): transform RAWG raw response to GameViewModel` | feat | normalizer | `v0.1.0` | 🟡 Medio |
| 04 | `feat(api): add /api/games, /api/games/[slug] and /api/platforms routes` | feat | api | — | 🟡 Medio |
| 05 | `ui(layout): add desktop-first root layout with sidebar and main area` | feat | layout | — | 🟢 Bajo |
| 06 | `feat(sidebar): add PlatformSidebar with keyboard nav and active state` | feat | sidebar | `v0.2.0` | 🟢 Bajo |
| 07 | `feat(search): add CommandPalette with ⌘K, debounce and aria roles` | feat | search | — | 🔴 Alto |
| 08 | `feat(sections): add GameCard, skeleton and PlatformSection with infinite scroll` | feat | sections | `v0.3.0` | 🟡 Medio |
| 09 | `feat(detail): add GameDetail page with screenshots, stores and trailer` | feat | detail | — | 🟡 Medio |
| 10 | `feat(states): add EmptyState, ErrorBoundary and loading skeletons` | feat | states | `v0.4.0` | 🟢 Bajo |
| 11 | `a11y(audit): fix focus management, landmarks, contrast and reduced-motion` | fix | a11y | — | 🟡 Medio |
| 12 | `docs(release): add README, CHANGELOG and prepare v1.0 production deploy` | docs | release | `v1.0.0` | 🟢 Bajo |

---

## Detalle por Commit

---

### 01 · `chore(setup): scaffold Next.js 14 with TS, Tailwind and path aliases`

**Qué cambia**
```
/
├── app/
│   ├── layout.tsx          ← root layout vacío
│   └── page.tsx            ← home placeholder
├── tailwind.config.ts      ← paleta oscura, fuente, tokens base
├── tsconfig.json           ← aliases @/lib @/components @/types @/stores
├── .eslintrc.json
├── .prettierrc
├── .husky/pre-commit       ← lint-staged antes de cada commit
├── .env.example            ← RAWG_API_KEY, RAWG_BASE_URL
└── .gitignore              ← .env.local excluido
```

**Por qué así**
Toda la configuración en un único commit evita que el historial quede contaminado con "fix eslint", "fix tsconfig". Es reversible en bloque y establece la base sobre la que todos los demás commits construyen.

**Riesgo:** 🟢 Bajo — solo config, nada de lógica de negocio.

**Checklist de verificación**
- [ ] `npm run dev` arranca sin errores
- [ ] `npm run lint` pasa
- [ ] Alias `@/lib` resuelve correctamente en un import de prueba
- [ ] `.env.local` no aparece en `git status`

---

### 02 · `data(rawg): add typed HTTP client with key injection, retry and timeout`

**Qué cambia**
```
lib/
├── rawgClient.ts           ← rawgFetch(path, params): Promise<T>
├── storeIdMap.ts           ← { 1: "Steam", 3: "PlayStation Store", ... }
└── errors.ts               ← AppError { code, message, status }

types/
└── rawg.ts                 ← RAWGGame, RAWGPlatform, RAWGScreenshot (tipos crudos)
```

**Por qué así**
El cliente HTTP es la única pieza que conoce la API key y el host de RAWG. Aislarlo aquí garantiza que ningún otro módulo importa `process.env.RAWG_API_KEY` directamente. El retry (1x en 5xx) y el timeout (8s con `AbortController`) protegen contra RAWG ocasionalmente lento.

**Riesgo:** 🟡 Medio — si `RAWG_API_KEY` no está en `.env.local`, todas las llamadas fallan con 401. Mitigation: validar la variable al arrancar con un check en `rawgClient.ts`.

**Checklist de verificación**
- [ ] `rawgFetch("/games", { page_size: 1 })` devuelve datos reales de RAWG
- [ ] Con key incorrecta → `AppError { code: "UNAUTHORIZED", status: 401 }`
- [ ] Con timeout simulado → `AppError { code: "TIMEOUT", status: 408 }`
- [ ] `process.env.RAWG_API_KEY` no aparece en ninguna respuesta HTTP al cliente

---

### 03 · `data(normalizer): transform RAWG raw response to GameViewModel` `← TAG v0.1.0`

**Qué cambia**
```
lib/
├── normalizer.ts           ← normalizeGame(), normalizeGameDetail(), normalizePlatform()
└── normalizer.test.ts      ← casos: null fields, http→https, year extraction, empty arrays

types/
└── viewModels.ts           ← GameCardVM, GameDetailVM, PlatformVM (contratos de UI)
```

**Por qué así**
La normalización es la frontera entre el mundo de RAWG y el mundo de la UI. Al ser una función pura sin efectos secundarios, es completamente testeable. El tag `v0.1.0` marca que la capa de datos está cerrada — cualquier cambio futuro en el modelo pasa obligatoriamente por aquí.

**Riesgo:** 🟡 Medio — si los tests no cubren campos `null`, la UI puede recibir `undefined` y crashear en render. Los tests deben incluir el caso de juego con todos los campos vacíos.

**Checklist de verificación**
- [ ] `npm test -- normalizer` pasa todos los casos
- [ ] `released: null` → `year: null` (no `NaN`)
- [ ] `background_image: "http://..."` → `"https://..."` en `cover`
- [ ] `platforms[].platform.id` aplanado a `platforms[].id`
- [ ] `metacritic: null` preservado como `null` (no convertido a `0`)

---

### 04 · `feat(api): add /api/games, /api/games/[slug] and /api/platforms routes`

**Qué cambia**
```
app/api/
├── games/
│   ├── route.ts            ← GET con ?search, ?platforms, ?genres, ?ordering, ?page
│   └── [slug]/
│       └── route.ts        ← GET agrega detail+screenshots+stores+movies (Promise.all)
└── platforms/
    └── route.ts            ← GET ordenado por -games_count

lib/
└── cache.ts                ← unstable_cache wrappers con TTL por endpoint
```

**Por qué así**
Los tres routes actúan de proxy. `Promise.all` en `[slug]` paraleliza las 4 llamadas a RAWG (detail, screenshots, stores, movies) reduciendo la latencia del detalle de ~1.2s a ~400ms. La caché en servidor evita re-llamar a RAWG si varios usuarios piden el mismo juego en el mismo TTL.

**Riesgo:** 🟡 Medio — si `/movies` devuelve 404 para un juego (cobertura ~15%), `Promise.all` falla completo. Mitigation: `Promise.allSettled` y default `trailers: []`.

**Checklist de verificación**
- [ ] `GET /api/games?platforms=18&page_size=10` devuelve `GameCardVM[]`
- [ ] `GET /api/games/grand-theft-auto-v` devuelve `GameDetailVM` completo
- [ ] `GET /api/games/juego-inexistente` → `404` con `{ error: "Game not found" }`
- [ ] Segunda llamada al mismo endpoint dentro del TTL no genera request a RAWG (verificar en logs)
- [ ] `RAWG_API_KEY` ausente en cualquier respuesta al cliente

---

### 05 · `ui(layout): add desktop-first root layout with sidebar and main area`

**Qué cambia**
```
app/
├── layout.tsx              ← <html> con font, providers, estructura de grid
└── globals.css             ← variables CSS: --color-surface, --color-accent, etc.

components/
├── Layout/
│   ├── AppShell.tsx        ← grid: sidebar 240px fijo + main flex-1
│   └── Header.tsx          ← logo + placeholder de búsqueda + acciones
```

**Por qué así**
El layout es el contenedor de todo. Fijarlo antes que los componentes interiores evita retrabajar props de padding/margin en cada componente hijo. Desktop-first significa que el grid base es `grid-cols-[240px_1fr]`; el sidebar colapsa solo en `< 1280px`, no antes.

**Riesgo:** 🟢 Bajo — puramente visual, sin lógica. El único riesgo es scroll horizontal si `main` no tiene `overflow-x: hidden`.

**Checklist de verificación**
- [ ] En 1440px: sidebar visible + main ocupa el resto
- [ ] En 1024px: sidebar colapsado, botón para expandir
- [ ] Sin scroll horizontal en ningún breakpoint ≥ 1024px
- [ ] `<nav>`, `<main>`, `<header>` presentes como landmarks

---

### 06 · `feat(sidebar): add PlatformSidebar with keyboard nav and active state` `← TAG v0.2.0`

**Qué cambia**
```
components/
└── PlatformSidebar/
    ├── PlatformSidebar.tsx     ← lista de consolas con icono y contador
    ├── PlatformItem.tsx        ← item individual con aria-current
    └── PlatformSidebar.skeleton.tsx

stores/
└── filterStore.ts              ← Zustand: platformId, genreId, ordering activos
```

**Por qué así**
El sidebar es el eje de navegación principal de la app. Al conectarlo a `filterStore` (Zustand) en lugar de estado local, cualquier otro componente puede leer la plataforma activa sin prop drilling. El tag `v0.2.0` marca que la navegación base está operativa.

**Riesgo:** 🟢 Bajo — datos de plataformas son estáticos (TTL 24h). El único riesgo es que RAWG devuelva 0 plataformas, lo que se maneja con un `EmptyState` (commit 10).

**Checklist de verificación**
- [ ] Plataformas se cargan desde `/api/platforms`
- [ ] Clic en plataforma → `filterStore.platformId` se actualiza
- [ ] Navegación con ↑↓ entre items sin mouse
- [ ] `aria-current="page"` en el item activo
- [ ] Skeleton de 8 items visible durante la carga inicial

---

### 07 · `feat(search): add CommandPalette with ⌘K, debounce and aria roles`

**Qué cambia**
```
components/
└── CommandPalette/
    ├── CommandPalette.tsx      ← modal, input, lista de resultados
    ├── useCommandPalette.ts    ← estado open/close, keyboard handler
    └── SearchResult.tsx        ← minicard con cover, título, año

stores/
└── searchStore.ts              ← Zustand: query, isOpen
```

**Por qué así**
La búsqueda es el flujo de entrada más rápido a cualquier juego. Debounce de 300ms evita llamar a `/api/games?search=` en cada keystroke. El modal requiere gestión de foco (`focus trap`) para ser accesible — por eso va en su propio commit antes de que cualquier otro componente dependa de él.

**Riesgo:** 🔴 Alto — la gestión de foco es compleja. Si el `focus trap` no está bien implementado, Tab dentro de la paleta escapa al documento. Mitigation: usar `@radix-ui/react-dialog` o `focus-trap-react` en lugar de implementar manualmente.

**Checklist de verificación**
- [ ] ⌘K / Ctrl+K abre la paleta
- [ ] Esc cierra y el foco regresa al elemento que la abrió
- [ ] Escribir "zelda" → resultados aparecen tras 300ms de pausa
- [ ] ↑↓ navega entre resultados; Enter navega al detalle
- [ ] Tab no escapa del modal mientras está abierto
- [ ] `role="combobox"`, `aria-expanded`, `aria-activedescendant` presentes en el input

---

### 08 · `feat(sections): add GameCard, skeleton and PlatformSection with infinite scroll` `← TAG v0.3.0`

**Qué cambia**
```
components/
├── GameCard/
│   ├── GameCard.tsx            ← cover, título, año, rating, badges de plataforma
│   └── GameCard.skeleton.tsx   ← placeholder animado con animate-pulse
└── PlatformSection/
    ├── PlatformSection.tsx     ← grid 4-col + sentinel para infinite scroll
    └── useInfiniteGames.ts     ← TanStack Query useInfiniteQuery

app/
└── page.tsx                    ← Home con SSR inicial + PlatformSections
```

**Por qué así**
`GameCard` es el componente más reutilizado del proyecto — aparece en la paleta, en las secciones y potencialmente en detalle (juegos relacionados). Definirlo en este commit, con su skeleton, evita reimplementarlo luego. El `IntersectionObserver` en el sentinel es más performante que un listener de scroll.

**Riesgo:** 🟡 Medio — `useInfiniteQuery` concatena páginas en memoria. Si el usuario scrollea muy rápido, puede haber duplicados si RAWG cambia el orden entre páginas. Mitigation: deduplicar por `id` al aplanar los resultados.

**Checklist de verificación**
- [ ] GameCard muestra cover, título, año y hasta 4 badges de plataforma
- [ ] Badge de Metacritic solo visible si `metacritic !== null`
- [ ] Skeleton visible durante el fetch inicial (no flash de contenido vacío)
- [ ] Scroll al final del grid carga la siguiente página automáticamente
- [ ] No hay duplicados al cargar la página 2
- [ ] `router.prefetch(slug)` se llama en `onMouseEnter` de GameCard

---

### 09 · `feat(detail): add GameDetail page with screenshots, stores and trailer`

**Qué cambia**
```
app/games/[slug]/
└── page.tsx                    ← SSR con generateMetadata para OG tags

components/
└── GameDetail/
    ├── GameDetail.tsx          ← hero, cover portrait, metadatos, descripción
    ├── ScreenshotGallery.tsx   ← thumbnails + lightbox con focus trap
    ├── StoreLinks.tsx          ← links de tiendas con iconos
    └── TrailerEmbed.tsx        ← video embed si trailers.length > 0
```

**Por qué así**
El detalle es el destino final del usuario. SSR garantiza que los metadatos OG (`og:title`, `og:image`, `og:description`) estén presentes para compartir en redes. La descripción HTML de RAWG se sanitiza con DOMPurify antes del render para evitar XSS.

**Riesgo:** 🟡 Medio — DOMPurify solo corre en cliente. Si el detalle es Server Component, la sanitización debe hacerse con `sanitize-html` (paquete Node) o diferir el render de la descripción a un Client Component. Mitigation: `<DescriptionRenderer>` como Client Component aislado.

**Checklist de verificación**
- [ ] `GET /games/grand-theft-auto-v` renderiza con datos reales
- [ ] OG tags correctos en `<head>` (verificar con `curl -I`)
- [ ] Descripción HTML renderizada (no texto plano con tags)
- [ ] ScreenshotGallery: clic abre lightbox, Esc cierra, foco atrapado
- [ ] StoreLinks: todos los links tienen `rel="noopener noreferrer"`
- [ ] TrailerEmbed: no renderiza si `trailers: []`
- [ ] `GET /games/juego-inexistente` → página `/not-found` personalizada

---

### 10 · `feat(states): add EmptyState, ErrorBoundary and loading skeletons` `← TAG v0.4.0`

**Qué cambia**
```
components/
├── EmptyState/
│   └── EmptyState.tsx          ← variantes: no-results, no-games, no-connection
├── ErrorBoundary/
│   └── ErrorBoundary.tsx       ← Client Component, aísla errores por sección
└── GameDetail/
    └── GameDetail.skeleton.tsx ← hero + bloques de texto placeholders

app/
├── loading.tsx                 ← loading.tsx de Next.js para rutas /
└── games/[slug]/
    └── loading.tsx             ← skeleton de GameDetail
```

**Por qué así**
Los estados de UI son la diferencia entre una app que parece rota y una que parece profesional. `ErrorBoundary` por sección (no global) evita que un error en `PlatformSection` derribe la `CommandPalette`. El tag `v0.4.0` marca que la app es navegable de extremo a extremo con todos los estados cubiertos.

**Riesgo:** 🟢 Bajo — sin lógica de negocio. El único riesgo es que el skeleton no tenga las mismas dimensiones que el componente real, causando layout shift. Mitigation: definir dimensiones fijas en el skeleton que coincidan con el componente.

**Checklist de verificación**
- [ ] Búsqueda sin resultados → `EmptyState` con botón "Limpiar búsqueda"
- [ ] Error en PlatformSection → ErrorBoundary local, resto de la app intacta
- [ ] Error 429 de RAWG → mensaje especial "Demasiadas solicitudes"
- [ ] `loading.tsx` visible al navegar a `/games/[slug]` en conexión lenta
- [ ] Sin Cumulative Layout Shift entre skeleton y contenido real

---

### 11 · `a11y(audit): fix focus management, landmarks, contrast and reduced-motion`

**Qué cambia**
```
components/         ← ajustes de aria en múltiples componentes
app/
└── globals.css     ← @media (prefers-reduced-motion: reduce) { ... }

No se añaden archivos nuevos: este commit corrige lo existente.
```

**Cambios típicos que incluye este commit:**
- `aria-label` en todos los `<button>` sin texto visible
- `alt` descriptivo en `<Image>` de GameCard: `"Cover de {title}"`
- `aria-hidden="true"` en skeletons y elementos decorativos
- `focus-visible` con outline personalizado (no solo el del browser)
- `prefers-reduced-motion`: desactiva `animate-pulse` y transiciones de hover
- Contraste verificado y corregido en text-muted sobre fondos oscuros

**Por qué así**
La accesibilidad se audita al final porque en este punto todos los componentes están estables. Hacerlo antes implicaría re-auditar tras cada cambio de UI. Un commit dedicado hace que el diff de a11y sea revisable de forma aislada.

**Riesgo:** 🟡 Medio — algunos fixes de `aria` pueden cambiar el comportamiento visual (ej. añadir `role="status"` en skeletons puede hacer que el screen reader anuncie cosas inesperadas). Revisar con VoiceOver/NVDA antes de hacer merge.

**Checklist de verificación**
- [ ] axe-core sin errores críticos en Home, Detail y CommandPalette
- [ ] Contraste ≥ 4.5:1 en todos los textos (verificar con Lighthouse)
- [ ] Flujo Home → buscar → detalle completable solo con teclado
- [ ] Con `prefers-reduced-motion: reduce` → sin animaciones de pulso ni transiciones
- [ ] NVDA/VoiceOver anuncia el nombre del juego al llegar a GameCard con Tab

---

### 12 · `docs(release): add README, CHANGELOG and prepare v1.0 production deploy` `← TAG v1.0.0`

**Qué cambia**
```
README.md               ← setup local, stack, variables de entorno, scripts
CHANGELOG.md            ← v1.0.0 con lista de features del MVP
.env.example            ← revisado y completo
next.config.js          ← domains para next/image (media.rawg.io)
vercel.json             ← (si aplica) headers de caché para rutas de API
```

**Por qué así**
El commit de release es intencionalmente solo docs y config de producción. No mezcla features con documentación. El tag semántico `v1.0.0` marca el punto exacto del historial desde el que la app está en producción — cualquier hotfix futuro parte desde aquí.

**Riesgo:** 🟢 Bajo — sin cambios de lógica. El único riesgo es olvidar añadir `media.rawg.io` a los dominios de `next/image`, lo que haría que todas las imágenes fallen en producción.

**Checklist de verificación**
- [ ] `npm run build` completa sin errores ni warnings de TypeScript
- [ ] `RAWG_API_KEY` configurada en Vercel Environment Variables (no en repo)
- [ ] Lighthouse en producción: Performance ≥ 85, Accessibility ≥ 90
- [ ] Imágenes de RAWG cargan correctamente en la URL de producción
- [ ] `git tag v1.0.0` creado y pusheado
- [ ] CHANGELOG refleja todos los features de los commits anteriores

---

## Vista de Árbol de Tags

```
main
│
├─ chore(setup)...          commit 01
├─ data(rawg)...            commit 02
├─ data(normalizer)... ─── TAG v0.1.0   ← capa de datos cerrada
├─ feat(api)...             commit 04
├─ ui(layout)...            commit 05
├─ feat(sidebar)... ─────── TAG v0.2.0  ← navegación operativa
├─ feat(search)...          commit 07
├─ feat(sections)... ────── TAG v0.3.0  ← home navegable
├─ feat(detail)...          commit 09
├─ feat(states)... ─────── TAG v0.4.0  ← app completa de extremo a extremo
├─ a11y(audit)...           commit 11
└─ docs(release)... ─────── TAG v1.0.0  ← producción
```

---

## Reglas de este Plan

| Regla | Razón |
|-------|-------|
| Un commit = una capa o responsabilidad | `git bisect` efectivo si algo rompe |
| Nunca mezclar `feat` + `fix` en el mismo commit | Diffs legibles en code review |
| Tags solo en commits que no rompen nada | Cada tag debe pasar `npm run build` |
| `docs` siempre en commit separado | Evita ruido en diffs de lógica |
| El commit de a11y va al final | Los componentes deben estar estables antes de auditar |
| `chore(setup)` primero y solo una vez | El scaffolding no se toca después |
