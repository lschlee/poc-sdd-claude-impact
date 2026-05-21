# Data Model: Next-Visit Priority App

Phase 1 output — entities, fields, relationships, validation rules, state transitions.

---

## Entities

### Family

The unit of visit prioritization. Belongs to exactly one micro-area. Immutable in the MVP (roster is read-only).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `"FAM-001"`) |
| `name` | `string` | Display name (e.g., `"Família Silva"`) |
| `microAreaId` | `string` | FK → MicroArea |
| `address` | `string \| null` | Human-readable address; `null` = unknown |
| `coordinates` | `LatLng \| null` | GPS `{ lat, lng }`; `null` → "needs location" map pin state (FR-002) |
| `residents` | `Resident[]` | Household members (read-only in MVP) |

**Derived (not stored, recomputed on demand)**:

| Derived field | Derivation |
|---|---|
| `lastVisitDate: ISODateString \| null` | Most recent active (non-undone) visit date for this family; `null` = never visited |
| `daysSinceLastVisit: number` | `(today − lastVisitDate).days`; `Infinity` when `lastVisitDate` is `null` (maps to `f_time = 1.0`) |
| `followUpRequired: boolean` | `true` if any active visit has `followUpFlags.length > 0` |
| `riskScore: RiskScore` | Computed by `scoring.ts` from residents + derived fields above |

---

### Resident

A person living in a family. Read-only inside the MVP app.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique resident identifier |
| `familyId` | `string` | FK → Family |
| `ageGroup` | `'infant' \| 'child' \| 'adult' \| 'elderly'` | `infant` < 1 yr, `child` 1–11 yr, `adult` 12–59 yr, `elderly` ≥ 60 yr |
| `isPregnant` | `boolean` | Pregnancy flag (only meaningful for adults) |
| `chronicConditions` | `string[]` | Condition identifiers (e.g., `"hypertension"`, `"diabetes"`) |

**Vulnerable group rule**: a resident is "vulnerable" when `ageGroup === 'infant'`, `ageGroup === 'elderly'`, or `isPregnant === true`.

---

### Visit

A recorded event of a CHA visiting a family. Stored in IndexedDB.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID, generated at registration time |
| `familyId` | `string` | FK → Family |
| `chaId` | `string` | CHA identifier — baked into build for POC (FR-010) |
| `visitDate` | `ISODateString` | Date of the visit (CHA-entered; `≤ today`) |
| `notes` | `string` | Free-text field |
| `followUpFlags` | `FollowUpFlag[]` | Optional structured flags (e.g., `"blood_pressure_not_measured"`, `"referral_needed"`) |
| `registeredAt` | `ISODateString` | Audit timestamp — when the record was written (FR-014) |
| `undone` | `boolean` | `false` by default; set to `true` on undo (FR-013); soft-delete |

**Active visit**: a visit where `undone === false`. Only active visits contribute to `lastVisitDate` and `followUpRequired`.

---

### RiskScore

Derived value — computed by `scoring.ts`, never stored.

```ts
interface RiskScore {
  total: number;        // overall score in [0, 1]
  factors: RiskFactor[];
}

interface RiskFactor {
  key: 'time_since_visit' | 'chronic_conditions' | 'vulnerable_groups' | 'follow_up';
  value: number;        // normalized sub-score [0, 1]
  weight: number;       // configured weight (sum of all weights = 1.0)
  contribution: number; // value × weight
  labelKey: string;     // i18n key for CHA-facing explanation (FR-004)
}
```

---

### MicroArea

The geographic unit a CHA covers. Defines the map bounding box. Read-only in the MVP.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `bounds` | `LatLngBounds` | `{ north, south, east, west }` — map extent for Leaflet |
| `chaId` | `string` | Assigned CHA (one CHA per micro-area in MVP) |

---

### CommunityHealthAgent (CHA)

The end user. Single identity baked into the build for the POC.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | CHA identifier (e.g., `"CHA-001"`) |
| `name` | `string` | Display name |
| `microAreaIds` | `string[]` | Assigned micro-areas (one in MVP) |

---

## Relationships

```
CHA (1) ──────────── (N) MicroArea
MicroArea (1) ──────── (N) Family
Family (1) ──────────── (N) Resident       [roster, read-only]
Family (1) ──────────── (N) Visit          [IndexedDB, mutable]
Visit (N) ────────────── (1) CHA
Family (1) ──────────── (1) RiskScore      [derived, not stored]
```

---

## State Transitions

### Visit.undone

```
[registered]  undone = false
                  │
                  │  undoVisit() — same session, FR-013
                  ▼
[undone]      undone = true
```

Undo is irreversible (no re-do in scope). The record is preserved with `undone: true` for audit purposes (FR-014).

### Family.lastVisitDate (derived)

```
null  (never visited — max time signal)
  │
  │  registerVisit(date)
  ▼
ISODateString  (most recent active visit)
  │
  │  undoVisit()  [if this was the only/latest active visit]
  ▼
previous ISODateString  OR  null  (if no active visits remain)
```

---

## Validation Rules

| Rule | Constraint | Source |
|---|---|---|
| Visit date not in the future | `visitDate ≤ today` | FR-005 |
| Visit date is a valid ISO 8601 date string | Format enforced at input | FR-005 |
| Family scoped to CHA's micro-area | `family.microAreaId ∈ cha.microAreaIds` — no cross-area leakage | FR-008 |
| Tie-break is deterministic | Sort: `total DESC` → `daysSinceLastVisit DESC` → `family.id ASC` | FR-009 |
| Follow-up flag elevates score after visit | `followUpRequired = true` when any active visit has `followUpFlags.length > 0`; prevents family dropping to bottom | Story 2 AC-3 |
| Missing roster fields handled gracefully | Absent `coordinates` → "needs location" pin; absent `ageGroup` / conditions → omitted from scoring | Edge cases in spec |
| Never-visited family ranks high | `daysSinceLastVisit = Infinity` → `f_time = 1.0` | Edge case in spec |

---

## IndexedDB Schema

**Database name**: `nvp-db` | **Version**: 1

### Object Store: `visits`

| Property | Value |
|---|---|
| Key path | `id` (UUID string) |
| Indexes | `by-family` → `familyId`; `by-date` → `visitDate`; `by-cha` → `chaId` |
| Records | Visit objects (all fields including `undone`) |

### Object Store: `auditLog`

| Property | Value |
|---|---|
| Key path | `id` (UUID string) |
| Indexes | `by-timestamp` → `registeredAt` |
| Records | `{ id, visitId, familyId, chaId, action: 'register' \| 'undo', timestamp }` |

*Roster data (families, residents, micro-area, CHA) is a static TypeScript module in `src/data/roster.ts` — not stored in IndexedDB.*
