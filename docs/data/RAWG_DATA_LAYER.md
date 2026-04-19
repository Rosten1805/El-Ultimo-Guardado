# RAWG API — Capa de Datos para Game Library App
> Analista: Arquitectura de datos para app desktop-first de descubrimiento por consolas

---

## 1. Endpoints Prioritarios

| # | Endpoint | Método | Uso en App | Params clave | Caché sugerido |
|---|----------|--------|------------|--------------|----------------|
| 1 | `/games` | GET | Listado principal, búsqueda, secciones por plataforma | `search`, `platforms`, `genres`, `ordering`, `page`, `page_size` | 5 min |
| 2 | `/games/{id}` | GET | Página de detalle de juego | `id` o `slug` | 30 min |
| 3 | `/platforms` | GET | Menú lateral / navegación por consola | `ordering`, `page_size` | 24 h |
| 4 | `/genres` | GET | Filtros de género, etiquetas visuales | `ordering`, `page_size` | 24 h |
| 5 | `/games/{id}/screenshots` | GET | Galería en detalle de juego | `id` | 30 min |
| 6 | `/games/{id}/stores` | GET | Links de compra en detalle | `id` | 1 h |
| 7 | `/games/{id}/movies` | GET | Tráilers (disponibilidad limitada) | `id` | 1 h |
| 8 | `/games/{id}/additions` | GET | DLCs / ediciones relacionadas | `id` | 1 h |
| 9 | `/tags` | GET | Nube de etiquetas / filtros avanzados | `page_size` | 24 h |
| 10 | `/developers` | GET | Sección "Por estudio" (fase 2) | `page_size` | 24 h |

### Params globales obligatorios en cada request
```
?key=${RAWG_API_KEY}
```

### Ejemplo de URL construida
```
GET https://api.rawg.io/api/games
  ?key=${RAWG_API_KEY}
  &platforms=18,4,187
  &ordering=-metacritic
  &page_size=40
  &page=1
```

---

## 2. Riesgos y Límites del API

### Límites conocidos

| Límite | Valor | Impacto |
|--------|-------|---------|
| Rate limit | ~20.000 req/mes (free tier) | Crítico para producción con muchos usuarios |
| `page_size` máximo | 40 resultados por página | Requiere paginación en listas largas |
| `/movies` cobertura | <15% del catálogo tiene tráilers | No asumir disponibilidad; manejar array vacío |
| `description` | HTML crudo (no Markdown) | Requiere sanitización antes de renderizar |
| Imágenes | Sin CDN propio garantizado | Algunas URLs pueden expirar o ser lentas |
| HTTPS | Mayoritariamente seguro, pero verificar | Forzar `https://` en transform |

### Riesgos de datos

| Riesgo | Descripción | Mitigación |
|--------|-------------|-----------|
| Campos `null` frecuentes | `metacritic`, `released`, `description`, `background_image` | Defaults en capa de transform |
| Inconsistencia de IDs | Algunos juegos tienen `id` numérico + `slug` string | Usar siempre `slug` como key de navegación |
| Plataformas anidadas | `platforms[].platform.id` — triple nivel de anidación | Flatten en transform |
| Ratings contradictorios | RAWG `rating` (1-5) vs `metacritic` (0-100) | Exponer ambos, escalar RAWG a 0-100 si se unifica |
| Duplicados en búsqueda | DLCs aparecen mezclados con juegos base | Filtrar con `&exclude_additions=true` |
| Sin autenticación OAuth | API key en cliente = expuesta | Siempre proxiar desde backend/edge function |

### Advertencia de seguridad
> ⚠️ La API key en `.env` **nunca** debe exponerse en código frontend. Usar siempre un proxy backend (Next.js API routes, Edge Functions, etc.) que inyecte la key server-side.

---

## 3. Modelo Normalizado para Frontend

```typescript
interface Game {
  // Identidad
  id: number;
  slug: string;
  title: string;

  // Contenido
  description: string;          // HTML sanitizado
  cover: string;                // background_image (portrait crop)
  backgroundImage: string;      // background_image (landscape, hero)

  // Temporal
  released: string | null;      // "YYYY-MM-DD"
  year: number | null;          // extraído de released

  // Clasificación
  genres: Genre[];
  platforms: Platform[];
  tags: Tag[];

  // Valoraciones
  rating: number;               // 0-5 (RAWG community)
  ratingCount: number;
  metacritic: number | null;    // 0-100

  // Media
  screenshots: Screenshot[];
  stores: Store[];
  trailers: Trailer[];          // desde /movies
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
  image: string | null;         // logo de consola si disponible
  releaseYear: number | null;   // año de lanzamiento en esa plataforma
}

interface Screenshot {
  id: number;
  url: string;                  // forzado https://
  width: number;
  height: number;
}

interface Store {
  id: number;
  name: string;
  url: string;
  domain: string;               // "store.steampowered.com"
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Trailer {
  id: number;
  name: string;
  preview: string;              // thumbnail URL
  video: {
    low: string;
    max: string;
  };
}
```

---

## 4. Reglas de Transformación

### 4.1 Arrays anidados → arrays planos

```
// RAWG raw
platforms: [
  { platform: { id: 18, name: "PlayStation 4", slug: "playstation4" }, released_at: "2015-03-17" },
  { platform: { id: 4,  name: "PC",            slug: "pc"           }, released_at: null }
]

// → Transformado
platforms: [
  { id: 18, name: "PlayStation 4", slug: "playstation4", releaseYear: 2015, image: null },
  { id: 4,  name: "PC",            slug: "pc",           releaseYear: null, image: null }
]
```

```
// RAWG raw
genres: [{ id: 4, name: "Action", slug: "action" }]

// → Transformado (ya plano, solo normalizar campos)
genres: [{ id: 4, name: "Action", slug: "action" }]
```

### 4.2 released → year

```
released: "2015-09-10"  →  year: 2015
released: null          →  year: null
released: ""            →  year: null
```

### 4.3 Valores null/undefined → defaults

| Campo | Default |
|-------|---------|
| `description` | `""` |
| `cover` / `backgroundImage` | `"/assets/placeholder-cover.webp"` |
| `metacritic` | `null` (no mostrar badge) |
| `rating` | `0` |
| `ratingCount` | `0` |
| `screenshots` | `[]` |
| `stores` | `[]` |
| `trailers` | `[]` |
| `tags` | `[]` |
| `year` | `null` |

### 4.4 Imágenes → URLs seguras

```javascript
function safeImageUrl(url) {
  if (!url || typeof url !== "string") return "/assets/placeholder-cover.webp";
  return url.startsWith("http://")
    ? url.replace("http://", "https://")
    : url;
}
```

### 4.5 Descripción HTML → sanitizada

```javascript
import DOMPurify from "dompurify";

function sanitizeDescription(raw) {
  if (!raw) return "";
  return DOMPurify.sanitize(raw, { ALLOWED_TAGS: ["p", "br", "b", "i", "ul", "li"] });
}
```

### 4.6 Rating RAWG → escala visual

```javascript
// RAWG usa escala 1-5; para mostrar estrellas o barra:
function normalizeRating(rating) {
  return Math.round((rating / 5) * 100);  // → 0-100
}
```

---

## 5. Ejemplos JSON — Antes / Después

### 5.1 `/games` — Item de listado

**RAW (RAWG response)**
```json
{
  "id": 3498,
  "slug": "grand-theft-auto-v",
  "name": "Grand Theft Auto V",
  "released": "2013-09-17",
  "background_image": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  "rating": 4.47,
  "ratings_count": 6149,
  "metacritic": 97,
  "genres": [
    { "id": 4, "name": "Action", "slug": "action" },
    { "id": 3, "name": "Adventure", "slug": "adventure" }
  ],
  "platforms": [
    { "platform": { "id": 4, "name": "PC", "slug": "pc" }, "released_at": "2015-04-14" },
    { "platform": { "id": 18, "name": "PlayStation 4", "slug": "playstation4" }, "released_at": "2014-11-18" }
  ],
  "tags": [
    { "id": 31, "name": "Singleplayer", "slug": "singleplayer", "language": "eng" },
    { "id": 7, "name": "Multiplayer", "slug": "multiplayer", "language": "eng" }
  ],
  "short_screenshots": [
    { "id": 1828755, "image": "https://media.rawg.io/media/screenshots/1a5/1a5b08c279...jpg" }
  ]
}
```

**TRANSFORMADO (modelo frontend)**
```json
{
  "id": 3498,
  "slug": "grand-theft-auto-v",
  "title": "Grand Theft Auto V",
  "description": "",
  "cover": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  "backgroundImage": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  "released": "2013-09-17",
  "year": 2013,
  "genres": [
    { "id": 4, "name": "Action", "slug": "action" },
    { "id": 3, "name": "Adventure", "slug": "adventure" }
  ],
  "platforms": [
    { "id": 4, "name": "PC", "slug": "pc", "releaseYear": 2015, "image": null },
    { "id": 18, "name": "PlayStation 4", "slug": "playstation4", "releaseYear": 2014, "image": null }
  ],
  "rating": 4.47,
  "ratingCount": 6149,
  "metacritic": 97,
  "screenshots": [
    { "id": 1828755, "url": "https://media.rawg.io/media/screenshots/1a5/1a5b08c279...jpg", "width": 0, "height": 0 }
  ],
  "stores": [],
  "tags": [
    { "id": 31, "name": "Singleplayer", "slug": "singleplayer" },
    { "id": 7, "name": "Multiplayer", "slug": "multiplayer" }
  ],
  "trailers": []
}
```

---

### 5.2 `/games/{id}` — Detalle completo

**RAW**
```json
{
  "id": 3498,
  "description": "<p>Rockstar Games went bigger...</p>",
  "background_image": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
  "background_image_additional": "https://media.rawg.io/media/games/456/background_additional.jpg",
  "metacritic": 97,
  "rating": 4.47,
  "ratings_count": 6149,
  "released": "2013-09-17"
}
```

**TRANSFORMADO**
```json
{
  "description": "<p>Rockstar Games went bigger...</p>",
  "cover": "https://media.rawg.io/media/games/456/background_additional.jpg",
  "backgroundImage": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg"
}
```
> En detalle, `cover` usa `background_image_additional` (más portrait) y `backgroundImage` es la imagen hero landscape.

---

### 5.3 `/games/{id}/stores`

**RAW**
```json
{
  "results": [
    { "id": 290375, "game_id": 3498, "store_id": 1, "url": "https://store.steampowered.com/app/271590/" },
    { "id": 290376, "game_id": 3498, "store_id": 3, "url": "https://www.playstation.com/en-us/games/grand-theft-auto-v/" }
  ]
}
```

**TRANSFORMADO**
```json
[
  { "id": 1, "name": "Steam", "url": "https://store.steampowered.com/app/271590/", "domain": "store.steampowered.com" },
  { "id": 3, "name": "PlayStation Store", "url": "https://www.playstation.com/en-us/games/grand-theft-auto-v/", "domain": "www.playstation.com" }
]
```
> `name` se mapea desde tabla local de store IDs (RAWG no devuelve el nombre en `/stores` del juego).

### Mapa de Store IDs (RAWG)

| store_id | Nombre | domain |
|----------|--------|--------|
| 1 | Steam | store.steampowered.com |
| 2 | Xbox Store | microsoft.com |
| 3 | PlayStation Store | playstation.com |
| 4 | App Store | apps.apple.com |
| 5 | GOG | gog.com |
| 6 | Nintendo eShop | nintendo.com |
| 7 | Xbox 360 Store | microsoft.com |
| 8 | Google Play | play.google.com |
| 9 | itch.io | itch.io |
| 11 | Epic Games | epicgames.com |

---

### 5.4 Caso null — juego sin fecha ni metacritic

**RAW**
```json
{
  "id": 999,
  "name": "Indie Game XYZ",
  "released": null,
  "background_image": null,
  "metacritic": null,
  "rating": 0,
  "ratings_count": 0
}
```

**TRANSFORMADO**
```json
{
  "id": 999,
  "slug": "indie-game-xyz",
  "title": "Indie Game XYZ",
  "description": "",
  "cover": "/assets/placeholder-cover.webp",
  "backgroundImage": "/assets/placeholder-cover.webp",
  "released": null,
  "year": null,
  "genres": [],
  "platforms": [],
  "rating": 0,
  "ratingCount": 0,
  "metacritic": null,
  "screenshots": [],
  "stores": [],
  "tags": [],
  "trailers": []
}
```

---

## 6. Checklist de Validación de Calidad de Datos

### Por campo

- [ ] `id` — siempre número entero, nunca `0` o negativo
- [ ] `slug` — string kebab-case, sin caracteres especiales, usado como URL
- [ ] `title` — no vacío; máx. recomendar truncar a 80 chars en UI
- [ ] `description` — sanitizada con DOMPurify; si `""`, UI muestra placeholder
- [ ] `cover` — URL `https://` válida o placeholder local; nunca string vacío
- [ ] `backgroundImage` — mismo criterio que `cover`
- [ ] `released` — formato `YYYY-MM-DD` o `null`; nunca string vacío
- [ ] `year` — número 4 dígitos (>1970) o `null`
- [ ] `genres` — array, puede ser vacío `[]`; cada item con `id`, `name`, `slug`
- [ ] `platforms` — array plano (sin `.platform` anidado); `releaseYear` como número o `null`
- [ ] `rating` — float entre 0 y 5; no negativo
- [ ] `ratingCount` — entero ≥ 0
- [ ] `metacritic` — entero 0-100 o `null` (no mostrar badge si `null`)
- [ ] `screenshots` — array; cada URL `https://` válida
- [ ] `stores` — array; nombre resuelto desde mapa de store IDs
- [ ] `tags` — solo idioma `"eng"` si se filtra por idioma
- [ ] `trailers` — array; videos accesibles por `.video.max` o `.video.low`

### Por endpoint

- [ ] `/games` — verificar `next` en response para paginación; `count` > 0
- [ ] `/games/{id}` — `description` puede ser HTML multilínea; sanitizar siempre
- [ ] `/games/{id}/screenshots` — puede devolver array vacío; manejar sin error
- [ ] `/games/{id}/stores` — `url` de cada store puede ser `""` o inválida; validar con regex
- [ ] `/games/{id}/movies` — si `results: []`, no renderizar sección de tráilers
- [ ] `/platforms` — ordenar por popularidad (`-games_count`) para mostrar consolas principales primero

### De integración

- [ ] La API key nunca aparece en código frontend ni en logs del cliente
- [ ] Todos los requests pasan por proxy backend
- [ ] Los errores 429 (rate limit) disparan backoff exponencial
- [ ] Los errores 404 redirigen a página de "juego no encontrado"
- [ ] Los timeouts (>5s) muestran skeleton loader, no pantalla en blanco
- [ ] El caché por endpoint respeta los TTLs definidos en la tabla de endpoints

### De UI/UX

- [ ] Placeholder visible cuando `cover` es imagen local
- [ ] Badge de Metacritic oculto cuando valor es `null`
- [ ] Estrellas de rating basadas en escala 0-5 (no dividir por 100)
- [ ] Año mostrado solo cuando `year !== null`
- [ ] Lista de plataformas truncada visualmente a 4-5 items (resto en tooltip)
- [ ] Descripción HTML renderizada, no como texto plano

---

## Notas de Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Frontend (Desktop-first)            │
│  Sidebar consolas │ Grid de juegos │ Detalle     │
└────────────┬────────────────────────────────────┘
             │ fetch /api/games/*
┌────────────▼────────────────────────────────────┐
│            Backend Proxy / Edge Functions        │
│  - Inyecta API key                              │
│  - Normaliza respuesta (transform layer)         │
│  - Caché en-memory / Redis por TTL              │
└────────────┬────────────────────────────────────┘
             │ https con key
┌────────────▼────────────────────────────────────┐
│              RAWG API (api.rawg.io)              │
└─────────────────────────────────────────────────┘
```

> La capa de transform **vive en el backend**, nunca en el cliente. El frontend consume siempre el modelo normalizado, nunca el JSON raw de RAWG.
