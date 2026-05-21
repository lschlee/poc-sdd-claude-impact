# Quickstart: Next-Visit Priority App

Developer setup guide for the Next-Visit Priority POC. All commands run locally; no external services required.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| pnpm | 9.x | `npm install -g pnpm` |
| Playwright browsers | Chromium | installed via `pnpm exec playwright install chromium` |

---

## 1 — Clone & Install

```bash
git clone <repo-url>
cd poc-sdd-claude-impact
pnpm install
```

---

## 2 — Tile Pack Setup (one-time, build-time)

The offline map requires OSM raster tiles bundled under `public/tiles/`. This step runs once per pilot area configuration.

```bash
# Download tiles for the pilot micro-area bounding box
# Edit scripts/download-tiles.sh to set the bounding box and zoom levels
pnpm run tiles:download
```

`scripts/download-tiles.sh` uses `tile-dl` (or `wget`) to fetch tiles at zoom levels 14–17 for the configured bounding box and saves them to `public/tiles/{z}/{x}/{y}.png`.

For development/CI without a real micro-area, a minimal stub tile set is committed to `public/tiles/` covering a small default bounding box so the app renders without running the download script.

---

## 3 — Development Server

```bash
pnpm dev
# → http://localhost:3000
```

The home page shows the mock roster's families ranked by risk score on the map + list.

---

## 4 — Run Tests

```bash
# Unit + integration tests (Jest)
pnpm test

# Watch mode
pnpm test --watch

# E2E tests (Playwright, requires dev server running)
pnpm dev &
pnpm test:e2e

# All at once (starts dev server automatically via Playwright webServer config)
pnpm test:all
```

**Expected output** (before any implementation):
- Jest: all tests fail (TDD Red phase — this is correct)
- Playwright: E2E tests fail

**Expected output** (after full implementation):
- Jest: all tests pass
- Playwright: all E2E tests pass

---

## 5 — Static Export (Pilot Build)

```bash
pnpm build
# Output: out/
```

The `out/` directory is a fully static site — serve it from any static file server on the pilot device. No Node.js server needed at runtime.

To serve locally for final verification:

```bash
pnpm exec serve out -p 3000
# → http://localhost:3000
```

---

## 6 — Key Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Next.js static export → `out/` |
| `pnpm test` | Jest unit + integration tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm test:all` | Jest + Playwright (Playwright starts dev server automatically) |
| `pnpm tiles:download` | Download OSM tiles for configured bounding box |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm lint` | ESLint |

---

## 7 — Configuration

### Pilot CHA Identity

Edit `src/data/roster.ts` to set the baked-in CHA identifier and micro-area for the pilot build. No environment variables needed.

### Risk Score Weights

Edit `src/domain/scoring.ts` → `DEFAULT_SCORING_CONFIG` to tune weights during the pilot. No rebuild required if weights are extracted to a separate config file — tbd during implementation.

### Tile Bounding Box

Edit `scripts/download-tiles.sh` → `BBOX` variable (`south,west,north,east`). Re-run `pnpm tiles:download` after changing. Commit the new tiles before building the pilot package.

---

## 8 — Data Inspection (Supervisor Retrieval)

Per FR-012, there is no in-app export. At pilot end, the supervisor retrieves visit records from IndexedDB using browser DevTools:

1. Open Chrome DevTools → Application → IndexedDB → `nvp-db` → `visits`
2. All visit records are visible (including `undone: true` soft-deleted ones)
3. Export via DevTools or copy-paste from the object view

The `auditLog` store is also readable from the same panel (FR-014).
