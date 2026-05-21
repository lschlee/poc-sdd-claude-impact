# Contract: Storage Schema

This document is the authoritative definition of the browser storage layout for the Next-Visit Priority POC. Any change to this contract requires a corresponding IndexedDB version bump and a migration in `src/lib/storage/db.ts`.

---

## IndexedDB

**Database name**: `nvp-db`
**Schema version**: `1`
**Opened by**: `src/lib/storage/db.ts` → `openDB('nvp-db', 1, { upgrade })`

### Object Store: `visits`

Stores all visit records, including undone ones (soft-delete pattern).

```ts
interface VisitRecord {
  id: string;              // UUID — primary key
  familyId: string;        // indexed
  chaId: string;           // indexed
  visitDate: string;       // ISO 8601 date, e.g. "2026-05-21" — indexed
  notes: string;
  followUpFlags: string[]; // e.g. ["blood_pressure_not_measured"]
  registeredAt: string;    // ISO 8601 datetime (UTC)
  undone: boolean;         // false = active; true = soft-deleted
}
```

| Property | Value |
|---|---|
| Key path | `"id"` |
| Auto-increment | No (UUID assigned by caller) |
| Index: `by-family` | `keyPath: "familyId"`, `unique: false` |
| Index: `by-date` | `keyPath: "visitDate"`, `unique: false` |
| Index: `by-cha` | `keyPath: "chaId"`, `unique: false` |

**Query patterns**:
- All active visits for a family: `index('by-family').getAll(familyId)` → filter `undone === false`
- Most recent active visit date: sort active results by `visitDate DESC`, take first
- Full history for a family (including undone): `index('by-family').getAll(familyId)` (no filter)

---

### Object Store: `auditLog`

Append-only log of every state-changing operation on visits (FR-014).

```ts
interface AuditEntry {
  id: string;              // UUID — primary key
  visitId: string;         // FK → visits.id
  familyId: string;
  chaId: string;
  action: 'register' | 'undo';
  timestamp: string;       // ISO 8601 datetime (UTC) — indexed
}
```

| Property | Value |
|---|---|
| Key path | `"id"` |
| Auto-increment | No (UUID assigned by caller) |
| Index: `by-timestamp` | `keyPath: "timestamp"`, `unique: false` |

**Write policy**: an `AuditEntry` is written atomically in the same IndexedDB transaction as its corresponding `VisitRecord` mutation. If the transaction aborts, no audit entry is created.

---

## Static Module (not IndexedDB)

The following data is **not** stored in IndexedDB — it is a static TypeScript ESM module imported at bundle time.

**Module**: `src/data/roster.ts`

```ts
export interface RosterData {
  cha: CHA;
  microArea: MicroArea;
  families: Family[];     // ~30 entries
  residents: Resident[];  // ~90 entries (all families combined)
}

export const roster: RosterData = { ... }; // demo fixture
```

The module is imported directly by `src/lib/storage/rosterRepository.ts`; no serialization, no DB reads.

---

## Versioning Policy

When the schema changes:
1. Bump the `version` argument in `openDB('nvp-db', NEW_VERSION, { upgrade })`.
2. Add an `upgrade` branch for `oldVersion < NEW_VERSION` that performs the migration.
3. Update this document with the new version number and any changed stores/indexes.
4. Update `data-model.md` if entity shapes change.
