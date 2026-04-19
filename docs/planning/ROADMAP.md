# Roadmap MVP — Game Library App
> Desktop-first · Next.js 14 · RAWG API · Inspirada en romSphere
> Inicio: semana del 21 abril 2026

---

## Vista General de Milestones

```
Sem 1  [████░░░░░░░░░░░░░░░░]  Fundación de datos
Sem 2  [████████░░░░░░░░░░░░]  Shell visual + navegación
Sem 3  [████████████░░░░░░░░]  Secciones y cards
Sem 4  [████████████████░░░░]  Detalle + estados
Sem 5  [████████████████████]  A11y · Docs · Release
```

---

## Semana 1 — Fundación de datos
`21 abr – 27 abr 2026`
**Milestone:** API integrada, modelo normalizado y proxy seguro funcionando en local.

---

### ISSUE-01
**`data` `docs`** · Research de RAWG API y definición de contratos
**Objetivo:** Entender qué devuelve cada endpoint relevante, documentar límites y decidir qué datos exponer en la app.
**Definition of Done:**
- [ ] Tabla de endpoints con params, TTLs y riesgos documentada en `RAWG_DATA_LAYER.md`
- [ ] Mapa de store IDs completo (`lib/storeIdMap.ts`)
- [ ] Decisión documentada: qué campos del raw se descartan
- [ ] `.env.example` con todas las variables requeridas

**Depende de:** nada
**Fecha objetivo:** 22 abr 2026

---

### ISSUE-02
**`chore`** · Setup del proyecto Next.js 14
**Objetivo:** Repositorio con estructura de carpetas, aliases, linter y Tailwind listos para trabajar.
**Definition of Done:**
- [ ] `npx create-next-app` con TypeScript, Tailwind, App Router
- [ ] Path aliases `@/components`, `@/lib`, `@/types`, `@/stores` configurados en `tsconfig.json`
- [ ] ESLint + Prettier con reglas acordadas
- [ ] Husky + lint-staged en pre-commit
- [ ] `README.md` con instrucciones de setup local
- [ ] `.env.local` con `RAWG_API_KEY` (no commiteado)

**Depende de:** ISSUE-01
**Fecha objetivo:** 22 abr 2026

---

### ISSUE-03
**`data`** · rawgClient — cliente HTTP seguro
**Objetivo:** Módulo servidor que inyecta la API key, gestiona timeout, retry y mapea errores HTTP de RAWG.
**Definition of Done:**
- [ ] `lib/rawgClient.ts` con función `rawgFetch(path, params)` tipada
- [ ] API key leída solo desde `process.env` (nunca hardcodeada)
- [ ] Timeout de 8s con `AbortController`
- [ ] Retry automático 1x en error 5xx
- [ ] Errores mapeados a `AppError { code, message, status }`
- [ ] Tipos crudos de RAWG en `types/rawg.ts`
- [ ] Test unitario con `fetch` mockeado (happy path + timeout)

**Depende de:** ISSUE-02
**Fecha objetivo:** 24 abr 2026

---

### ISSUE-04
**`data`** · Normalizer — RAWG raw → GameViewModel
**Objetivo:** Capa pura de transformación que convierte el JSON crudo de RAWG al modelo de UI, sin efectos secundarios.
**Definition of Done:**
- [ ] `lib/normalizer.ts` exporta `normalizeGame(raw): GameCardVM` y `normalizeGameDetail(raw): GameDetailVM`
- [ ] `lib/normalizePlatform.ts` exporta `normalizePlatform(raw): PlatformVM`
- [ ] Todos los campos con default si son null/undefined (ver `RAWG_DATA_LAYER.md §3`)
- [ ] `platforms` aplanado desde triple anidación
- [ ] `released` → `year` extraído
- [ ] URLs forzadas a `https://`; si null → placeholder local
- [ ] Tests unitarios cubriendo: campos null, array vacío, URL http→https, year desde fecha

**Depende de:** ISSUE-03
**Fecha objetivo:** 25 abr 2026

---

### ISSUE-05
**`data`** · API Routes + caché server-side
**Objetivo:** Tres Route Handlers que actúan de proxy entre el cliente y RAWG, con caché por TTL.
**Definition of Done:**
- [ ] `GET /api/games` acepta `?search`, `?platforms`, `?genres`, `?ordering`, `?page`, `?page_size`
- [ ] `GET /api/games/[slug]` agrega detail + screenshots + stores + movies con `Promise.all`
- [ ] `GET /api/platforms` devuelve lista ordenada por popularidad
- [ ] `lib/cache.ts` con `unstable_cache` wrappers y TTLs: games 5min, detail 30min, platforms 24h
- [ ] API key nunca presente en respuesta al cliente ni en logs
- [ ] Respuestas erróneas de RAWG → status HTTP correcto al cliente (404, 429, 500)
- [ ] Probado manualmente con `curl` o Postman

**Depende de:** ISSUE-04
**Fecha objetivo:** 27 abr 2026

---

## Semana 2 — Shell Visual y Navegación
`28 abr – 4 may 2026`
**Milestone:** Layout desktop funcionando, sidebar de consolas navegable y Command Palette operativo.

---

### ISSUE-06
**`ui`** · Tokens de diseño y sistema base
**Objetivo:** Variables CSS y configuración de Tailwind que definen colores, tipografía y espaciado de la app.
**Definition of Done:**
- [ ] Paleta de colores en `tailwind.config.ts`: background oscuro, surface, accent, text-primary, text-muted
- [ ] Fuente definida con `next/font` (sin layout shift)
- [ ] Variables CSS para radios, sombras y transiciones base
- [ ] Componente `<Typography>` con variantes `h1 h2 h3 body caption`
- [ ] Storybook o página `/dev` con muestra de tokens (opcional en MVP)

**Depende de:** ISSUE-02
**Fecha objetivo:** 29 abr 2026

---

### ISSUE-07
**`ui` `feat`** · Layout raíz desktop-first
**Objetivo:** Shell principal con sidebar izquierdo fijo, área de contenido scrollable y header superior.
**Definition of Done:**
- [ ] Layout dividido: sidebar 240px fijo + main `flex-1 overflow-y-auto`
- [ ] Responsive mínimo: sidebar colapsable en ventanas < 1280px (no mobile-first)
- [ ] Header con logo, buscador placeholder y área de acciones
- [ ] Sin scroll horizontal en ningún breakpoint desktop
- [ ] Accesible: `<nav>`, `<main>`, `<header>` con landmarks correctos

**Depende de:** ISSUE-06
**Fecha objetivo:** 30 abr 2026

---

### ISSUE-08
**`feat` `ui`** · PlatformSidebar — navegación por consola
**Objetivo:** Sidebar que lista consolas desde `/api/platforms`, con estado activo y navegación por teclado.
**Definition of Done:**
- [ ] Consume `GET /api/platforms` con TanStack Query
- [ ] Muestra nombre, icono/imagen de plataforma y contador de juegos
- [ ] Estado activo sincronizado con URL param `?platform=`
- [ ] Navegación con flechas ↑↓ y Enter desde teclado
- [ ] Skeleton loader de 8 items mientras carga
- [ ] `aria-current="page"` en item activo

**Depende de:** ISSUE-05, ISSUE-07
**Fecha objetivo:** 1 may 2026

---

### ISSUE-09
**`feat` `ui`** · CommandPalette — buscador ⌘K
**Objetivo:** Paleta de búsqueda global activada por ⌘K / Ctrl+K, con debounce y resultados rápidos.
**Definition of Done:**
- [ ] Activado con ⌘K (Mac) y Ctrl+K (Windows/Linux)
- [ ] Cerrado con Esc o clic fuera del modal
- [ ] Input con debounce de 300ms antes de llamar a `/api/games?search=`
- [ ] Muestra hasta 8 resultados con cover mini, título y año
- [ ] Navegación ↑↓ entre resultados, Enter navega al detalle
- [ ] Estado "sin resultados" con mensaje útil
- [ ] Estado de carga con spinner en el input
- [ ] `role="combobox"`, `aria-expanded`, `aria-activedescendant` correctos
- [ ] Foco retorna al elemento que abrió la paleta al cerrar

**Depende de:** ISSUE-05, ISSUE-07
**Fecha objetivo:** 3 may 2026

---

### ISSUE-10
**`feat`** · Sync estado de filtros con URL params
**Objetivo:** Filtros de plataforma, género y búsqueda persistidos en la URL para que sean compartibles.
**Definition of Done:**
- [ ] Librería `nuqs` instalada y configurada
- [ ] Params `platform`, `genre`, `search`, `page`, `ordering` en la URL
- [ ] Cambio de filtro actualiza URL sin recargar la página
- [ ] URL directa con params carga el estado correcto
- [ ] Back/forward del navegador navega correctamente entre estados de filtro

**Depende de:** ISSUE-08, ISSUE-09
**Fecha objetivo:** 4 may 2026

---

## Semana 3 — Secciones por Consola y Game Cards
`5 may – 11 may 2026`
**Milestone:** Home muestra secciones por plataforma con GameCards e infinite scroll funcionando.

---

### ISSUE-11
**`feat` `ui`** · GameCard — componente base
**Objetivo:** Card reutilizable que muestra los datos esenciales de un juego con hover y prefetch.
**Definition of Done:**
- [ ] Props: `game: GameCardVM` (ver `types/viewModels.ts`)
- [ ] Muestra: cover (next/image), título, año, rating con estrellas, badges de plataforma (máx 4)
- [ ] Badge de Metacritic solo si `metacritic !== null`
- [ ] Hover: elevación sutil con `transition`, cursor pointer
- [ ] `router.prefetch(slug)` en `onMouseEnter`
- [ ] `next/image` con `sizes` apropiado para el grid desktop
- [ ] Keyboard: focusable con Tab, activable con Enter/Space
- [ ] `alt` descriptivo en imagen: `"Cover de {title}"`

**Depende de:** ISSUE-06, ISSUE-05
**Fecha objetivo:** 7 may 2026

---

### ISSUE-12
**`ui`** · GameCard.skeleton — estado de carga
**Objetivo:** Versión placeholder animada de GameCard para mostrar durante fetch.
**Definition of Done:**
- [ ] Mismas dimensiones que GameCard real (sin layout shift)
- [ ] Animación `animate-pulse` de Tailwind en áreas de imagen, título y badges
- [ ] Reutilizable: `<GameCard.Skeleton />` o componente separado
- [ ] `aria-hidden="true"` — no anunciado por screen readers

**Depende de:** ISSUE-11
**Fecha objetivo:** 7 may 2026

---

### ISSUE-13
**`feat`** · useInfiniteGames — hook de paginación
**Objetivo:** Hook con TanStack Query que carga páginas de juegos con `fetchNextPage` al scroll.
**Definition of Done:**
- [ ] `useInfiniteQuery` con `getNextPageParam` desde `next` de RAWG
- [ ] Parámetros: `platformId?`, `genreId?`, `search?`, `ordering?`
- [ ] Expone: `games: GameCardVM[]`, `isLoading`, `isFetchingNextPage`, `hasNextPage`, `fetchNextPage`
- [ ] Deduplicación de IDs al concatenar páginas
- [ ] Cache key incluye todos los filtros activos

**Depende de:** ISSUE-05, ISSUE-10
**Fecha objetivo:** 8 may 2026

---

### ISSUE-14
**`feat` `ui`** · PlatformSection — sección de juegos por consola
**Objetivo:** Sección con título de consola, grid de GameCards e infinite scroll por IntersectionObserver.
**Definition of Done:**
- [ ] Consume `useInfiniteGames({ platformId })`
- [ ] Grid CSS: 4 columnas en 1440px, 3 en 1280px, 2 en 1024px
- [ ] Título de sección con nombre e icono de plataforma
- [ ] Sentinel div al final del grid detectado por `IntersectionObserver`
- [ ] Al detectar sentinel visible → `fetchNextPage()`
- [ ] Muestra skeletons mientras `isFetchingNextPage`
- [ ] Contador "Mostrando X de Y juegos"

**Depende de:** ISSUE-11, ISSUE-12, ISSUE-13
**Fecha objetivo:** 9 may 2026

---

### ISSUE-15
**`feat` `ui`** · Home page — vista principal
**Objetivo:** Página de inicio con sección destacada + secciones por consola desde las plataformas más populares.
**Definition of Done:**
- [ ] SSR: carga las 5 plataformas más populares en el servidor
- [ ] Sección hero con el juego mejor valorado de la semana
- [ ] 5 `<PlatformSection>` renderizadas inicialmente
- [ ] Al seleccionar plataforma en sidebar → muestra esa sección en primer plano
- [ ] Metadatos OG correctos (`title`, `description`, `og:image`)

**Depende de:** ISSUE-08, ISSUE-14
**Fecha objetivo:** 11 may 2026

---

## Semana 4 — Página de Detalle y Estados de UI
`12 may – 18 may 2026`
**Milestone:** GameDetail completo con todos los metadatos, y todos los estados de UI cubiertos.

---

### ISSUE-16
**`feat` `ui`** · GameDetail — página de detalle
**Objetivo:** Página rica con toda la información de un juego, accesible desde cualquier GameCard.
**Definition of Done:**
- [ ] SSR desde `/api/games/[slug]` (datos en servidor para SEO)
- [ ] Hero: imagen `backgroundImage` full-width con overlay degradado
- [ ] Cover portrait sobre el hero (izquierda)
- [ ] Metadatos: título, año, géneros, plataformas, rating RAWG + estrellas, badge Metacritic
- [ ] Descripción HTML sanitizada con DOMPurify renderizada como rich text
- [ ] Sección "Disponible en" con `<StoreLinks>`
- [ ] Sección "Capturas de pantalla" con `<ScreenshotGallery>`
- [ ] Sección "Tráiler" solo si `trailers.length > 0`
- [ ] Breadcrumb: Inicio > Plataforma > Título
- [ ] OG tags: `og:title`, `og:image` (background_image), `og:description` (primeros 160 chars del description limpio)

**Depende de:** ISSUE-05, ISSUE-07
**Fecha objetivo:** 14 may 2026

---

### ISSUE-17
**`feat` `ui`** · ScreenshotGallery — galería con lightbox
**Objetivo:** Galería horizontal de capturas con lightbox para ver en grande.
**Definition of Done:**
- [ ] Muestra hasta 6 thumbnails en fila horizontal scrollable
- [ ] Clic abre lightbox a pantalla completa
- [ ] Lightbox: navegación ←→ con teclado y botones, cerrar con Esc
- [ ] `next/image` en thumbnails; imagen full en lightbox con `<img>` para tamaño natural
- [ ] `role="dialog"` y `aria-label` en lightbox
- [ ] Foco atrapado en lightbox mientras está abierto
- [ ] Si `screenshots.length === 0` → no renderiza la sección

**Depende de:** ISSUE-16
**Fecha objetivo:** 15 may 2026

---

### ISSUE-18
**`feat` `ui`** · StoreLinks — links de compra
**Objetivo:** Lista de tiendas donde está disponible el juego, con icono y enlace externo.
**Definition of Done:**
- [ ] Icono + nombre de tienda desde `storeIdMap.ts`
- [ ] Enlace con `target="_blank" rel="noopener noreferrer"`
- [ ] Tooltip con dominio de la tienda en hover
- [ ] Si `stores.length === 0` → mensaje "No hay tiendas disponibles"
- [ ] Cada link con `aria-label="Comprar en {storeName} (abre en nueva pestaña)"`

**Depende de:** ISSUE-16
**Fecha objetivo:** 15 may 2026

---

### ISSUE-19
**`ui` `feat`** · Estados vacíos — EmptyState component
**Objetivo:** Componente reutilizable para mostrar cuando no hay resultados en búsqueda o filtros.
**Definition of Done:**
- [ ] Props: `title`, `description`, `action?: { label, onClick }`
- [ ] Variantes: `no-results`, `no-games-platform`, `no-connection`
- [ ] Ilustración SVG neutra (no emoji, no imagen externa)
- [ ] Botón de acción opcional ("Limpiar filtros", "Reintentar")
- [ ] Usado en: CommandPalette, PlatformSection, Home

**Depende de:** ISSUE-14, ISSUE-09
**Fecha objetivo:** 16 may 2026

---

### ISSUE-20
**`ui` `feat`** · Estados de error — ErrorBoundary por sección
**Objetivo:** Error boundaries que aíslan fallos por sección, sin romper el resto de la app.
**Definition of Done:**
- [ ] `ErrorBoundary` como Client Component envuelve `PlatformSection`, `CommandPalette`, `GameDetail`
- [ ] Muestra mensaje de error específico por sección (no genérico global)
- [ ] Botón "Reintentar" que limpia el error state
- [ ] Errores 429 (rate limit) muestran mensaje especial: "Demasiadas solicitudes, espera un momento"
- [ ] Errores 404 en GameDetail redirigen a página `/not-found` personalizada
- [ ] Logs de error a `console.error` en desarrollo; silenciados en producción

**Depende de:** ISSUE-16, ISSUE-14
**Fecha objetivo:** 17 may 2026

---

### ISSUE-21
**`ui`** · Loading states globales y por componente
**Objetivo:** Experiencia de carga coherente en toda la app, sin flashes ni layout shifts.
**Definition of Done:**
- [ ] `loading.tsx` de Next.js en rutas `/` y `/games/[slug]`
- [ ] Skeleton de GameDetail: hero placeholder, bloques de texto, galería vacía
- [ ] Spinner en CommandPalette durante fetch
- [ ] `isFetchingNextPage` muestra fila de 4 skeletons al final del grid
- [ ] Sin Cumulative Layout Shift (CLS) medible en Lighthouse

**Depende de:** ISSUE-12, ISSUE-16
**Fecha objetivo:** 18 may 2026

---

## Semana 5 — Accesibilidad, Documentación y Release
`19 may – 25 may 2026`
**Milestone:** App auditada, documentada y lista para despliegue en Vercel.

---

### ISSUE-22
**`a11y`** · Auditoría de accesibilidad completa
**Objetivo:** Alcanzar WCAG 2.1 AA en todos los flujos principales de la app.
**Definition of Done:**
- [ ] axe-core sin errores críticos en Home, GameDetail y CommandPalette
- [ ] Contraste de texto ≥ 4.5:1 en todos los estados (normal, hover, focus)
- [ ] Flujo completo navegable solo con teclado (Tab, Shift+Tab, Enter, Esc, ↑↓)
- [ ] Screen reader (NVDA/VoiceOver) anuncia: nombre del juego, rating, plataformas
- [ ] Focus visible en todos los elementos interactivos (no solo outline del browser)
- [ ] `prefers-reduced-motion` desactiva animaciones de transición
- [ ] Imágenes de portada con `alt` descriptivo; imágenes decorativas con `alt=""`
- [ ] Landmarks correctos: `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`

**Depende de:** ISSUE-09, ISSUE-14, ISSUE-16, ISSUE-17
**Fecha objetivo:** 21 may 2026

---

### ISSUE-23
**`a11y`** · Skip link y navegación por landmarks
**Objetivo:** Permitir saltar contenido repetitivo y navegar por secciones grandes.
**Definition of Done:**
- [ ] "Saltar al contenido principal" como primer elemento del DOM, visible on focus
- [ ] Anclas de landmark disponibles: `#main-content`, `#platform-sidebar`, `#game-grid`
- [ ] PlatformSection con `id` único por plataforma para anclaje directo
- [ ] `aria-label` en cada `<nav>`: "Navegación de plataformas", "Breadcrumb"

**Depende de:** ISSUE-22
**Fecha objetivo:** 22 may 2026

---

### ISSUE-24
**`docs`** · Documentación técnica del proyecto
**Objetivo:** README completo que permita a cualquier dev clonar y correr el proyecto en < 5 minutos.
**Definition of Done:**
- [ ] `README.md` con: descripción, stack, setup local, variables de entorno, scripts disponibles
- [ ] `RAWG_DATA_LAYER.md` revisado y actualizado con decisiones tomadas durante desarrollo
- [ ] `ARCHITECTURE_FLOW.md` revisado con estructura final real de archivos
- [ ] `CONTRIBUTING.md` con: convención de commits, proceso de PR, labels del proyecto
- [ ] Cada Route Handler con comentario de 1 línea explicando el TTL y por qué
- [ ] `types/viewModels.ts` con JSDoc en cada interface (campos no obvios)

**Depende de:** ISSUE-05 (datos), ISSUE-15 (home), ISSUE-16 (detalle)
**Fecha objetivo:** 23 may 2026

---

### ISSUE-25
**`chore`** · Configuración de Vercel y variables de entorno
**Objetivo:** Despliegue automático en Vercel desde `main`, con variables de entorno seguras.
**Definition of Done:**
- [ ] Proyecto conectado a Vercel con deploy desde `main`
- [ ] `RAWG_API_KEY` configurada en Vercel → Settings → Environment Variables (no en cliente)
- [ ] `next.config.js` con dominios de imagen permitidos (`media.rawg.io`)
- [ ] Preview deploys activos en PRs
- [ ] URL de producción compartida y verificada

**Depende de:** ISSUE-21 (todos los estados cubiertos)
**Fecha objetivo:** 23 may 2026

---

### ISSUE-26
**`docs` `chore`** · Checklist de release y QA final
**Objetivo:** Verificar que el MVP cumple todos los criterios de calidad antes del release público.
**Definition of Done:**
- [ ] Lighthouse en producción: Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90
- [ ] Todos los endpoints probados con datos reales de RAWG (no mocks)
- [ ] Flujo completo: Home → seleccionar consola → ver juego → abrir detalle → ir a tienda
- [ ] Flujo de búsqueda: ⌘K → escribir → seleccionar → detalle
- [ ] No hay `console.error` en producción en flujos normales
- [ ] API key no aparece en Network tab del navegador
- [ ] `CHANGELOG.md` con lista de features del MVP v1.0
- [ ] Tag `v1.0.0` en git

**Depende de:** ISSUE-22, ISSUE-24, ISSUE-25
**Fecha objetivo:** 25 may 2026

---

## Resumen de Backlog Priorizado

| # | Issue | Labels | Sem | Prioridad | Depende de |
|---|-------|--------|-----|-----------|------------|
| 01 | Research API + contratos | `data` `docs` | 1 | P0 | — |
| 02 | Setup Next.js 14 | `chore` | 1 | P0 | 01 |
| 03 | rawgClient seguro | `data` | 1 | P0 | 02 |
| 04 | Normalizer RAWG→VM | `data` | 1 | P0 | 03 |
| 05 | API Routes + caché | `data` | 1 | P0 | 04 |
| 06 | Tokens de diseño | `ui` | 2 | P1 | 02 |
| 07 | Layout raíz desktop | `ui` `feat` | 2 | P1 | 06 |
| 08 | PlatformSidebar | `feat` `ui` | 2 | P1 | 05 07 |
| 09 | CommandPalette ⌘K | `feat` `ui` | 2 | P1 | 05 07 |
| 10 | Sync filtros con URL | `feat` | 2 | P2 | 08 09 |
| 11 | GameCard base | `feat` `ui` | 3 | P1 | 06 05 |
| 12 | GameCard.skeleton | `ui` | 3 | P1 | 11 |
| 13 | useInfiniteGames hook | `feat` | 3 | P1 | 05 10 |
| 14 | PlatformSection | `feat` `ui` | 3 | P1 | 11 12 13 |
| 15 | Home page | `feat` `ui` | 3 | P1 | 08 14 |
| 16 | GameDetail page | `feat` `ui` | 4 | P1 | 05 07 |
| 17 | ScreenshotGallery | `feat` `ui` | 4 | P2 | 16 |
| 18 | StoreLinks | `feat` `ui` | 4 | P2 | 16 |
| 19 | EmptyState component | `ui` `feat` | 4 | P2 | 14 09 |
| 20 | ErrorBoundary por sección | `ui` `feat` | 4 | P2 | 16 14 |
| 21 | Loading states globales | `ui` | 4 | P2 | 12 16 |
| 22 | Auditoría a11y WCAG 2.1 AA | `a11y` | 5 | P1 | 09 14 16 17 |
| 23 | Skip link + landmarks | `a11y` | 5 | P2 | 22 |
| 24 | Documentación técnica | `docs` | 5 | P2 | 05 15 16 |
| 25 | Vercel deploy + env vars | `chore` | 5 | P1 | 21 |
| 26 | Release checklist + QA | `docs` `chore` | 5 | P0 | 22 24 25 |

---

## GitHub Projects — Propuesta de Organización

### Board: "Game Library MVP"
**Tipo:** Table view + Board view (ambos activos)

#### Columnas del Board

```
📋 Backlog  →  🔍 In Review  →  🔄 In Progress  →  ✅ Done
                    ↑
              (PR abierto)
```

#### Custom Fields (en Table view)

| Campo | Tipo | Valores |
|-------|------|---------|
| `Milestone` | Single select | Sem 1 · Sem 2 · Sem 3 · Sem 4 · Sem 5 |
| `Priority` | Single select | 🔴 P0 · 🟡 P1 · 🟢 P2 |
| `Layer` | Single select | data · ui · feat · a11y · docs · chore |
| `Target Date` | Date | fecha objetivo del issue |
| `Effort` | Number | puntos (1=horas, 3=día, 5=2días) |
| `Blocked by` | Text | ISSUE-XX |

#### Labels del Repositorio

```yaml
labels:
  - name: "feat"
    color: "#0075ca"
    description: "Nueva funcionalidad"

  - name: "ui"
    color: "#e4e669"
    description: "Visual, estilos, componentes"

  - name: "data"
    color: "#d93f0b"
    description: "API, normalización, tipos de datos"

  - name: "a11y"
    color: "#0e8a16"
    description: "Accesibilidad WCAG"

  - name: "docs"
    color: "#cfd3d7"
    description: "Documentación"

  - name: "chore"
    color: "#fef2c0"
    description: "Setup, config, tooling"

  - name: "P0"
    color: "#b60205"
    description: "Blocker — debe resolverse hoy"

  - name: "P1"
    color: "#e99695"
    description: "Alta prioridad — esta semana"

  - name: "P2"
    color: "#f9d0c4"
    description: "Normal — en el milestone"
```

#### Milestones del Repositorio

```
v0.1 — Fundación de datos       → due: 27 abr 2026
v0.2 — Shell y navegación       → due: 04 may 2026
v0.3 — Secciones y cards        → due: 11 may 2026
v0.4 — Detalle y estados de UI  → due: 18 may 2026
v1.0 — MVP Release              → due: 25 may 2026
```

#### Vistas recomendadas en GitHub Projects

1. **Board por estado** — columnas: Backlog · In Progress · In Review · Done
2. **Table por milestone** — ordenado por `Target Date`, agrupado por `Milestone`
3. **Roadmap view** — timeline visual semana a semana con fechas objetivo
4. **By Layer** — agrupado por campo `Layer` para ver carga por área

#### Workflow automático sugerido

```yaml
# .github/workflows/project-automation.yml
# Cuando se abre un PR → mover issue relacionado a "In Review"
# Cuando se mergea PR → mover a "Done" + cerrar issue
# Cuando issue se asigna → mover de Backlog a "In Progress"
```

#### Convención de rama por issue

```
feat/ISSUE-11-game-card
data/ISSUE-04-normalizer
a11y/ISSUE-22-audit
docs/ISSUE-24-readme
chore/ISSUE-02-setup
```

#### Convención de commit

```
feat(game-card): add hover prefetch and platform badges
data(normalizer): flatten nested platforms array
a11y(command-palette): add aria-activedescendant and combobox role
chore(setup): configure eslint, prettier and husky
docs(readme): add local setup instructions
fix(cache): handle RAWG 429 rate limit with backoff
```

---

## Definición de "MVP Listo"

> La app es MVP cuando un usuario puede:
> 1. Abrir la app y ver juegos organizados por consola sin acción previa
> 2. Buscar cualquier juego con ⌘K y llegar a su detalle en < 2 interacciones
> 3. Ver cover, descripción, rating, plataformas y dónde comprarlo en la página de detalle
> 4. Navegar toda la app solo con teclado
> 5. La API key nunca es visible en el cliente
> 6. La app desplegada en una URL pública y estable
