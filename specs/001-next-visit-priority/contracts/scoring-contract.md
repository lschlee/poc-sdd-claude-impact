# Contract: Scoring Function

This document is the authoritative TypeScript contract for the risk scoring engine (`src/domain/scoring.ts`) and the queue ordering utility (`src/domain/queue.ts`). Changes to these signatures require updating the contract, affected tests, and the UI components that consume the output.

---

## Types

These types are defined in `src/domain/models.ts` and shared across the codebase.

```ts
type ISODateString = string; // "YYYY-MM-DD"

type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';

type FollowUpFlag = string; // e.g. "blood_pressure_not_measured"

type RiskFactorKey =
  | 'time_since_visit'
  | 'chronic_conditions'
  | 'vulnerable_groups'
  | 'follow_up';

interface RiskFactor {
  key: RiskFactorKey;
  value: number;        // normalized sub-score in [0, 1]
  weight: number;       // configured weight
  contribution: number; // value × weight
  labelKey: string;     // next-intl message key for CHA-facing explanation
}

interface RiskScore {
  total: number;          // sum of all contributions, in [0, 1]
  factors: RiskFactor[];  // one entry per RiskFactorKey
}

interface Resident {
  id: string;
  familyId: string;
  ageGroup: AgeGroup;
  isPregnant: boolean;
  chronicConditions: string[];
}

interface Family {
  id: string;
  name: string;
  microAreaId: string;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  residents: Resident[];
}

interface Visit {
  id: string;
  familyId: string;
  chaId: string;
  visitDate: ISODateString;
  notes: string;
  followUpFlags: FollowUpFlag[];
  registeredAt: string;
  undone: boolean;
}

interface ScoringWeights {
  timeSinceVisit: number;    // default: 0.40
  chronicConditions: number; // default: 0.25
  vulnerableGroups: number;  // default: 0.25
  followUp: number;          // default: 0.10
  // Invariant: sum of all weights === 1.0
}

interface ScoringConstants {
  neverVisitedCap: number;  // default: 365 (days)
  chronicCap: number;       // default: 5   (conditions)
}

interface ScoringConfig {
  weights: ScoringWeights;
  constants: ScoringConstants;
}

interface ScoredFamily {
  family: Family;
  activeVisits: Visit[];
  score: RiskScore;
  daysSinceLastVisit: number; // Infinity when never visited
  lastVisitDate: ISODateString | null;
  followUpRequired: boolean;
}
```

---

## `computeRiskScore` — `src/domain/scoring.ts`

```ts
/**
 * Pure function. Computes the risk score for a single family.
 *
 * @param family       - The family entity (roster data, read-only)
 * @param activeVisits - All visits for this family where undone === false
 * @param today        - Reference date for "days since last visit" (injected for testability)
 * @param config       - Optional overrides for weights and constants
 * @returns            - RiskScore with total and per-factor breakdown
 */
export function computeRiskScore(
  family: Family,
  activeVisits: Visit[],
  today: Date,
  config?: Partial<ScoringConfig>
): RiskScore;
```

**Behaviour guarantees**:
- Always returns `total` in `[0, 1]`.
- `factors` always contains exactly four entries, one per `RiskFactorKey`, in the order listed in the type definition.
- When `activeVisits` is empty, `f_time = 1.0` (never-visited maximum, per FR-003 and spec edge cases).
- When `family.residents` is empty, `f_chronic = 0` and `f_vulnerable = 0` (missing data treated as zero, not as error).
- The function is deterministic: same inputs always produce identical output.
- No I/O, no global state reads, no Date.now() — `today` is always injected.

**Factor formulas**:

| Factor key | Formula |
|---|---|
| `time_since_visit` | `min(daysSince / neverVisitedCap, 1.0)` where `daysSince = Infinity` → `1.0` |
| `chronic_conditions` | `min(Σ(resident.chronicConditions.length) / chronicCap, 1.0)` |
| `vulnerable_groups` | `vulnerableCount / max(totalResidents, 1)` |
| `follow_up` | `1.0` if any `activeVisits` has `followUpFlags.length > 0`; else `0.0` |

---

## `sortQueue` — `src/domain/queue.ts`

```ts
/**
 * Sorts scored families into the descending-risk display order.
 * Tie-break is deterministic per FR-009.
 *
 * @param families - Array of ScoredFamily (any order)
 * @returns        - New array sorted: total DESC → daysSinceLastVisit DESC → family.id ASC
 */
export function sortQueue(families: ScoredFamily[]): ScoredFamily[];
```

**Behaviour guarantees**:
- Returns a new array (input is not mutated).
- Sort is stable within ties on all three keys.
- Two calls with the same input always return the same order (pure, deterministic).

---

## Default Config Export

```ts
// src/domain/scoring.ts
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    timeSinceVisit: 0.40,
    chronicConditions: 0.25,
    vulnerableGroups: 0.25,
    followUp: 0.10,
  },
  constants: {
    neverVisitedCap: 365,
    chronicCap: 5,
  },
};
```

Pilot operators tune weights by editing this object; no UI toggle is required for the MVP.

---

## i18n Label Keys

Each `RiskFactor.labelKey` maps to a string in `src/lib/i18n/messages/pt-BR.json`.

| `key` | `labelKey` | Example pt-BR string |
|---|---|---|
| `time_since_visit` | `riskFactor.timeSinceVisit` | `"{{days}} dias sem visita"` |
| `chronic_conditions` | `riskFactor.chronicConditions` | `"{{count}} condição(ões) crônica(s)"` |
| `vulnerable_groups` | `riskFactor.vulnerableGroups` | `"{{count}} residente(s) vulnerável(eis)"` |
| `follow_up` | `riskFactor.followUp` | `"Retorno pendente"` |
