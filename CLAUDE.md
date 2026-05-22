# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Next.js dev server on port 3000
pnpm build        # Production build
pnpm lint         # ESLint over src/
pnpm type-check   # tsc --noEmit
pnpm test         # Jest (unit + integration)
pnpm test:e2e     # Playwright E2E (starts its own dev server — do not run pnpm dev first)
pnpm test:all     # Jest + Playwright
```

Run a single Jest test file:
```bash
pnpm test -- tests/unit/scoring.test.ts
```

## Run locally (WSL2 → Windows browser)

```bash
pnpm dev
explorer.exe http://localhost:3000   # opens Windows default browser
```

If `localhost:3000` is unreachable from Windows (VPN / `localhostForwarding=false`):
```bash
pnpm exec next dev -H 0.0.0.0 -p 3000
hostname -I   # use first IP, e.g. http://172.19.159.119:3000
```

## Architecture

This is a **Next.js 14 / TypeScript** app for community health agents (CHAs) to prioritize home visits. It runs fully offline — no backend, no API calls — using IndexedDB for persistence and static data baked into the bundle.

### Data flow

```
src/data/roster.ts          ← static family/resident/CHA data (no network)
        ↓
src/lib/storage/rosterRepository.ts   ← reads roster by CHA ID
src/lib/storage/visitRepository.ts    ← reads/writes Visit records via IndexedDB
src/lib/storage/db.ts                 ← idb wrapper; exports getDB() / resetDB()
        ↓
src/domain/scoring.ts       ← computeRiskScore(): weighted formula → RiskScore
src/domain/queue.ts         ← filterDueToday(), sortQueue()
        ↓
src/lib/hooks/useVisitQueue.ts  ← React hook wiring repos + scoring for the home page
        ↓
src/app/page.tsx            ← home: QueueList + QueueMap side by side
src/app/family/[id]/        ← family detail page with VisitForm
```

### Domain models (`src/domain/models.ts`)

Key types: `Family` → `Resident[]`, `Visit`, `ScoredFamily`, `RiskScore` → `RiskFactor[]`.

The scoring formula (in `scoring.ts`) combines four normalized factors (0–1) with configurable weights: `timeSinceVisit` (0.40), `chronicConditions` (0.25), `vulnerableGroups` (0.25), `followUp` (0.10). `DEFAULT_SCORING_CONFIG` holds these weights and is used throughout.

### Hardcoded CHA identity

`CHA_ID = 'CHA-001'` is baked into `useVisitQueue.ts`. The app intentionally supports a single CHA identity for this POC.

### i18n

All UI strings live in `src/lib/i18n/messages/pt-BR.json`. `next-intl` handles routing and message lookup; the request config is in `src/i18n/request.ts`.

### Testing layers

| Layer | Tool | Location | Environment |
|---|---|---|---|
| Unit | Jest | `tests/unit/` | jsdom |
| Integration | Jest | `tests/integration/` | node (uses `fake-indexeddb`) |
| E2E | Playwright | `tests/e2e/` | Firefox, mobile viewport 375×812 |

Leaflet and react-leaflet are mocked in Jest (`src/__mocks__/`); CSS imports are stubbed. Integration tests use `fake-indexeddb` and must call `resetDB()` between tests to avoid state leakage.

## Specs

Feature specs live under `specs/001-next-visit-priority/`. The scoring contract (`contracts/scoring-contract.md`) and storage schema (`contracts/storage-schema.md`) are the canonical references for domain behaviour.
