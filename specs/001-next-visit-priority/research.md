# Research: Next-Visit Priority App

Phase 0 output — all NEEDS CLARIFICATION resolved, all technology decisions made.

---

## Decision 1 — Map Library

**Decision**: `react-leaflet` v4 + `Leaflet` v1 for the neighborhood map.

**Rationale**:
- Leaflet's `L.TileLayer` accepts any URL template including local paths (`/tiles/{z}/{x}/{y}.png`), making zero-network tile serving straightforward.
- `react-leaflet` provides idiomatic React bindings (`<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Popup>`).
- SSR conflict (Leaflet uses `window` internally) is resolved with a single `dynamic(() => import('./QueueMap'), { ssr: false })` call in Next.js App Router.
- Bundle impact: ~140 KB (Leaflet) + ~20 KB (react-leaflet) gzipped — acceptable for a field device.
- Pin highlighting for list↔map sync is a single `marker.openPopup()` / `map.setView()` call.

**Alternatives considered**:
- **MapLibre GL JS**: More powerful but designed for vector tiles; ~250 KB gzipped; adds complexity without benefit for simple raster pins.
- **Google Maps / Mapbox SDK**: Require network API calls — incompatible with FR-012.
- **Static PNG image overlay**: No interactivity; fails FR-002 (tap pin ↔ list sync).

---

## Decision 2 — Offline Tile Pack

**Decision**: Pre-download OSM raster tiles for the pilot bounding box at zoom levels 14–17, store as `public/tiles/{z}/{x}/{y}.png`. A one-time shell script (or `tile-dl` CLI) fetches tiles at setup; no runtime network calls.

**Rationale**:
- `public/` in Next.js is served as static assets from the same origin — tiles load as plain `<img>` requests with no CORS issues.
- Zoom 14 = neighborhood overview; zoom 17 = individual buildings/streets. Appropriate range for walking-route planning in a ~1–3 km² micro-area.
- Tile count: a 2 km² area at z14–17 ≈ 300–500 tiles × ~15 KB average = ~8 MB total — fits comfortably in a Next.js static build.
- OSM tile policy: limited bulk downloading for non-commercial pilot use is permitted when polite (rate-limited, single-use); a production rollout would use a self-hosted tile server or commercial tile provider.

**Tile configuration in Leaflet**:
```ts
<TileLayer
  url="/tiles/{z}/{x}/{y}.png"
  attribution="© OpenStreetMap contributors"
  minZoom={14}
  maxZoom={17}
/>
```

**Alternatives considered**:
- Service Worker cache: Requires one online session to prime; doesn't satisfy true zero-network (FR-012).
- PMTiles (vector, MapLibre): Requires MapLibre GL JS; heavier stack without benefit for this POC.

---

## Decision 3 — Browser Storage

**Decision**: `idb` v8 for visit records and audit log (IndexedDB); static TypeScript ESM module for the roster.

**Rationale**:
- IndexedDB handles structured objects with typed indexes; `idb` provides a clean Promise API with TypeScript generics at ~5 KB.
- The `familyId` index on the `visits` store enables efficient history lookup per family without scanning all records.
- Roster (families, residents, micro-area, CHA) is read-only in the MVP — a TypeScript module is the simplest possible "storage": no serialization, fully typed at compile time, tree-shakeable.
- `fake-indexeddb` is a drop-in Jest replacement for real IndexedDB — storage integration tests run in Node without a browser.

**Alternatives considered**:
- `Dexie.js`: Feature-rich reactive ORM; overkill for ~50 records and a single table.
- `localStorage`: String-only, 5–10 MB quota, no indexed queries; harder to migrate later.
- SQLite via WASM (`sql.js`): ~1.2 MB WASM binary; overkill.
- PouchDB: Adds CouchDB sync — explicitly not needed (FR-012).

---

## Decision 4 — Risk Scoring Algorithm

**Decision**: Weighted additive model with configurable weights; pure function, no side effects.

**Formula**:
```
score = w_time      × f_time
      + w_chronic   × f_chronic
      + w_vulnerable × f_vulnerable
      + w_followup  × f_followup
```

**Factor definitions**:

| Factor | Formula | Range |
|--------|---------|-------|
| `f_time` | `min(daysSinceLastVisit / NEVER_VISITED_CAP, 1.0)` | [0, 1] |
| `f_chronic` | `min(totalChronicConditions / CHRONIC_CAP, 1.0)` | [0, 1] |
| `f_vulnerable` | `vulnerableResidentCount / totalResidents` | [0, 1] |
| `f_followup` | `1.0` if any active follow-up flag, else `0.0` | {0, 1} |

**Constants (pilot defaults, tunable)**:
- `NEVER_VISITED_CAP = 365` — never-visited families get `f_time = 1.0`
- `CHRONIC_CAP = 5` — 5+ conditions = max chronic signal
- Default weights: `w_time = 0.40, w_chronic = 0.25, w_vulnerable = 0.25, w_followup = 0.10`

**Vulnerable groups**: `ageGroup === 'infant'`, `ageGroup === 'elderly'`, `isPregnant === true`.

**Tie-break (FR-009)**: Sort order: `total DESC` → `daysSinceLastVisit DESC` → `family.id ASC`.

**Score explanation (FR-004)**: The function returns a `RiskFactor[]` breakdown alongside `total`. Each factor has a `labelKey` (i18n key), `value`, `weight`, and `contribution`. The UI surfaces the top 2–3 factors by contribution.

**Rationale**:
- Pure function: exhaustively unit-testable; trivial to swap weights without touching UI.
- Configurable weights: pilot feedback can retune without a code change (config object in `src/domain/scoring.ts`).
- Deterministic tie-break satisfies FR-009 and ensures stable queue ordering.

**Alternatives considered**:
- Rule-based categorization (red/yellow/green tiers): Loses continuous ordering; makes tie-breaking arbitrary.
- ML model: Out of scope.

---

## Decision 5 — i18n

**Decision**: `next-intl` v3 with a single `pt-BR.json` messages file; no locale routing for the MVP.

**Rationale**:
- `next-intl` is the recommended i18n library for Next.js App Router; integrates with server components and client components via `useTranslations` hook.
- All user-facing strings in one `pt-BR.json` file satisfies FR-017 (thin i18n layer, future locales = add a new JSON file).
- No locale-based URL routing required (`/pt-BR/…`) — single locale, single URL space for the MVP.
- TypeScript type-safety for message keys prevents typos in string references.

**Alternatives considered**:
- `react-i18next`: Mature but designed for SPA patterns; `next-intl` integrates more naturally with App Router RSC.
- Hard-coded inline strings: Explicitly prohibited by FR-017.

---

## Decision 6 — Testing Strategy

**Decision**:
- **Unit tests**: Jest + `ts-jest`; pure domain functions tested in isolation.
- **Integration tests**: Jest + React Testing Library + `fake-indexeddb`; storage adapters and hook logic with real IndexedDB API (simulated).
- **E2E tests**: Playwright (Chromium, headless); runs against `next dev` on `localhost:3000`; real browser IndexedDB, real Leaflet map.

**TDD cadence per slice**:
1. Author the Playwright E2E test first. Run it. It fails (app doesn't exist yet).
2. Author unit/integration tests for domain and storage layers. They fail.
3. Implement domain layer (scoring, queue sort). Unit tests go green.
4. Implement storage layer (visitRepository). Integration tests go green.
5. Implement UI (components, pages). E2E test goes green.
6. Refactor with all tests green.

**Rationale**:
- `fake-indexeddb` makes storage tests run in Node without a headless browser — fast Red-Green loop.
- Playwright with a real Chromium browser validates Leaflet rendering, IndexedDB behavior, and mobile viewport in one pass.
- No shared infrastructure: `pnpm test` (Jest) and `pnpm test:e2e` (Playwright) both run fully locally.

**Alternatives considered**:
- Cypress: Comparable to Playwright; Playwright has better TypeScript support, parallel sharding, and trace viewer.
- MSW (Mock Service Worker): Not needed — no HTTP API calls at runtime.
- jsdom for E2E: jsdom doesn't support Leaflet canvas rendering or IndexedDB; Playwright required for E2E.
