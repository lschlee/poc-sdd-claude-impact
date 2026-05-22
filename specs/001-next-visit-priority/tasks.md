# Tasks: Next-Visit Priority App for Community Health Agents

**Input**: Design documents from `specs/001-next-visit-priority/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Per the project constitution (`.specify/memory/constitution.md`,
Principle I — Test-Driven Development, NON-NEGOTIABLE), test tasks are
MANDATORY for every user story in this project. For each story, at least
one failing-test task MUST precede every implementation task, and at
least one end-to-end / full-stack integration test task MUST be present
to validate the vertical slice (Principle II).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in every description

## Path Conventions

Single Next.js project — `src/` and `tests/` at repository root, `public/` for static assets.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js project, install all dependencies, and configure all tooling so that `pnpm test` and `pnpm test:e2e` can run (even if all tests fail).

- [X] T001 Initialize Next.js 14 App Router project with TypeScript 5.x strict mode and `output: 'export'` in `next.config.js`; configure `tsconfig.json` with path aliases for `src/`
- [X] T002 Install all project dependencies in `package.json`: `next@14`, `react-leaflet@4`, `leaflet@1`, `idb@8`, `next-intl@3` (runtime); `jest`, `ts-jest`, `@testing-library/react`, `@testing-library/jest-dom`, `fake-indexeddb`, `playwright` (dev)
- [X] T003 [P] Configure Jest with ts-jest preset, moduleNameMapper for CSS/Leaflet assets, fake-indexeddb setup in `jest.config.ts` + `jest.setup.ts`
- [X] T004 [P] Configure Playwright in `playwright.config.ts` with Chromium browser, webServer pointing to `pnpm dev` on port 3000, and mobile viewport (375 × 812)
- [X] T005 [P] Configure ESLint in `.eslintrc.json` with `next/core-web-vitals` and `@typescript-eslint/recommended` rules
- [X] T006 [P] Scaffold all source and test directories: `src/app/family/[id]/`, `src/components/VisitQueue/`, `src/components/VisitForm/`, `src/domain/`, `src/lib/storage/`, `src/lib/hooks/`, `src/lib/services/`, `src/lib/i18n/messages/`, `src/data/`, `tests/e2e/`, `tests/integration/`, `tests/unit/`, `scripts/`, `public/tiles/14/`
- [X] T007 [P] Create tile download script at `scripts/download-tiles.sh` with configurable `BBOX` and zoom 14–17 defaults; commit a minimal stub tile PNG at `public/tiles/14/8399/9633.png` for CI/dev rendering without running the download script
- [X] T008 Wire all pnpm scripts in `package.json`: `dev` (`next dev`), `build` (`next build`), `test` (`jest`), `test:e2e` (`playwright test`), `test:all` (Playwright with auto-started dev server), `type-check` (`tsc --noEmit`), `lint` (`eslint src`), `tiles:download` (`bash scripts/download-tiles.sh`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, fixture data, i18n setup, and IndexedDB schema that all user story tests and implementations depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — both stories import from `models.ts` and `db.ts`.

- [X] T009 Define all shared TypeScript domain types in `src/domain/models.ts`: `ISODateString`, `AgeGroup`, `FollowUpFlag`, `RiskFactorKey`, `RiskFactor`, `RiskScore`, `Resident`, `Family`, `Visit`, `ScoringWeights`, `ScoringConstants`, `ScoringConfig`, `ScoredFamily`, `MicroArea`, `CHA` — exact shapes per `contracts/scoring-contract.md` and `data-model.md`
- [X] T010 [P] Populate the demo roster fixture in `src/data/roster.ts` exporting a typed `RosterData` const with 30 `Family` objects (each with 2–4 residents), 90 `Resident` objects with varied `ageGroup`, `isPregnant`, and `chronicConditions`, one `MicroArea` with `bounds` covering a walkable pilot bounding box, and one `CHA` identity (`"CHA-001"`) per FR-010, FR-011, FR-016
- [X] T011 [P] Configure next-intl in `src/lib/i18n/config.ts` for a single `pt-BR` locale; create `src/lib/i18n/messages/pt-BR.json` with all required keys: `riskFactor.timeSinceVisit`, `riskFactor.chronicConditions`, `riskFactor.vulnerableGroups`, `riskFactor.followUp`, and all UI label, button, error, and empty-state strings (FR-017)
- [X] T012 Define and open the IndexedDB schema in `src/lib/storage/db.ts`: `openDB('nvp-db', 1, { upgrade })` creating `visits` store (keyPath `id`; indexes `by-family`, `by-date`, `by-cha`) and `auditLog` store (keyPath `id`; index `by-timestamp`) per `contracts/storage-schema.md`
- [X] T013 Set up the Next.js App Router root layout at `src/app/layout.tsx` with `NextIntlClientProvider`, mobile-first viewport meta (`width=device-width, initial-scale=1`), and Leaflet CSS import (`leaflet/dist/leaflet.css`)

**Checkpoint**: Foundation ready — user story phases can now begin.

---

## Phase 3: User Story 1 — Prioritized visit queue on map + list (Priority: P1) 🎯 MVP

**Goal**: CHA opens the app and immediately sees their assigned families ranked by risk on a synchronized list + map, with the top contributing risk factors explained per family.

**Independent Test**: With the seeded fixture roster (30 families, varying risk factors), launch the app as the baked-in CHA, and confirm: (a) the list shows families in descending risk score order, (b) the map shows matching pins, (c) tapping a list entry highlights the corresponding pin, (d) risk factor labels match the seeded data, and (e) a never-visited family ranks at the top.

### Tests for User Story 1 (MANDATORY — Write FIRST, Run, Observe FAIL) ⚠️

> **NOTE: Write these tests FIRST, run them, observe them FAIL for the right reason,
> and only then start the implementation tasks below.**
> T014 is the required end-to-end test that exercises every layer of the US1 slice (Principle II).

- [X] T014 [P] [US1] Write failing Playwright E2E test in `tests/e2e/story1-queue.spec.ts`: assert the home page renders only families due today (FR-001) in descending risk score order; the map renders matching pins; clicking a list item highlights the corresponding pin; risk factor labels are visible; a family with `coordinates: null` renders a "needs location" marker (FR-002 edge case); and `page.on('request', ...)` intercept confirms zero external network requests during page load and map interaction (FR-012) — test must fail before any implementation exists
- [X] T015 [P] [US1] Write failing Jest unit tests for `computeRiskScore` in `tests/unit/scoring.test.ts`: test all 4 factor formulas with known fixture inputs, verify `f_time = 1.0` for never-visited (empty `activeVisits`), verify `f_chronic = 0` and `f_vulnerable = 0` for empty residents, verify `total` stays in `[0, 1]`, verify determinism
- [X] T016 [P] [US1] Write failing Jest unit tests for `sortQueue` in `tests/unit/queue.test.ts`: test descending `total` ordering, tie-break on `daysSinceLastVisit DESC`, secondary tie-break on `family.id ASC`, verify returned array is a new object (input not mutated), verify same input always produces same output
- [X] T017 [P] [US1] Write failing Jest integration test in `tests/integration/rosterRepository.test.ts`: assert `getFamiliesForCHA("CHA-001")` returns only families whose `microAreaId` matches the CHA's assigned area (FR-008), returned objects are typed `Family[]`, families with `coordinates: null` are included in results
- [X] T016a [P] [US1] Write failing Jest unit tests for `filterDueToday` in `tests/unit/queue.test.ts` (extend existing file): assert a family past its recommended visit interval is included; a recently visited family with no active follow-up flags is excluded; a family with an active follow-up flag is included regardless of recency; a never-visited family (no non-undone visits) is always included — test must fail before any implementation exists (FR-001, spec assumption: "today's queue")

### Implementation for User Story 1

- [X] T018 [US1] Implement `computeRiskScore` pure function in `src/domain/scoring.ts` with all 4 factor formulas and `DEFAULT_SCORING_CONFIG` export per `contracts/scoring-contract.md`; export `ScoringConfig` type — makes T015 green
- [X] T019 [US1] Implement `sortQueue` pure function in `src/domain/queue.ts` sorting `ScoredFamily[]` by `total DESC → daysSinceLastVisit DESC → family.id ASC` per FR-009; returns new array — makes T016 green
- [X] T019a [US1] Implement `filterDueToday(families: Family[], visitsByFamily: Map<string, Visit[]>, config: ScoringConfig): Family[]` in `src/domain/queue.ts`: include families where days since most recent non-undone visit ≥ `config.recommendedIntervalDays`, or any active follow-up flag is set, or no non-undone visits exist; add `recommendedIntervalDays: number` to `ScoringConfig` in `src/domain/models.ts` and `DEFAULT_SCORING_CONFIG` in `src/domain/scoring.ts` — makes T016a green
- [X] T020 [US1] Implement `RosterRepository` in `src/lib/storage/rosterRepository.ts` wrapping `src/data/roster.ts`: export `getFamiliesForCHA(chaId)` filtering by `microAreaId ∈ cha.microAreaIds`, `getMicroArea()`, and `getCHA()` — makes T017 green
- [X] T021 [US1] Implement `useVisitQueue` React hook in `src/lib/hooks/useVisitQueue.ts`: calls `RosterRepository.getFamiliesForCHA`, calls `filterDueToday` to select only families due for a visit today (FR-001), calls `computeRiskScore` per filtered family (passing `today` and empty `activeVisits` for US1 scope), calls `sortQueue`, exposes `{ families: ScoredFamily[], selectedId: string | null, select(id) }`
- [X] T022 [US1] Implement `FamilyCard` component in `src/components/VisitQueue/FamilyCard.tsx`: display family name, numeric risk score badge, top 2–3 `RiskFactor` label keys via `useTranslations`, "needs location" indicator when `coordinates === null`, highlight style when `isSelected` prop is true (FR-004)
- [X] T023 [P] [US1] Implement `QueueList` component in `src/components/VisitQueue/QueueList.tsx`: renders ranked `FamilyCard` list from `ScoredFamily[]` prop, calls `onSelect(id)` on tap, applies selection highlight (FR-001)
- [X] T024 [P] [US1] Implement `QueueMap` component in `src/components/VisitQueue/QueueMap.tsx` (imported by its parent via `dynamic(() => import('./QueueMap'), { ssr: false })` to skip SSR — do not use `dynamic()` inside this file itself): `<MapContainer>` + `<TileLayer url="/tiles/{z}/{x}/{y}.png" minZoom={14} maxZoom={17}>` + one `<Marker>` per family with `<Popup>`, opens popup for selected family, emits `onSelect(id)` on marker click; renders "needs location" differently for `coordinates === null` (FR-002, FR-018)
- [X] T025 [US1] Wire `src/app/page.tsx` to render `<QueueList>` and `<QueueMap>` side by side using `useVisitQueue` hook for shared selection state; mobile-first layout (stack vertically on narrow viewport) with all strings via `useTranslations` (FR-001, FR-002, FR-017)
- [ ] T026 [US1] Run `pnpm test:e2e -- story1-queue` against dev server and iterate until all assertions in `tests/e2e/story1-queue.spec.ts` pass; add a Playwright timing assertion that queue visibility occurs within 5 000 ms using `performance.now()` or Playwright `clock` (automated SC-001 check)

**Checkpoint**: User Story 1 is fully functional and independently demonstrable — read-only priority queue.

---

## Phase 4: User Story 2 — Register visit and watch queue re-prioritize (Priority: P2)

**Goal**: CHA registers a completed visit on the family detail page; the app persists the visit, resets the family's recency signal, recomputes its score, and re-renders the queue so the next-highest-risk family rises to the top.

**Independent Test**: Starting from the US1 state, open the top-ranked family's detail page, register a visit with today's date and brief notes, then confirm: (a) the visit appears in the family's history with CHA id and timestamp, (b) the family's score drops and it moves down in the queue, (c) the previously second-ranked family is now at position 1, (d) queue re-renders within 3 s, and (e) tapping undo restores the original order.

### Tests for User Story 2 (MANDATORY — Write FIRST, Run, Observe FAIL) ⚠️

> Write these tests FIRST, observe failure, then implement.
> T027 is the required end-to-end test that exercises every layer of the US2 slice (Principle II).

- [ ] T027 [P] [US2] Write failing Playwright E2E test in `tests/e2e/story2-visit.spec.ts`: from the home queue, tap the top family, fill and submit the visit form, assert the queue reorders with the next family at top, assert the registered family's detail page shows the new visit in history, tap undo and assert queue restores; also assert that entering a future date in the visit form shows a pt-BR validation error and blocks submission (FR-005, data-model.md validation rule) — test must fail before any implementation exists
- [ ] T028 [P] [US2] Write failing Jest integration test in `tests/integration/visitRepository.test.ts` using `fake-indexeddb`: `saveVisit` writes a `VisitRecord` and a matching `AuditEntry` in the same transaction; `getActiveVisitsForFamily` excludes records with `undone === true`; `undoVisit` sets `undone = true` and appends an `'undo'` audit entry atomically — test must fail before implementation

### Implementation for User Story 2

- [ ] T029 [US2] Implement `VisitRepository` in `src/lib/storage/visitRepository.ts`: `saveVisit(visit)` writes `VisitRecord` + `AuditEntry` in one IndexedDB transaction; `getActiveVisitsForFamily(familyId)` queries `by-family` index and filters `undone === false`; `undoVisit(visitId)` sets `undone = true` + appends audit entry atomically; `getVisitHistoryForFamily(familyId)` returns all records including undone — makes T028 green
- [ ] T030 [US2] Implement `VisitService` in `src/lib/services/visitService.ts`: `registerVisit({ familyId, visitDate, notes, followUpFlags })` — generates UUID, sets `chaId` from baked-in CHA, calls `VisitRepository.saveVisit`, then calls back to trigger queue refresh; `undoVisit(visitId)` — calls `VisitRepository.undoVisit` then triggers queue refresh; follow-up flag presence elevates score on re-render per Story 2 AC-3
- [ ] T031 [US2] Implement `VisitForm` component in `src/components/VisitForm/VisitForm.tsx`: date input defaulting to today with `≤ today` validation (data-model.md validation rule), free-text notes textarea, follow-up flag checkboxes with pt-BR labels, submit and cancel buttons; all strings via `useTranslations` (FR-005, FR-017)
- [ ] T032 [US2] Implement `FamilyDetailPage` at `src/app/family/[id]/page.tsx`: display family name, residents summary, ordered visit history from `VisitRepository.getVisitHistoryForFamily`, embedded `<VisitForm>` for registering a new visit, undo button that calls `VisitService.undoVisit` for the latest active visit (FR-005, FR-007, FR-013, FR-014)
- [ ] T033 [US2] Update `useVisitQueue` hook in `src/lib/hooks/useVisitQueue.ts` to load `activeVisits` from `VisitRepository` per family and pass them to `computeRiskScore`; expose a `refresh()` callback; ensure re-render after `VisitService.registerVisit` and `VisitService.undoVisit` completes within 3 s (SC-003)
- [ ] T034 [US2] Run `pnpm test:e2e -- story2-visit` against dev server and iterate until all assertions in `tests/e2e/story2-visit.spec.ts` pass; add Playwright timing assertions: queue re-renders within 3 000 ms after visit submit (SC-003) and full registration flow completes within 30 000 ms (SC-002), both using `performance.now()` or Playwright timing

**Checkpoint**: User Stories 1 and 2 both work independently — live priority queue with visit registration and undo.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, type safety, build validation, and developer workflow verification.

- [ ] T035a [P] Write failing Jest/RTL unit test in `tests/unit/familyCard.test.ts`: render `<FamilyCard>` with `lastVisitDate: null` and assert the pt-BR "nunca visitada" label is present; render with a non-null date and assert the label is absent — test must fail before T035 exists (constitution Principle I)
- [ ] T035 Handle the never-visited family edge case in `src/components/VisitQueue/FamilyCard.tsx`: display a pt-BR "nunca visitada" label when `lastVisitDate === null` instead of a negative days value (spec edge cases) — makes T035a green
- [ ] T038 [P] Run `pnpm type-check` (`tsc --noEmit`) and fix all TypeScript type errors across `src/` and `tests/`
- [ ] T039 [P] Run `pnpm lint` and fix all ESLint warnings and errors across `src/`
- [ ] T040 Run `pnpm build` to verify Next.js static export produces a valid `out/` directory; confirm no server-side import leaks (Leaflet window access, dynamic imports) break the build
- [ ] T041 Validate the full quickstart.md developer workflow end-to-end: `pnpm install` → `pnpm dev` → `pnpm test` (all green) → `pnpm test:e2e` (all green) → `pnpm build`; fix any deviation from the documented flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS both user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion — no dependency on US2
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion — integrates with US1 queue hook but remains independently testable
- **Polish (Phase 5)**: Depends on US1 and US2 both complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately after Phase 2 — no dependency on US2
- **User Story 2 (P2)**: Can start immediately after Phase 2 — reads from `useVisitQueue` hook but adds its own storage and UI layers independently

### Within Each User Story

- Tests MUST be written and observed to FAIL before any implementation task starts (constitution Principle I — non-negotiable)
- At least one of those tests MUST exercise the full vertical slice end-to-end (constitution Principle II)
- Types → Domain functions → Storage adapters → UI components → Page wiring → E2E pass
- Story is complete only when the Playwright E2E test goes green

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel within Phase 1
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T010, T011 are independent of T012; T013 depends on T011)
- Within US1: T014–T017 + T016a (all tests) can be written in parallel; T018, T019, T019a (scoring.ts, queue.ts sort + filterDueToday — no shared state) can run in parallel; T023–T024 (QueueList and QueueMap) can run in parallel
- Within US2: T027–T028 (tests) can be written in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Examples

### User Story 1 — Write all tests concurrently

```bash
# All five US1 test files can be authored in parallel:
Task T014:  tests/e2e/story1-queue.spec.ts              (Playwright E2E)
Task T015:  tests/unit/scoring.test.ts                  (Jest unit)
Task T016:  tests/unit/queue.test.ts                    (Jest unit — sortQueue)
Task T016a: tests/unit/queue.test.ts (extended)         (Jest unit — filterDueToday)
Task T017:  tests/integration/rosterRepository.test.ts  (Jest integration)
```

### User Story 1 — Implement domain layer concurrently (after tests written)

```bash
# scoring.ts and queue.ts functions have no shared state — implement together:
Task T018:  src/domain/scoring.ts  (make T015 green)
Task T019:  src/domain/queue.ts    (make T016 green — sortQueue)
Task T019a: src/domain/queue.ts    (make T016a green — filterDueToday)
```

### User Story 1 — Implement UI components concurrently (after domain + storage green)

```bash
# QueueList and QueueMap touch different files:
Task T023: src/components/VisitQueue/QueueList.tsx
Task T024: src/components/VisitQueue/QueueMap.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (tests first, then implementation)
4. **STOP and VALIDATE**: Run `pnpm test` + `pnpm test:e2e -- story1-queue`
5. Demo the read-only priority queue — already delivers core decision-support value

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → test independently → **MVP demo** (ranked queue on map + list)
3. User Story 2 → test independently → **full loop** (visit registration + live re-prioritization)
4. Polish → type-check, lint, build validation, quickstart verification

### Parallel Team Strategy

With two developers:

1. Both complete Setup + Foundational together
2. Once Phase 2 is done:
   - Developer A: User Story 1 (scoring, queue, roster, queue UI)
   - Developer B: User Story 2 (visitRepository, visitService, form, detail page)
3. US1 and US2 integrate via `useVisitQueue` hook — agree on the hook interface before splitting

---

## Notes

- `[P]` = parallelizable — targets different files with no incomplete-task dependencies
- `[US1]` / `[US2]` maps each task to the user story it delivers
- Each user story phase is independently completable and testable
- Verify tests fail before implementing — a test that passes before implementation is a broken test
- The scoring formula and default weights live in `src/domain/scoring.ts` → `DEFAULT_SCORING_CONFIG`; pilot operators tune by editing that object
- No server-side code: all runtime logic runs in the browser; `dynamic(() => import('./QueueMap'), { ssr: false })` is mandatory for Leaflet
- Tile stubs in `public/tiles/` allow dev/CI to run without executing the download script
