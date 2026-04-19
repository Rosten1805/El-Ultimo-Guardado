<!--
  Game Library MVP — Pull Request Template
  Borra las instrucciones en comentarios antes de abrir el PR.
  Los campos opcionales están marcados con (opcional).
-->

## Resumen

<!--
  Una o dos frases. Responde: ¿qué hace este PR y por qué existe?
  No repitas el título. Escribe para alguien que no conoce el issue.
-->

**Issue relacionado:** closes #<!-- número -->
**Tipo:** <!-- feat | fix | refactor | a11y | docs | chore | perf | data -->
**Área:** <!-- api | search | home | platforms | sections | card | detail | ui | release -->

---

## Cambios principales

<!--
  Lista los cambios técnicos concretos. Máximo 6 bullets.
  Usa formato: verbo en presente + qué + dónde
-->

- 
- 
- 

<details>
<summary>Archivos modificados relevantes</summary>

<!-- Lista solo los no obvios o que requieren contexto especial -->

| Archivo | Tipo de cambio | Nota |
|---------|---------------|------|
| `lib/normalizer.ts` | modificado | |
| `components/GameCard/GameCard.tsx` | nuevo | |

</details>

---

## Cómo probar

<!--
  Pasos exactos y reproducibles. Quien revisa debe poder seguirlos sin preguntar.
  Incluye el estado inicial necesario (datos, flags, usuario, etc.)
-->

**Setup previo:**
```bash
# Copiar si hay pasos de entorno necesarios
cp .env.example .env.local
# RAWG_API_KEY=tu_key
npm run dev
```

**Flujo principal:**
1. 
2. 
3. 

**Resultado esperado:**
> <!-- Qué debe verse o comportarse distinto -->

**Casos límite a verificar:**
- [ ] Sin resultados (búsqueda sin matches)
- [ ] Error de red / RAWG no responde
- [ ] Campo `null` desde la API (ej. `metacritic: null`, `released: null`)
- [ ] Lista vacía de screenshots o stores

---

## Capturas / Diagramas (opcional)

<!--
  Antes/después para cambios visuales.
  Diagrama de flujo para cambios en data layer.
  Omite si el cambio es puramente lógico sin efecto visual.
-->

| Antes | Después |
|-------|---------|
| <!-- imagen o descripción --> | <!-- imagen o descripción --> |

---

## Riesgos

<!--
  Sé honesto. Un riesgo reconocido es mejor que un bug en producción.
  Si no hay riesgos reales, escribe "Ninguno" — no lo omitas.
-->

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| <!-- ej. RAWG devuelve 429 bajo carga --> | <!-- alta/media/baja --> | <!-- ej. backoff exponencial en rawgClient --> |

**¿Este PR puede afectar a otras áreas de la app?**
- [ ] No afecta otras áreas
- [ ] Sí — detalla: <!-- PlatformSidebar, CommandPalette, etc. -->

---

## Impacto en datos

<!--
  Rellena si el PR toca lib/normalizer.ts, types/viewModels.ts,
  lib/rawgClient.ts, lib/cache.ts o cualquier Route Handler de /api/.
  Si no toca la capa de datos, borra esta sección.
-->

**¿Cambia el contrato de ViewModels?**
- [ ] No — los tipos de `GameCardVM` / `GameDetailVM` / `PlatformVM` no cambian
- [ ] Sí — especifica el campo nuevo/eliminado/renombrado:

```typescript
// Antes
interface GameCardVM {
  // ...
}

// Después
interface GameCardVM {
  // ...
}
```

**¿Cambia el comportamiento de caché?**
- [ ] No
- [ ] Sí — nuevo TTL: `___` · endpoint afectado: `___`

**¿Hay riesgo de exponer la API key al cliente?**
- [ ] Verificado: `RAWG_API_KEY` no aparece en ninguna respuesta al browser

**Endpoints de RAWG afectados:**
- [ ] `/games`
- [ ] `/games/{id}`
- [ ] `/games/{id}/screenshots`
- [ ] `/games/{id}/stores`
- [ ] `/games/{id}/movies`
- [ ] `/platforms`
- [ ] Ninguno

---

## Checklist

### Funcional
- [ ] El flujo principal funciona de extremo a extremo en local
- [ ] Los casos límite listados en "Cómo probar" están verificados
- [ ] No hay `console.error` en flujos normales

### Datos y null handling
- [ ] Todos los campos opcionales de RAWG tienen default en `normalizer.ts`
- [ ] Arrays que pueden ser vacíos (`screenshots`, `stores`, `trailers`) se tratan como `[]`
- [ ] `metacritic: null` no muestra badge (no se convierte a `0`)
- [ ] `released: null` no muestra año (no se convierte a `NaN`)
- [ ] URLs de imágenes forzadas a `https://` o reemplazadas por placeholder local

### Accesibilidad (a11y)
- [ ] Todos los `<button>` e `<a>` sin texto visible tienen `aria-label`
- [ ] Imágenes de portada con `alt="Cover de {título}"`, decorativas con `alt=""`
- [ ] Elementos interactivos nuevos son alcanzables con Tab y activables con Enter/Space
- [ ] Si se añade un modal o dialog: foco atrapado dentro, Esc lo cierra, foco regresa al trigger
- [ ] axe-core sin errores críticos (ejecutar en DevTools o con `npm run lint:a11y` si existe)
- [ ] `prefers-reduced-motion` respetado en nuevas animaciones

### Performance
- [ ] Imágenes nuevas usan `<Image>` de `next/image` con `sizes` apropiado
- [ ] No hay fetches en cliente que puedan moverse al servidor
- [ ] No se importan librerías pesadas sin lazy load (`dynamic(() => import(...))`)
- [ ] Si se usa `useEffect` para fetching: considerar mover a TanStack Query

### Estados de UI
- [ ] Estado de carga con skeleton (no spinner global si es parcial)
- [ ] Estado vacío con `<EmptyState>` y mensaje útil
- [ ] Estado de error con `<ErrorBoundary>` local (no rompe el resto de la página)
- [ ] Estado de carga de "siguiente página" (infinite scroll) diferenciado del inicial

### Responsive desktop-first
- [ ] Verificado en 1440px (layout base)
- [ ] Verificado en 1280px (sidebar colapsable)
- [ ] Verificado en 1024px (mínimo soportado)
- [ ] Sin scroll horizontal en ningún breakpoint ≥ 1024px

### Documentación
- [ ] Tipos nuevos en `types/viewModels.ts` o `types/rawg.ts` con JSDoc si no son obvios
- [ ] Si se añade un Route Handler nuevo: comentario de 1 línea con TTL y motivo
- [ ] CHANGELOG actualizado si el PR forma parte de un milestone (`v0.x.0`)
- [ ] `RAWG_DATA_LAYER.md` actualizado si cambia el modelo o se añade un endpoint

---

<!--
═══════════════════════════════════════════════════════
  PROMPT DE REVISIÓN PARA IA
  ─────────────────────────────────────────────────────
  Copia el bloque de abajo y pégalo en Claude / Copilot
  junto con el diff del PR para obtener una revisión
  enfocada en las áreas críticas de este proyecto.
═══════════════════════════════════════════════════════
-->

<details>
<summary>🤖 Prompt de revisión para IA — expandir para copiar</summary>

```
Actúa como revisor técnico senior de una app Next.js 14 desktop-first
de descubrimiento de videojuegos por consolas que usa RAWG API como fuente.

El stack es: Next.js 14 App Router · TypeScript · Tailwind · TanStack Query ·
Zustand · normalizer pattern (RAWG raw → GameViewModel).

Revisa el siguiente diff con foco en estos 6 ejes. Para cada problema
encontrado: indica el archivo y línea aproximada, describe el problema,
su impacto real en la app y una corrección concreta.

── 1. DEUDA TÉCNICA ──────────────────────────────────────────────────────────
- ¿Hay lógica duplicada que debería estar en un hook o util compartido?
- ¿Hay TODOs, hacks o workarounds que no tienen issue asociado?
- ¿Algún componente está haciendo más de una cosa (viola SRP)?
- ¿Hay dependencias instaladas que no se usan en el diff?

── 2. NULL HANDLING ──────────────────────────────────────────────────────────
- ¿Hay accesos a propiedades de objetos que podrían ser null/undefined
  sin optional chaining o guards?
- ¿Hay campos de RAWG (metacritic, released, background_image,
  description, screenshots, stores, trailers) que no tienen default?
- ¿Se convierte incorrectamente null a 0, "" o false en lugar de
  preservarlo como null para que la UI pueda ocultarlo?
- ¿Hay arrays que se asumen no vacíos sin comprobación de length?

── 3. SOBRE-FETCHING ─────────────────────────────────────────────────────────
- ¿Se llama a la API de RAWG (directamente o vía /api/) más veces
  de las necesarias para el mismo dato?
- ¿Hay fetches en useEffect que deberían estar en TanStack Query
  (sin deduplicación ni caché)?
- ¿Se descargan campos de RAWG que el normalizer descarta
  y podrían filtrarse con ?fields= si el endpoint lo soporta?
- ¿Hay componentes que lanzan el mismo request de forma independiente
  en lugar de compartir la caché de TanStack Query?

── 4. ACOPLAMIENTO UI / DATA ─────────────────────────────────────────────────
- ¿Algún componente de UI importa directamente desde lib/rawgClient.ts
  o conoce la forma del JSON crudo de RAWG (tipos de rawg.ts)?
- ¿Hay lógica de transformación (flatten, defaults, safeUrl) dentro
  de un componente React en lugar de en el normalizer?
- ¿Se pasan props de tipo RAWGGame en lugar de GameCardVM o GameDetailVM
  a los componentes?
- ¿Hay fetch directo a api.rawg.io desde el cliente (expone la API key)?

── 5. ACCESIBILIDAD ──────────────────────────────────────────────────────────
- ¿Hay botones o enlaces sin texto visible y sin aria-label?
- ¿Hay imágenes sin atributo alt, o con alt="" cuando no son decorativas?
- ¿Hay modals o dialogs nuevos sin focus trap, sin Esc para cerrar,
  o sin restauración de foco al trigger?
- ¿Hay elementos interactivos nuevos que no son alcanzables con Tab?
- ¿Hay animaciones o transiciones nuevas sin @media prefers-reduced-motion?
- ¿Se usa color como único diferenciador de información (sin texto/icono)?

── 6. NAMING Y ESTRUCTURA ────────────────────────────────────────────────────
- ¿Los nombres de componentes, hooks y funciones siguen la convención
  del proyecto? (PascalCase componentes, camelCase hooks con "use",
  kebab-case para rutas y archivos de page/layout)
- ¿Hay props nombradas de forma inconsistente con el ViewModel
  (ej. "name" en lugar de "title", "image" en lugar de "cover")?
- ¿Hay archivos colocados en la carpeta incorrecta según la estructura
  definida (lib/ vs components/ vs stores/ vs types/)?
- ¿Los tipos de TypeScript están en types/ o definidos inline en
  componentes cuando deberían estar centralizados?

── FORMATO DE RESPUESTA ──────────────────────────────────────────────────────
Para cada problema encontrado usa este formato:

**[EJE] Archivo: `ruta/archivo.ts` — línea aprox. N**
Problema: descripción concisa del problema
Impacto: efecto real en la app (crash, bug silencioso, degradación, etc.)
Corrección:
\`\`\`typescript
// código corregido
\`\`\`

Si un eje no tiene problemas, escribe: "✅ Sin observaciones en este eje."
Termina con un resumen de: críticos (bloquean merge) / menores (mejoras) / sugerencias.

DIFF A REVISAR:
[pega aquí el output de `git diff main...HEAD` o el diff del PR]
```

</details>
