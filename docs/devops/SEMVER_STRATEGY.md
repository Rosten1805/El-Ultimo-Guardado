# Estrategia SemVer — Game Library MVP
> romSphere-inspired · Next.js 14 · RAWG API
> Referencia: semver.org · Conventional Commits 1.0

---

## 1. Esquema de Tags del MVP

```
v0.1.0  ──  Capa de datos cerrada
v0.2.0  ──  Navegación operativa
v0.3.0  ──  Home navegable de extremo a extremo
v0.4.0  ──  App completa (detalle + estados de UI)
v1.0.0  ──  MVP en producción (release público)
```

### Anatomía de una versión

```
  v  MAJOR . MINOR . PATCH
  │    │       │       │
  │    │       │       └─ bug fix, hotfix, corrección sin nueva funcionalidad
  │    │       └───────── nueva funcionalidad backward-compatible
  │    └───────────────── ruptura de contrato o hito de producto
  └────────────────────── prefijo de tag en git (siempre lowercase)
```

### Progresión completa de tags prevista

| Tag | Milestone | Qué está listo | Desplegable |
|-----|-----------|---------------|-------------|
| `v0.1.0` | Fundación de datos | rawgClient · normalizer · API routes · caché | No (sin UI) |
| `v0.1.1` | (si aplica) | Hotfix en normalizer o rawgClient tras v0.1.0 | No |
| `v0.2.0` | Shell + navegación | Layout · PlatformSidebar · CommandPalette | Parcial |
| `v0.3.0` | Secciones y cards | Home · PlatformSection · GameCard · infinite scroll | Sí (preview) |
| `v0.3.1` | (si aplica) | Fix en GameCard o PlatformSection | Sí |
| `v0.4.0` | Detalle + estados | GameDetail · EmptyState · ErrorBoundary · skeletons | Sí |
| `v1.0.0` | MVP Release | a11y auditada · docs completas · Vercel en producción | **Sí (público)** |
| `v1.0.1` | (post-release) | Primer hotfix en producción | Sí |
| `v1.1.0` | (post-MVP) | Primera feature nueva (ej. favoritos, filtro por año) | Sí |

---

## 2. Cuándo Subir Patch, Minor o Major

### PATCH — `v_._.X` → `v_._.X+1`

> **Regla:** el comportamiento existente se restaura. Nada nuevo, nada roto.

**Sube PATCH cuando:**

| Situación | Ejemplo |
|-----------|---------|
| Bug corregido en lógica existente | `fix(normalizer): handle released field with time component` |
| Default faltante para campo null | `fix(normalizer): add fallback empty array for missing tags` |
| Error en URL de imagen | `fix(card): force https on cover url from rawg` |
| Typo en texto de UI o mensaje de error | `fix(ui): correct empty state message for no-results variant` |
| Fix de accesibilidad puntual | `fix(a11y): restore focus to trigger on palette close` |
| Corrección de TTL de caché mal configurado | `fix(cache): set platforms TTL to 86400 instead of 3600` |
| Hotfix en producción | cualquier fix urgente en `main` post-v1.0.0 |

**No sube PATCH:**
- Refactors internos sin cambio de comportamiento → no crea tag, solo commit
- Cambios de estilos sin efecto funcional → acumula en próximo minor

---

### MINOR — `v_.X.0` → `v_.X+1.0`

> **Regla:** funcionalidad nueva que no rompe lo que ya existe.

**Sube MINOR cuando:**

| Situación | Ejemplo |
|-----------|---------|
| Nuevo componente de UI completo | GameCard, ScreenshotGallery, StoreLinks |
| Nueva página o ruta | `/games/[slug]`, `/platform/[id]` |
| Nuevo endpoint en la API proxy | `GET /api/genres` |
| Nuevo campo en GameViewModel | añadir `esrbRating` a `GameDetailVM` |
| Nueva capacidad de filtrado | filtro por año o por género |
| Mejora de performance medible | prefetch on hover, lazy load de secciones |
| Auditoría de a11y completa | el commit `a11y(audit)` de la semana 5 |

**Nota para la fase pre-v1.0.0:** en 0.x.y, el MINOR marca hitos de producto
(no solo features). Cada `v0.X.0` en el MVP representa un milestone semanal completo.

---

### MAJOR — `vX.0.0` → `vX+1.0.0`

> **Regla en 0.x:** cualquier ruptura de contrato justifica major.
> **Regla en ≥1.x:** rompe la API pública o el contrato de datos de forma incompatible.

**Sube MAJOR cuando:**

| Situación | Ejemplo |
|-----------|---------|
| `v0.x → v1.0.0` | MVP listo para uso público real |
| Cambio de contrato de ViewModels incompatible hacia atrás | renombrar `title` → `name` en `GameCardVM` |
| Cambio de estructura de URL que rompe links existentes | `/games/[slug]` → `/game/[id]` |
| Migración de fuente de datos (RAWG → otra API) | ruptura total del normalizer |
| Cambio de framework o runtime principal | Next.js 14 → 15 con App Router breaking changes |

**Nota especial `v0.x`:** mientras la versión sea `0.x.y`, la API pública se considera
inestable por convención semver. Se puede romper el contrato en un MINOR. A partir
de `v1.0.0` se aplica la semántica estricta.

---

## 3. Política de Release: Draft → Release

### Estados de un release en GitHub

```
Commit ──► Tag local ──► Push tag ──► Draft Release ──► Pre-release ──► Release
                                           │                  │              │
                                      solo visible       visible con     público,
                                      para el equipo     warning "pre"   en producción
```

### Flujo completo por tipo de versión

#### Para versiones de hito (`v0.1.0` → `v0.4.0`)

```bash
# 1. Verificar que main está en el estado correcto
git status                        # limpio
npm run build                     # sin errores
npm run test                      # todos pasan

# 2. Crear tag anotado (no lightweight)
git tag -a v0.3.0 -m "feat: PlatformSection with infinite scroll and GameCard complete"

# 3. Push del tag
git push origin v0.3.0

# 4. Crear Draft Release en GitHub
gh release create v0.3.0 \
  --title "v0.3.0 — Secciones y cards" \
  --notes-file .github/releases/v0.3.0.md \
  --draft \
  --prerelease        # ← pre-release hasta v1.0.0

# 5. Review interno del draft (24h)
# 6. Publicar como pre-release (no como release final)
gh release edit v0.3.0 --draft=false
```

#### Para el MVP release (`v1.0.0`)

```bash
# 1. Checklist operativo completo (ver sección 6)

# 2. Tag anotado con mensaje detallado
git tag -a v1.0.0 -m "$(cat <<'EOF'
release: Game Library MVP v1.0.0

First public release of the console-organized game discovery app.
Built on Next.js 14 App Router, RAWG API, TypeScript and Tailwind.

Highlights:
- Desktop-first layout with platform sidebar navigation
- Command Palette (⌘K) with 300ms debounced search
- Per-console game sections with infinite scroll
- Rich game detail page with screenshots, stores and trailers
- WCAG 2.1 AA accessibility audit passed
EOF
)"

# 3. Push
git push origin v1.0.0

# 4. Draft Release — nunca publicar sin draft review
gh release create v1.0.0 \
  --title "Game Library v1.0.0 — MVP" \
  --notes-file .github/releases/v1.0.0.md \
  --draft
  # sin --prerelease en v1.0.0

# 5. Review de release notes (mínimo 1 par de ojos)
# 6. Publicar
gh release edit v1.0.0 --draft=false

# 7. Deploy en Vercel (automático desde main si está configurado)
# 8. Verificación post-deploy (ver sección 6)
```

### Reglas de la política de release

| Regla | Razón |
|-------|-------|
| Siempre tag anotado (`-a`), nunca lightweight | Los anotados llevan mensaje, autor y fecha; los lightweight no |
| Siempre `--draft` primero | Permite revisar el release notes antes de que sea público |
| Nunca forzar un tag existente (`git tag -f`) | Rompe el historial para quien ya tiene el tag en local |
| `v0.x.0` → `--prerelease`; `v1.0.0` → release final | Comunica la estabilidad correctamente en GitHub |
| Un release por tag, un tag por commit de release | Sin tags múltiples en el mismo commit |

---

## 4. Generación de CHANGELOG desde Conventional Commits

### Herramienta recomendada: `conventional-changelog-cli`

```bash
npm install -D conventional-changelog-cli
```

```json
// package.json
{
  "scripts": {
    "changelog": "conventional-changelog -p conventionalcommits -i CHANGELOG.md -s -r 0",
    "changelog:preview": "conventional-changelog -p conventionalcommits -r 1"
  }
}
```

### Qué tipos de commit aparecen en el CHANGELOG

| Tipo de commit | Aparece en CHANGELOG | Sección |
|---------------|---------------------|---------|
| `feat` | ✅ Sí | ✨ Features |
| `fix` | ✅ Sí | 🐛 Bug Fixes |
| `perf` | ✅ Sí | ⚡ Performance |
| `a11y` | ✅ Sí | ♿ Accessibility |
| `data` | ✅ Sí (tratado como feat) | 📦 Data Layer |
| `ui` | ✅ Sí (tratado como feat) | 🎨 UI |
| `docs` | ❌ No (ruido en CHANGELOG público) | — |
| `chore` | ❌ No | — |
| `refactor` | ❌ No (sin efecto visible) | — |
| `test` | ❌ No | — |

### Configuración personalizada para este proyecto

```javascript
// .conventional-changelog.config.js
module.exports = {
  types: [
    { type: "feat",   section: "✨ Features" },
    { type: "fix",    section: "🐛 Bug Fixes" },
    { type: "perf",   section: "⚡ Performance" },
    { type: "a11y",   section: "♿ Accessibility" },
    { type: "data",   section: "📦 Data Layer" },
    { type: "ui",     section: "🎨 UI & Visual" },
    { type: "docs",   hidden: true },
    { type: "chore",  hidden: true },
    { type: "refactor", hidden: true },
    { type: "test",   hidden: true },
  ],
  releaseCommitMessageFormat: "chore(release): {{currentTag}}",
};
```

### Estructura del CHANGELOG generado

```markdown
# Changelog

## [1.0.0] — 2026-05-25

### ✨ Features
- **search:** add CommandPalette triggered by ⌘K with 300ms debounce
- **sections:** add PlatformSection with infinite scroll and 4-column grid
- **detail:** add GameDetail page with screenshots, stores and trailer embed
- **platforms:** add PlatformSidebar with keyboard navigation and active state

### 🎨 UI & Visual
- **layout:** add desktop-first AppShell with 240px fixed sidebar
- **tokens:** add color palette and typography scale to tailwind config
- **card:** add GameCard with cover, rating stars and platform badges

### 📦 Data Layer
- **api:** add /api/games, /api/games/[slug] and /api/platforms routes
- **normalizer:** transform RAWG raw response to GameViewModel with defaults

### ♿ Accessibility
- **audit:** fix focus management, landmarks, contrast and reduced-motion

### 🐛 Bug Fixes
- **detail:** handle missing trailers array with empty default
- **normalizer:** force https on cover URLs from RAWG

---

## [0.4.0] — 2026-05-18
...
```

### Flujo de generación antes de cada tag

```bash
# 1. Preview del changelog para el próximo tag
npm run changelog:preview

# 2. Revisar y editar manualmente si hay commits mal redactados

# 3. Generar y escribir en CHANGELOG.md
npm run changelog

# 4. Commitear el changelog ANTES del tag
git add CHANGELOG.md
git commit -m "docs(changelog): update for v1.0.0"

# 5. Crear el tag DESPUÉS del commit de changelog
git tag -a v1.0.0 -m "release: Game Library MVP v1.0.0"
```

---

## 5. Criterios de Release Notes

### Qué debe tener un release note bien escrito

```markdown
## Game Library v1.0.0 — MVP Release

### Qué hay de nuevo
<!-- 3-5 bullets de las features más visibles para el usuario final.
     Sin jerga técnica. Escribe para alguien que usa la app, no para un dev. -->

- Explora juegos organizados por consola con scroll infinito
- Busca cualquier juego al instante con ⌘K desde cualquier pantalla
- Consulta capturas, tiendas y tráileres en la página de detalle de cada juego

### Cambios técnicos destacados
<!-- Solo los que un dev colaborador necesitaría saber.
     Máximo 4 bullets. Sin detalles de implementación. -->

- Proxy seguro en Next.js API routes: la API key de RAWG nunca llega al cliente
- Caché server-side por TTL (5min juegos, 30min detalle, 24h plataformas)
- Normalización centralizada en `lib/normalizer.ts` — contratos de UI estables

### Breaking changes
<!-- Si es v0.x → v1.0.0, listar qué cambia para quien tenga un fork o integración.
     Si no hay, escribir explícitamente "Ninguno." -->
Ninguno — primera versión pública.

### Bugs corregidos
<!-- Solo los bugs visibles para el usuario. Omitir fixes internos. -->
- Las imágenes con URL http:// de RAWG ahora se sirven correctamente por https://
- El badge de Metacritic ya no aparece cuando el valor es null

### Requisitos
- Node.js 18+
- Variable de entorno `RAWG_API_KEY` (ver README)

### Links
- [Documentación](./README.md)
- [Cómo contribuir](./CONTRIBUTING.md)
- [Changelog completo](./CHANGELOG.md)
```

### Criterios de calidad del release note

| Criterio | ✅ Correcto | ❌ Incorrecto |
|----------|------------|--------------|
| Audiencia | Escrito para quien usa la app | Lleno de jerga de implementación |
| Bullets de features | Máximo 5, orientados a valor | Lista de todos los commits |
| Breaking changes | Explícito aunque sea "Ninguno" | Omitido en silencio |
| Longitud | Legible en 2 minutos | Muro de texto |
| Tono | Informativo y directo | Marketinero o vago |
| Links | README, CHANGELOG, docs | Sin links de contexto |

---

## 6. Checklist Operativo Pre-tag → Tag → Post-release

### FASE 1 — Pre-tag (antes de crear el tag)

#### Código
- [ ] `git status` — working tree limpio, sin cambios sin commitear
- [ ] `git log --oneline -10` — el commit HEAD es el correcto para taggear
- [ ] `npm run build` — completa sin errores TypeScript ni de compilación
- [ ] `npm run lint` — sin errores de ESLint
- [ ] `npm run test` — todos los tests pasan (si existen)
- [ ] No hay `TODO`, `FIXME` o `console.log` introducidos en este milestone

#### Datos y seguridad
- [ ] `RAWG_API_KEY` no aparece en ningún archivo commiteado (`git grep RAWG_API_KEY`)
- [ ] `.env.local` no está trackeado (`git ls-files .env.local` → vacío)
- [ ] `.env.example` está actualizado con todas las variables actuales
- [ ] Los ViewModels (`types/viewModels.ts`) reflejan el modelo final del milestone

#### Calidad
- [ ] Flujo principal probado manualmente: Home → sidebar → búsqueda ⌘K → detalle → tienda
- [ ] Casos límite verificados: juego sin metacritic, sin screenshots, sin trailers
- [ ] Lighthouse en `localhost`: Performance ≥ 80, Accessibility ≥ 85 (≥ 90 para v1.0.0)
- [ ] Sin scroll horizontal en 1440px, 1280px y 1024px

#### Documentación
- [ ] `CHANGELOG.md` generado y commiteado (`npm run changelog`)
- [ ] `README.md` actualizado si cambia el setup o las variables de entorno
- [ ] Si es `v1.0.0`: `CONTRIBUTING.md` y `COMMIT_TEMPLATE.md` presentes

---

### FASE 2 — Tag

```bash
# Crear tag anotado
git tag -a v1.0.0 -m "release: Game Library MVP v1.0.0"

# Verificar que el tag apunta al commit correcto
git show v1.0.0 --stat

# Push del tag (separado del push de código)
git push origin v1.0.0

# Verificar que el tag llegó a GitHub
gh release list
```

- [ ] Tag creado como anotado (`git tag -a`), no lightweight
- [ ] Mensaje del tag es descriptivo (no solo el número de versión)
- [ ] `git push origin <tag>` ejecutado explícitamente
- [ ] Tag visible en `gh release list` o en GitHub → Releases

---

### FASE 3 — Draft Release

```bash
# Crear draft con notas desde archivo
gh release create v1.0.0 \
  --title "Game Library v1.0.0 — MVP" \
  --notes-file .github/releases/v1.0.0.md \
  --draft

# Verificar el draft
gh release view v1.0.0
```

- [ ] Draft creado en GitHub con `--draft` (no publicado aún)
- [ ] Título sigue el formato: `Game Library vX.Y.Z — <nombre del milestone>`
- [ ] Release notes redactadas según criterios de la sección 5
- [ ] Assets adjuntos si aplica (no aplica para app web)
- [ ] Al menos una persona revisa el draft antes de publicar

---

### FASE 4 — Publicación

```bash
# Publicar el release (quitar --draft)
gh release edit v1.0.0 --draft=false

# Para v0.x: mantener como pre-release
gh release edit v0.3.0 --draft=false --prerelease

# Para v1.0.0: release final (sin --prerelease)
gh release edit v1.0.0 --draft=false
```

- [ ] Release publicado con `--draft=false`
- [ ] Versiones `v0.x.0` marcadas como `--prerelease`
- [ ] Versión `v1.0.0` sin `--prerelease`
- [ ] URL del release compartida con el equipo

---

### FASE 5 — Post-release (solo v1.0.0 y versiones desplegadas)

#### Deploy
- [ ] Deploy en Vercel completado (verificar en dashboard o `vercel ls`)
- [ ] URL de producción carga correctamente
- [ ] `RAWG_API_KEY` presente en Vercel → Settings → Environment Variables
- [ ] `media.rawg.io` en `next.config.js` → `images.domains` (imágenes cargan en prod)

#### Verificación en producción
- [ ] Home carga juegos reales de RAWG (no placeholder)
- [ ] CommandPalette (⌘K) devuelve resultados en < 500ms
- [ ] GameDetail de al menos 3 juegos distintos carga correctamente
- [ ] Las imágenes no fallan con error de dominio de `next/image`
- [ ] Network tab: `RAWG_API_KEY` no aparece en ninguna request del cliente
- [ ] Lighthouse en producción: Performance ≥ 85, Accessibility ≥ 90

#### Comunicación
- [ ] Enlace al release de GitHub compartido
- [ ] `CHANGELOG.md` en el repositorio actualizado
- [ ] Rama `main` apunta al commit taggeado

---

## Resumen Visual del Flujo Completo

```
main branch
│
├── commits de milestone 3...
│
├── docs(changelog): update for v0.3.0          ← siempre ANTES del tag
│
├── TAG v0.3.0 ──────────────────────────────── git tag -a v0.3.0
│   │                                            git push origin v0.3.0
│   └── Draft Release (prerelease) ───────────  gh release create --draft --prerelease
│       └── Publicar ────────────────────────── gh release edit --draft=false
│
├── commits de milestone 4...
│
├── docs(changelog): update for v0.4.0
├── TAG v0.4.0 ──────────────────────────────── idem, prerelease
│
├── a11y(audit): ...
├── docs(release): add README and CHANGELOG
│
├── docs(changelog): update for v1.0.0
├── TAG v1.0.0 ──────────────────────────────── release FINAL (sin prerelease)
│   └── Draft Review (≥1 persona)
│       └── gh release edit v1.0.0 --draft=false
│           └── Vercel deploy automático desde main
│               └── Checklist post-release ✓
```
