# Implementation Plan: Next-Visit Priority App for Community Health Agents

**Branch**: `001-next-visit-priority` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-next-visit-priority/spec.md`

## Summary

A mobile-first Next.js web application (TypeScript, static export, no server runtime) that lets a community health agent see their assigned families ranked by risk on a map + list, then register completed visits that immediately recompute the queue. All data lives in the bundled roster module or browser IndexedDB; the runtime issues zero network requests.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20 LTS

**Primary Dependencies**:
- Next.js 14 (App Router, `output: 'export'` static mode)
- react-leaflet + Leaflet (offline raster tile map, `dynamic` import to skip SSR)
- idb v8 (Promise-based IndexedDB wrapper)
- next-intl (pt-BR i18n, App Router–native)
- Jest + React Testing Library + fake-indexeddb (unit / integration tests)
- Playwright / Chromium (E2E tests — real browser, real IndexedDB)

**Storage**: Browser IndexedDB via `idb` for visit records and audit log; mocked roster (families, residents, micro-area, CHA config) shipped as a static TypeScript ESM module — no serialization, no DB.

**Testing**: Jest + RTL + `fake-indexeddb` for all unit and integration tests (fast, no shared infra); Playwright for E2E (runs `next dev` or `next start` locally, real browser).

**Target Platform**: Mobile browser — iOS Safari 16+, Android Chrome 110+; accessed via the Next.js static export on the pilot device.

**Project Type**: Next.js web application (static export — no Node server required at runtime).

**Performance Goals**:
- Queue visible in < 5 s on typical field device (SC-001)
- Visit registration round-trip < 30 s end-to-end (SC-002)
- Queue re-render after visit < 3 s (SC-003)

**Constraints**:
- Zero network calls at runtime — roster bundled, tiles bundled, writes to IndexedDB only (FR-012)
- Static raster tiles under `public/tiles/{z}/{x}/{y}.png` at zoom 14–17 (FR-018)
- Plaintext storage — accepted POC limitation (FR-015)
- ~30 families / ~90 residents / ~50 visits; no clustering (FR-016)

**Scale/Scope**: Single pilot micro-area; single baked-in CHA identity; demo fixture only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` v1.0.0.

- **Principle I — Test-Driven Development (NON-NEGOTIABLE)**
  - [x] Failing tests are identified for each user story before any production code:
    - **Story 1**: Playwright test asserting N families appear in descending risk order in the list and as matching pins on the map, before any scoring or map component exists.
    - **Story 2**: Playwright test asserting that registering a visit for the top-ranked family promotes the previously second-ranked family to position 1, before visit persistence is wired.
    - **Scoring unit test**: `scoring.test.ts` — asserts correct total and factor breakdown for known input fixtures; fails until `scoring.ts` is implemented.
    - **Storage integration test**: `visitRepository.test.ts` — asserts that a saved visit is retrievable and that `undone: true` excludes it from active visits; fails until `visitRepository.ts` is implemented.
  - [x] Test framework supports a fast local Red → Green → Refactor cycle: Jest runs in < 5 s; Playwright runs headless against `localhost` with no remote dependencies.
  - [x] No production code path is introduced without a corresponding test path — domain logic, storage adapters, and components each have test files authored before implementation.

- **Principle II — Vertical Slice Delivery (NON-NEGOTIABLE)**
  - [x] Story 1 traverses every layer end-to-end:
    - Entry: `app/page.tsx` renders `<VisitQueuePage />`
    - Application: `useVisitQueue` hook calls `RosterRepository` + `RiskScoringService`
    - Domain: `scoring.ts` pure function; `queue.ts` sort + tie-break
    - Persistence: `RosterRepository` reads static `data/roster.ts` module
    - Observable: ranked list + map with pins
  - [x] Story 2 traverses every layer end-to-end:
    - Entry: `app/family/[id]/page.tsx` renders `<FamilyDetailPage />`
    - Application: `VisitService.register()` writes visit, calls scoring
    - Domain: `scoring.ts` recomputed after new visit
    - Persistence: `VisitRepository` writes to IndexedDB via `idb`
    - Observable: queue re-renders with new order; family card shows updated history
  - [x] Each story has at least one Playwright E2E test traversing the same layers.
  - [x] No horizontal-only increment is treated as a deliverable; TypeScript type definitions and the IndexedDB schema setup are internal scaffolding steps within Story 1's slice.
  - [x] Story 1 (read-only queue) can be merged and demonstrated independently; Story 2 (visit registration) builds on top and is independently mergeable.

- **Development Constraints**
  - [x] No `NEEDS CLARIFICATION` markers remain — all spec clarifications are resolved in `spec.md`.
  - [x] No tests are planned to be skipped or commented out without a linked issue.

## Project Structure

### Documentation (this feature)

```text
specs/001-next-visit-priority/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── storage-schema.md    # IndexedDB schema contract
│   └── scoring-contract.md  # Scoring function TypeScript contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Home — prioritized visit queue (Story 1)
│   └── family/
│       └── [id]/
│           └── page.tsx            # Family detail + visit registration (Story 2)
├── components/
│   ├── VisitQueue/
│   │   ├── QueueList.tsx           # Ranked list panel
│   │   ├── QueueMap.tsx            # react-leaflet map (dynamic import, no SSR)
│   │   └── FamilyCard.tsx          # List item with risk summary
│   └── VisitForm/
│       └── VisitForm.tsx           # Visit registration form (Story 2)
├── domain/
│   ├── models.ts                   # TypeScript types (Family, Resident, Visit, RiskScore…)
│   ├── scoring.ts                  # Pure risk scoring engine
│   └── queue.ts                    # Queue sort + deterministic tie-break (FR-009)
├── lib/
│   ├── hooks/
│   │   └── useVisitQueue.ts        # Queue state hook (US1 + US2)
│   ├── services/
│   │   └── visitService.ts         # Visit registration + undo orchestration (US2)
│   ├── storage/
│   │   ├── db.ts                   # idb schema definition + openDB()
│   │   ├── visitRepository.ts      # CRUD for visit records + undo support
│   │   └── rosterRepository.ts     # Read-only wrapper over data/roster.ts
│   └── i18n/
│       ├── config.ts               # next-intl configuration
│       └── messages/
│           └── pt-BR.json          # All user-facing strings (FR-017)
└── data/
    └── roster.ts                   # Demo fixture: ~30 families, ~90 residents, micro-area, CHA

tests/
├── e2e/
│   ├── story1-queue.spec.ts        # Playwright: queue render + list↔map sync
│   └── story2-visit.spec.ts        # Playwright: visit registration + queue re-order
├── integration/
│   ├── visitRepository.test.ts     # Jest + fake-indexeddb
│   └── rosterRepository.test.ts    # Jest
└── unit/
    ├── scoring.test.ts             # Jest: pure function exhaustive cases
    └── queue.test.ts               # Jest: sort + tie-break
```

**Structure Decision**: Next.js App Router with static export. Domain logic in `src/domain/` is pure TypeScript (no React), making it trivially unit-testable with Jest. Storage adapters in `src/lib/storage/` are tested with `fake-indexeddb` so no browser is needed for integration tests. The map component uses `dynamic(() => import('./QueueMap'), { ssr: false })` to avoid window/document access during the static build.

## Complexity Tracking

> No Constitution Check violations.
