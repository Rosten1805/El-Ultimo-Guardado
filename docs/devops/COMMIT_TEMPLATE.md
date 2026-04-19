# Plantilla de Commit — Conventional Commits
> Game Library MVP · romSphere-inspired

---

## Formato Base

```
<tipo>(<área>): <cambio en imperativo, presente, ≤72 chars>

- qué: <qué ficheros o comportamiento cambia>
- por qué: <motivación o decisión de diseño>
- riesgo: <efecto secundario posible o ninguno>
```

---

## Tipos válidos

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de bug |
| `chore` | Setup, config, dependencias, tooling |
| `docs` | README, CHANGELOG, comentarios, JSDoc |
| `refactor` | Mejora interna sin cambio de comportamiento |
| `test` | Tests unitarios o de integración |
| `perf` | Optimización de rendimiento |
| `a11y` | Accesibilidad WCAG |
| `ui` | Estilos, tokens, layout, componentes visuales |
| `data` | API client, normalizer, tipos, caché |

## Áreas válidas (scopes)

| Área | Qué cubre |
|------|-----------|
| `api` | Route handlers, rawgClient, caché server-side |
| `search` | CommandPalette, useDebounce, searchStore |
| `home` | Home page, hero section, SSR inicial |
| `platforms` | PlatformSidebar, filterStore, PlatformVM |
| `sections` | PlatformSection, useInfiniteGames, grid |
| `card` | GameCard, GameCard.skeleton |
| `detail` | GameDetail page, ScreenshotGallery, StoreLinks |
| `ui` | Tokens, layout, AppShell, Header |
| `docs` | README, CHANGELOG, COMMIT_PLAN |
| `release` | Vercel config, next.config, tags de versión |

---

## Ejemplos por área

### `api`
```
data(api): add /api/games route with search, filter and pagination

- qué: nueva Route Handler en app/api/games/route.ts que acepta ?search, ?platforms, ?genres, ?page
- por qué: proxy entre cliente y RAWG para evitar exponer la API key en el navegador
- riesgo: si RAWG_API_KEY no está en .env.local, todas las llamadas devuelven 401
```

```
data(api): aggregate detail, screenshots and stores with Promise.allSettled

- qué: /api/games/[slug] ahora lanza 4 fetches en paralelo en lugar de secuencial
- por qué: reduce latencia del detalle de ~1200ms a ~400ms en condiciones normales
- riesgo: si /movies devuelve 404 (cobertura ~15%), allSettled lo captura y devuelve trailers: []
```

---

### `search`
```
feat(search): add CommandPalette triggered by ⌘K with 300ms debounce

- qué: modal de búsqueda global en components/CommandPalette con useDebounce y TanStack Query
- por qué: entrada más rápida a cualquier juego sin abandonar la vista actual
- riesgo: focus trap manual es frágil; se usa @radix-ui/react-dialog para gestionarlo
```

```
fix(search): return focus to trigger element on palette close

- qué: guardar ref del elemento que abrió la paleta y restaurar foco al cerrar con Esc
- por qué: sin esto el foco cae al body, rompiendo la navegación por teclado
- riesgo: ninguno
```

---

### `home`
```
feat(home): add SSR home page with top-5 platform sections

- qué: app/page.tsx carga plataformas en servidor y renderiza 5 PlatformSection iniciales
- por qué: SSR garantiza contenido visible antes del JS del cliente (mejor LCP)
- riesgo: si /api/platforms falla en build, la página lanza error 500; añadir fallback []
```

---

### `platforms`
```
feat(platforms): add PlatformSidebar with keyboard navigation and active state

- qué: sidebar con lista de consolas desde /api/platforms, navegable con ↑↓ y Enter
- por qué: eje principal de navegación de la app; debe funcionar sin mouse
- riesgo: ninguno; datos con TTL 24h, muy estables
```

```
data(platforms): normalize platform list sorting by games_count descending

- qué: normalizePlatform() ahora ordena por popularidad antes de devolver al cliente
- por qué: mostrar PlayStation/Xbox/PC primero mejora la primera impresión del sidebar
- riesgo: ninguno
```

---

### `detail`
```
feat(detail): add GameDetail page with hero, metadata and sanitized description

- qué: app/games/[slug]/page.tsx con SSR, OG tags y descripción HTML saneada con sanitize-html
- por qué: SSR necesario para og:image y og:description correctos al compartir en redes
- riesgo: DOMPurify no corre en servidor; usar sanitize-html (Node) o aislar en Client Component
```

```
feat(detail): add ScreenshotGallery with keyboard-accessible lightbox

- qué: galería horizontal de thumbnails + lightbox con ←→ y Esc en GameDetail
- por qué: las capturas son parte central del descubrimiento visual del juego
- riesgo: focus trap en lightbox debe probarse con VoiceOver antes de merge
```

---

### `card`
```
feat(card): add GameCard with cover, rating stars and platform badges

- qué: componente GameCard consumiendo GameCardVM; muestra cover (next/image), título, año, rating
- por qué: componente más reutilizado del proyecto; aparece en home, search y secciones
- riesgo: ninguno; datos siempre normalizados antes de llegar al componente
```

```
ui(card): add GameCard.skeleton with animate-pulse matching card dimensions

- qué: placeholder de mismas dimensiones que GameCard usando animate-pulse de Tailwind
- por qué: evitar layout shift al cargar la primera página de juegos
- riesgo: si las dimensiones no coinciden exactamente con GameCard real, habrá CLS medible
```

---

### `ui`
```
ui(layout): add desktop-first AppShell with 240px fixed sidebar and scrollable main

- qué: layout raíz con CSS grid sidebar-240px + main flex-1; sidebar colapsable en <1280px
- por qué: estructura fija desde el inicio evita retrabajar márgenes en componentes hijos
- riesgo: sin overflow-x:hidden en main puede aparecer scroll horizontal en contenido ancho
```

```
ui(tokens): add color palette, typography scale and spacing tokens to tailwind.config

- qué: paleta oscura, variantes de texto (h1–caption) y variables CSS en globals.css
- por qué: centralizar tokens evita valores mágicos dispersos en componentes
- riesgo: ninguno
```

---

### `a11y`
```
a11y(audit): fix contrast, focus-visible and aria labels across all components

- qué: correcciones en aria-label, alt texts, outline de focus y contraste en text-muted
- por qué: auditoría con axe-core reveló 6 errores críticos en Home y CommandPalette
- riesgo: cambios en aria pueden alterar anuncios de screen reader; verificar con NVDA
```

```
a11y(motion): disable pulse animations when prefers-reduced-motion is set

- qué: @media (prefers-reduced-motion: reduce) desactiva animate-pulse y transiciones de hover
- por qué: usuarios con vestibular disorders pueden ver las animaciones como perturbadoras
- riesgo: ninguno
```

---

### `docs`
```
docs(readme): add local setup, env vars and available scripts

- qué: README.md con instrucciones de clone, .env.local, npm run dev y estructura de carpetas
- por qué: cualquier dev debe poder levantar el proyecto en <5 minutos sin preguntar
- riesgo: ninguno
```

```
docs(changelog): add CHANGELOG.md for v1.0.0 with full feature list

- qué: CHANGELOG siguiendo Keep a Changelog con todas las features del MVP
- por qué: referencia de qué estaba en producción en el momento del tag v1.0.0
- riesgo: ninguno
```

---

### `release`
```
chore(release): configure next/image domains and vercel environment variables

- qué: next.config.js con media.rawg.io en images.domains; RAWG_API_KEY en Vercel settings
- por qué: sin el dominio allowlisted, next/image bloquea todas las imágenes en producción
- riesgo: si la variable no está en Vercel, el deploy arranca pero todas las llamadas a RAWG fallan
```

```
chore(release): tag v1.0.0 and push to production

- qué: git tag v1.0.0 en el commit de docs(release); npm run build pasa sin errores
- por qué: marca el punto exacto del historial desde el que la app está en producción
- riesgo: ninguno; build verificado antes del tag
```

---

## Reglas rápidas

```
✅  feat(search): add debounced input to CommandPalette
✅  fix(detail): handle missing trailers array with empty default
✅  a11y(card): add descriptive alt text to cover images

❌  feat: various improvements          ← sin scope
❌  fixed stuff                         ← no es Conventional Commits
❌  feat(search): Added debounced...    ← pasado, no imperativo
❌  feat(search): add debounced input to CommandPalette and fix focus bug and update styles
    ← tres responsabilidades, debe ser tres commits
```
