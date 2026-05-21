<!--
SYNC IMPACT REPORT
==================
Version change: (template/unversioned) → 1.0.0
Bump rationale: Initial ratification — first concrete population of the
constitution from the template, establishing two non-negotiable principles.

Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles
    - I. Test-Driven Development (NON-NEGOTIABLE)
    - II. Vertical Slice Delivery (NON-NEGOTIABLE)
  - Development Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: All placeholder principle slots III, IV, V (template only
shipped 5 slots; the user defined 2, so unused slots were dropped — see
governance for the amendment path to add more).

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section
    populated with gates derived from these principles)
  - ✅ .specify/templates/tasks-template.md (tests are no longer OPTIONAL;
    per-user-story test-first ordering is now mandatory; vertical-slice
    completeness checkpoints reinforced)
  - ✅ .specify/templates/spec-template.md (already aligned — user stories
    are required to be independently testable, which matches Vertical Slice
    Delivery; no edit needed)

Follow-up TODOs: None.
-->

# poc-sdd-claude-impact Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

Every change — feature work, bug fix, or refactor that alters observable
behavior — MUST begin with an automated test that fails for the right reason
before any production code is written or modified. The cycle is strictly
Red → Green → Refactor:

- **Red**: Author the test first. Run it. Confirm it fails, and confirm the
  failure message points at the missing or incorrect behavior (not at a
  setup mistake, a typo, or a missing import).
- **Green**: Write the minimum production code required to make the test
  pass. No speculative code, no untested branches.
- **Refactor**: With tests green, improve structure without changing
  behavior. Tests must remain green after every refactor step.

Pure refactors that preserve behavior MAY proceed under existing test
coverage, provided that coverage demonstrably exercises the code paths
being changed. If the affected paths are uncovered, a characterization
test MUST be added first.

**Rationale**: Writing the test first forces the change to be specified
in terms of observable behavior before implementation bias sets in. Seeing
the test fail proves the test actually validates the new behavior rather
than passing vacuously. This is the discipline that lets the rest of the
constitution — vertical slices, quality gates — stay honest.

### II. Vertical Slice Delivery (NON-NEGOTIABLE)

Features MUST be built and delivered as vertical slices. A vertical slice
is an increment that exercises every layer the feature touches — from the
entry point (UI, API, CLI, event handler, etc.) through application logic,
domain logic, and persistence or external integrations — for one narrow
piece of user-visible behavior.

Concretely:

- Each user story or feature increment MUST be independently demonstrable:
  someone unfamiliar with the implementation should be able to trigger the
  slice from the outermost interface and observe the end-to-end result.
- Horizontal-only increments (e.g., "add all the database tables for the
  feature", "build the UI shell with no backend wiring") are NOT a valid
  unit of completion. They MAY exist as internal steps within a slice but
  MUST NOT be the final state of a merged increment.
- Every slice MUST be covered by at least one test that traverses the same
  layers the slice traverses, so the whole stack is validated at every
  increment (this composes with Principle I).
- Slices MUST be sized so that they can be merged and, where applicable,
  released independently. If a slice cannot be released without a sibling
  slice, the two MUST be merged into a single slice or the dependency
  removed.

**Rationale**: Vertical slicing keeps risk visible. Integration problems,
contract mismatches, and assumption errors surface on the first slice
rather than at the end of a multi-week horizontal build-out. It also
guarantees that work-in-progress always has demonstrable value, which
makes scope cuts and re-prioritization cheap.

## Development Constraints

These constraints follow directly from the Core Principles and apply to
all work in this repository:

- **Test execution MUST be fast and local.** The test suite for a slice
  MUST be runnable on a developer machine without provisioning external
  shared infrastructure. Use ephemeral test doubles, in-memory stores, or
  containerized dependencies as appropriate. Slow tests undermine the
  Red-Green-Refactor cadence and lead to TDD erosion.
- **A failing test MUST be committed (or otherwise recorded) before its
  implementation.** Commits, PRs, or task transitions MUST reflect the
  Red → Green order. Squashing is allowed at merge time but the authored
  history MUST show test-first ordering.
- **No commented-out tests, no `skip` annotations without an issue link.**
  Disabling a test is a behavior change and MUST be justified.
- **Every merged slice MUST include at least one end-to-end (or full-stack
  integration) test for the new behavior.** Unit tests alone do not
  satisfy Principle II.
- **NEEDS CLARIFICATION markers block implementation.** If a spec, plan,
  or task contains a `NEEDS CLARIFICATION` marker on something the current
  slice depends on, implementation of that slice MUST NOT begin until the
  marker is resolved.

## Development Workflow & Quality Gates

The Spec-Driven Development workflow (specify → clarify → plan → tasks →
implement) is the canonical path for non-trivial changes. The following
gates are enforced at the named phases:

1. **Spec gate (`/speckit-specify`, `/speckit-clarify`)**: User stories
   MUST be written as independently testable vertical slices with explicit
   acceptance criteria. A spec whose stories cannot be tested end-to-end
   without one another fails this gate.
2. **Plan gate (`/speckit-plan`)**: The Constitution Check MUST explicitly
   address (a) how Red-Green-Refactor will be executed for each slice and
   (b) what end-to-end test proves the slice traverses all layers.
   Violations MUST be recorded in the Complexity Tracking table with a
   justification — no silent exceptions.
3. **Tasks gate (`/speckit-tasks`)**: For every user story, the generated
   `tasks.md` MUST include at least one failing-test task that precedes
   any implementation task in that story, and at least one end-to-end /
   integration test task scoped to the story's slice. Tests are NOT
   optional in this project.
4. **Implementation gate (`/speckit-implement`)**: Implementation tasks
   MUST NOT be marked complete unless their preceding test tasks are
   present, were observed to fail before implementation, and are now
   passing.
5. **Review gate (PR review)**: Reviewers MUST verify that the PR diff
   shows test-first ordering and slice completeness. PRs that introduce
   production code without corresponding tests, or that ship a partial
   horizontal layer, MUST be rejected or scoped down.

Trivial changes (typo fixes in comments, formatting-only edits, config
changes that have no behavioral effect) are exempt from the TDD cycle but
MUST be labeled as such in the PR description so reviewers can confirm
the exemption applies.

## Governance

This constitution supersedes ad-hoc conventions and individual preferences
in this repository. When a recommended practice from any external source
(skill guidance, template defaults, generated tasks) conflicts with this
constitution, the constitution wins; the conflicting artifact MUST be
updated to align.

**Amendment procedure**:

1. Open a PR that modifies `.specify/memory/constitution.md` together with
   a Sync Impact Report (as an HTML comment at the top of the file).
2. Update every dependent template under `.specify/templates/` so it
   reflects the new rules. List each updated file in the Sync Impact
   Report.
3. Bump the version per the policy below.
4. Merge requires explicit approval acknowledging the constitutional
   change (not just code review approval).

**Versioning policy** (semantic):

- **MAJOR**: A principle is removed, redefined in a backward-incompatible
  way, or the governance procedure itself changes.
- **MINOR**: A new principle or new mandatory section is added, or
  guidance is materially expanded.
- **PATCH**: Clarifications, wording, typo fixes, or non-semantic
  refinements that do not change what is permitted or forbidden.

**Compliance review**: Every PR review MUST include a constitution
compliance check. Reviewers explicitly confirm that test-first ordering
and vertical-slice completeness were honored. Repeated violations are
treated as a process defect and SHOULD trigger an amendment (to either
the constitution or the workflow templates) rather than be normalized.

**Version**: 1.0.0 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
