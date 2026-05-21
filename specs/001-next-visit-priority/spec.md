# Feature Specification: Next-Visit Priority App for Community Health Agents

**Feature Branch**: `001-next-visit-priority`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "app de 'próxima visita': tela mostrando mapa de bairro + lista de família do dia ordenadas por risco; score combinando tempo desde última visita, condições crônicos, idosos/gestantes/bebês, etc; agente de saúde registra visita, score recalcula, lista muda"

## Clarifications

### Session 2026-05-21

- Q: How are community health agents identified by the app? → A: No interactive auth in the POC; a single CHA identity is baked into the pilot build and used for all audit-logged visit registrations.
- Q: How offline-capable must the MVP be? → A: No network at all in the POC — mocked roster ships in the build, visits written to on-device storage, no sync or remote backend calls in scope; off-device export is manual and out of scope for the in-app UX.
- Q: What is the target client platform for the POC? → A: Next.js web app with TypeScript across the full stack; accessed via mobile browser on the field device.
- Q: How is PHI (chronic conditions, pregnancy status, addresses) protected at rest in browser storage? → A: Plaintext in browser storage — POC accepts the risk; only the pilot device handles this data and it is wiped after pilot. Documented as a known POC limitation.
- Q: What is the target data volume for the pilot? → A: ~30 families, ~3 residents each, ~50 total visits over pilot — minimal demo fixture; map shows all pins unclustered.
- Q: What UI language(s) does the MVP support? → A: pt-BR only for the MVP, with all user-facing strings routed through a thin i18n layer so future languages are easy to add.
- Q: How are map tiles delivered under the no-network constraint? → A: Bundle a pre-generated static raster tile pack (OpenStreetMap tiles for the pilot bounding box at 2–3 zoom levels) inside the Next.js build, served from `/public/`. True zero-network.
- Q: How does visit data leave the pilot device for supervisor review (SC-005)? → A: No in-app export. Supervisor uses browser DevTools / IndexedDB inspector to dump data manually at pilot end. Truly out of scope of the in-app UX.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — See today's prioritized visit queue on map + list (Priority: P1)

A community health agent (CHA) opens the app at the start of their shift and immediately sees the families they should visit today, ranked from highest to lowest risk. The same families are pinned on a neighborhood map so the agent can plan a walking route. Each list entry shows the family identifier, a clear risk indicator, and the main drivers of that risk (e.g., "no visit in 38 days", "1 pregnant resident", "1 elderly with hypertension").

**Why this priority**: This is the smallest end-to-end slice that delivers the app's core value — replacing a paper checklist or memory-based prioritization with an explicit, risk-aware queue. Without this slice the product has no reason to exist; with this slice alone (even read-only) the agent already gets daily decision support.

**Independent Test**: With a seeded set of families in one micro-area (last-visit dates, household composition, chronic conditions), launch the app, sign in as the CHA assigned to that micro-area, and confirm: (a) the list shows N families in descending risk order, (b) the map shows the same N families as pins matching the list ranking, (c) tapping a list entry highlights the matching map pin and vice versa, and (d) the displayed risk drivers match the seeded data.

**Acceptance Scenarios**:

1. **Given** a CHA assigned to a micro-area with 12 enrolled families, and 8 of those families flagged for visit today, **When** the CHA opens the app, **Then** the home screen shows a map of the micro-area with 8 pins and a list of those 8 families sorted by descending risk score.
2. **Given** the queue is displayed, **When** the CHA taps a family in the list, **Then** the corresponding map pin is highlighted and a brief summary card shows the top 2–3 reasons the family is ranked where it is.
3. **Given** two families with similar risk drivers but different times since last visit, **When** the queue is rendered, **Then** the family with the longer gap since the last visit ranks higher.
4. **Given** a family with no recorded household composition or chronic conditions, **When** the queue is rendered, **Then** the family is still ranked using only the time-since-last-visit signal and the missing-data state is visible to the CHA.

---

### User Story 2 — Register a completed visit and watch the queue re-prioritize (Priority: P2)

After visiting a family, the CHA opens that family's card and registers the visit (date, brief notes, optional outcome flags such as "follow-up needed"). The app immediately updates the family's "last visit" timestamp, recomputes its risk score, and re-orders the day's queue so the next-highest-risk family rises to the top of the list and map focus.

**Why this priority**: This closes the loop between *seeing* the queue and *acting on it*. Without it, the queue is static and the agent has no way to keep the day's plan in sync with reality. It is P2 (not P1) because the app already delivers value as a read-only daily prioritization tool in Story 1; Story 2 turns it into a live workflow.

**Independent Test**: Starting from the Story 1 state, register a visit for the top-ranked family. Verify: (a) the visit is persisted and visible in the family's history, (b) the family's risk score drops based on the recency reset, (c) the family is reordered in both list and map within a few seconds, and (d) the previously-second-ranked family is now at the top.

**Acceptance Scenarios**:

1. **Given** the queue is displayed with Family A ranked first, **When** the CHA registers a visit to Family A with today's date, **Then** Family A's "days since last visit" resets to 0, its risk score recomputes, and the queue re-renders with the next family at the top.
2. **Given** the CHA registered a visit, **When** they open Family A's card again, **Then** the new visit appears in the family's visit history with the date, the CHA's identifier, and any notes entered.
3. **Given** the CHA flags a follow-up condition during visit registration (e.g., "blood pressure not measured — return"), **When** the queue re-renders, **Then** the family does not drop to the bottom even though the visit was just registered, because the follow-up flag keeps the score elevated.
4. **Given** the CHA registered a visit by mistake, **When** they open the visit and tap "undo" within the same session, **Then** the visit is removed and the family's score and queue position are restored to their pre-registration state.

---

### Edge Cases

- A family has no recorded address or has coordinates outside the micro-area boundary → the family still appears in the list, but the map pin is shown in a "needs location" state rather than placed arbitrarily.
- A family was never visited (no "last visit" timestamp on file) → treated as the maximum possible time-since-visit signal so the family ranks high and is surfaced for an initial visit.
- The app has no network dependency (FR-012); queue, family cards, and visit registration always operate from on-device storage. The offline/connectivity failure scenario does not apply to the POC.
- Two devices register a visit for the same family on the same day → not expected in the POC (single baked-in device + identity), but if it occurs, both visits are preserved in on-device history; the most recent one drives the "last visit" timestamp.
- The risk score is tied — two families have identical scores → ordering falls back to longest time-since-last-visit, then to family identifier, so ordering is deterministic and reproducible.
- A CHA opens the app outside their assigned micro-area → they still see their own families' queue; no families from other micro-areas leak in.
- The mocked roster includes a household whose composition is incomplete (e.g., residents listed but no ages) → the family still appears in the queue using only the signals that are present; missing inputs are visible to the CHA but do not block ranking.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display, for the signed-in CHA, the list of families flagged for visit today, sorted in descending order of risk score.
- **FR-002**: The system MUST display the same set of families as pins on a map of the micro-area, with selection synchronized between list and map.
- **FR-003**: The system MUST compute a risk score for each family that combines, at minimum: (a) time since last visit, (b) presence of chronic conditions among residents, and (c) presence of vulnerable groups (infants, pregnant residents, elderly residents).
- **FR-004**: The system MUST surface the top contributing factors of a family's score to the CHA when the family is selected, so the ranking is explainable.
- **FR-005**: The system MUST allow the CHA to register a completed visit, capturing at least: visit date, the CHA who performed it, and free-text notes. Optional follow-up flags MUST be supported.
- **FR-006**: After a visit is registered, the system MUST recompute the family's score and re-render the queue (list + map) so the ordering reflects the new score within a few seconds.
- **FR-007**: The system MUST persist visit history per family so the CHA can review prior visits.
- **FR-008**: The system MUST scope all data shown to one CHA to the families assigned to that CHA's micro-area; no cross-area leakage.
- **FR-009**: The system MUST behave deterministically on score ties (defined tie-break order) so the queue is stable and reproducible.
- **FR-010**: The system MUST identify the acting CHA for every visit registration so the audit log (FR-014) carries an operator identifier. For the POC build, no interactive authentication is required: a single CHA identity is configured into the build and baked onto the pilot device; in-app account creation, login, and CHA switching are out of scope for the MVP.
- **FR-011**: The system MUST be backed by mocked roster data (households, residents, addresses, baseline chronic-condition data) baked into the POC build. No integration with external registration systems (e.g., e-SUS APS) and no in-app roster editing are in scope for this MVP.
- **FR-012**: The system MUST run entirely without network connectivity for the duration of a field shift. The mocked roster is bundled with the Next.js build, all reads are served from the bundle or browser storage (localStorage / IndexedDB), and visit registrations are written to browser storage only. No background sync, no remote API calls, and no server-side data store are in scope for the MVP. Exporting registered visits off the device for supervisor review is performed by the supervisor at pilot end using browser DevTools / the IndexedDB inspector to read the stored records; no in-app export UI (no download button, no share action, no file write) is in scope for the MVP.
- **FR-013**: The system MUST allow the CHA to undo a just-registered visit within the same session to recover from accidental taps.
- **FR-014**: The system MUST log every visit registration with timestamp and operator identifier so the visit record is auditable.
- **FR-015**: For the POC, family roster data and visit records (including health-sensitive attributes such as chronic conditions, pregnancy status, ages, and addresses) are stored in plaintext in browser storage (localStorage / IndexedDB). No encryption at rest, no PIN/passphrase gate, and no obfuscation of identifying fields are in scope for the MVP. This is an accepted POC limitation: only the pilot device handles this data, the device is dedicated to the pilot CHA, and on-device data MUST be wiped (clear site data / uninstall) at the end of the pilot. Any production rollout MUST revisit data-at-rest protection before reuse outside the pilot scope.
- **FR-016**: The POC MUST be sized to a demo fixture of approximately 30 families, with approximately 3 residents per family, and is expected to accumulate up to approximately 50 visit records over the pilot. The map MUST render all pins unclustered at this scale; clustering, virtualization, and large-roster optimizations are out of scope for the MVP. Fixture sizing is a guideline for the mocked roster and pilot acceptance tests, not a hard runtime cap.
- **FR-017**: The MVP user interface MUST be in Brazilian Portuguese (pt-BR). All user-facing strings (labels, buttons, messages, risk-driver descriptions, error/empty states) MUST be routed through a thin internationalization (i18n) layer rather than hard-coded inline, so that additional locales can be added later without refactoring components. Only pt-BR translation content is in scope for the MVP; no locale toggle is required in the UI.
- **FR-018**: The neighborhood map MUST render using a pre-generated static raster tile pack bundled inside the Next.js build and served from the application's static asset path (e.g., `/public/`). The bundled tile pack MUST cover the pilot micro-area's bounding box at 2–3 zoom levels appropriate for walking-route planning. No live tile-provider requests, no Service Worker tile cache warming, and no online tile fallback are in scope for the MVP. Tile generation is a build-time concern; the runtime MUST NOT issue network requests for map tiles.

### Out of Scope (MVP)

To keep the POC focused, the following are explicitly deferred:

- Editing a family's risk profile (household composition, chronic conditions, vulnerable-group flags) from inside the app — the roster is mocked and immutable in the MVP build.
- Marking a family as "no longer in this micro-area" from inside the app.
- Any admin / supervisor UI for managing families, micro-areas, or CHAs.
- Any integration with external registration systems (e.g., e-SUS APS) — all data is mocked.
- Any in-app export of visit data (no download buttons, share actions, or file writes) — supervisors retrieve pilot data via browser DevTools / the IndexedDB inspector at pilot end.

### Key Entities

- **Family / Household**: The unit of visit prioritization. Holds an identifier, an address (with coordinates when available), an assignment to one micro-area, and a roster of residents (sourced externally). Has a current risk score (derived) and a history of visits.
- **Resident**: A person living in a family. Holds demographic attributes (age band such as infant/child/adult/elderly, pregnancy status when applicable) and a set of chronic-condition flags. Drives part of the family's risk score. Read-only inside the MVP app.
- **Visit**: A recorded event of a CHA visiting a family. Holds date, the CHA who performed it, free-text notes, and optional follow-up flags. Resets the family's "time since last visit" signal.
- **Risk Score**: A derived value computed from the family's resident composition, chronic-condition flags, and time-since-last-visit. Includes a breakdown of contributing factors used to explain the ranking to the CHA.
- **Community Health Agent (CHA)**: The end user of the app. Assigned to one or more micro-areas. Identified for authentication and for audit logging on visits.
- **Micro-area**: The geographic unit one CHA covers (corresponds to the "bairro" in the user's description). Defines the map extent and scopes which families a CHA sees.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A CHA can open the app and see today's prioritized queue (list + map) in under 5 seconds on a typical field device (no sign-in step; CHA identity is baked into the build).
- **SC-002**: Registering a completed visit takes the CHA no more than 30 seconds end-to-end (open card → confirm visit → see queue re-render), measured on at least 80% of registrations during pilot use.
- **SC-003**: The queue re-renders with the updated ordering within 3 seconds after a visit is registered, on a typical field device.
- **SC-004**: In pilot use, at least 90% of CHAs surveyed agree that the displayed risk drivers ("why is this family ranked here?") are understandable and match their own field judgment.
- **SC-005**: After pilot rollout in at least one health unit, the share of families that go more than the recommended interval without a visit drops by at least 30% relative to the pre-pilot baseline in the same micro-areas, attributable to the app's prioritization.
- **SC-006**: Fewer than 1 in 100 visit registrations result in a user-visible error (failed save, lost data, wrong family) during pilot use.

## Assumptions

- The product targets community health agents working in Brazil's primary-care context (Atenção Primária à Saúde / ESF). The vocabulary, vulnerable-group categories (gestantes, idosos, crianças, crônicos), and "micro-area" concept come from that domain.
- This release is a POC / MVP focused on the daily decision-support loop (see queue → visit → score recalculates → list re-prioritizes). Profile maintenance, admin tooling, and reporting are explicitly deferred beyond the MVP.
- The POC is built as a Next.js web application with TypeScript across the full stack (UI, scoring logic, data layer). It runs in a mobile browser on the field device; no native app packaging or app-store distribution is in scope.
- Each CHA primarily uses one mobile device assigned to them; tablet form factor is acceptable but the layout is designed mobile-first (responsive).
- Visit registrations and the mocked roster are persisted entirely in browser storage (localStorage / IndexedDB); no server-side data store is required for the POC.
- The neighborhood map is rendered from a pre-generated static raster tile pack bundled into the Next.js build for the pilot micro-area's bounding box (see FR-018); live high-resolution map tiles are not assumed to be available in the field, and the runtime issues no tile network requests.
- The risk-score weighting (how much each factor contributes — time since visit vs. chronic conditions vs. vulnerable group) is a parameter that will be tuned during pilot and is not hard-coded into the spec. The spec only requires that all listed factors contribute and that the resulting order is explainable to the CHA.
- "Today's queue" is the union of families whose recommended visit interval has been met or exceeded plus families flagged for follow-up; the exact recommended-interval rules per family type (e.g., gestante = monthly) follow the ESF guidance prevalent at pilot time.
- Family roster data (households, residents, addresses) is mocked and baked into the POC build. There is no external registration system to read from or write to; "refreshing" the roster means shipping a new build with updated mock data.
- Visit history is retained at least for the duration the family remains enrolled in the micro-area; longer-term retention follows the health unit's existing record-retention policy.
- The app is positioned as a decision-support POC, not a system of record. Production integration with patient-record systems (e.g., e-SUS APS) and any real clinical data are out of scope for this MVP.
- The pilot device is dedicated to a single CHA, is not shared, and is wiped at the end of the pilot. This assumption is what makes the FR-015 plaintext-at-rest decision acceptable for the POC; it does not extend to any subsequent rollout.
