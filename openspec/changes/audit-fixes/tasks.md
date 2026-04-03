## 1. Core Safety — Remove `process.cwd()` from core (P10, P1, P9)

- [x] 1.1 Make `repo_path` required (`string`, not optional) in all core command input types
- [x] 1.2 Make `repo_path` required (`string`, not optional) in all core query input types
- [x] 1.3 Remove `const cwd = input.repo_path || process.cwd()` from all 10 command files, use `input.repo_path` directly
- [x] 1.4 Remove `const cwd = input.repo_path || process.cwd()` from all 7 query files, use `input.repo_path` directly
- [x] 1.5 Update transport-mcp handlers to supply `process.cwd()` as default `repo_path` before calling core
- [x] 1.6 Update transport-http handlers to supply `process.cwd()` as default `repo_path` before calling core
- [x] 1.7 Update mode-embedded entry point to supply `process.cwd()` as default if applicable
- [x] 1.8 Remove `sanitizeChangeId` call from `getChangePath` in `packages/infra-fs/src/storage/changes.ts` (P1)
- [x] 1.9 Add ID length validation (>80 chars) in `createChange` after `generateChangeId` (P9)
- [x] 1.10 Verify: `grep -r "process.cwd()" packages/core/src/` returns zero matches
- [x] 1.11 Verify: `tsc --noEmit` passes with no new errors

## 2. Heuristic Cleanup — Warnings instead of errors (P4, P5)

- [x] 2.1 Change `validateDecisionInput` in `logDecision.ts` to return warnings array instead of throwing
- [x] 2.2 Update `logDecision` return type to include optional `warnings` field
- [x] 2.3 Verify `looksLikeDecision` in `ingestMemory.ts` is only used in note handler warnings (P5 — confirm no changes needed)
- [x] 2.4 Verify: `npm run build` passes

## 3. Type Dedup — Eliminate duplication (P3, P6)

- [x] 3.1 Refactor `ProjectContextOutput` to define shared fields once, type `structured` as `Omit<ProjectContextOutput, 'context_text' | 'structured'>` (P3)
- [x] 3.2 Extract `buildDashboard` branches into named helper functions: `buildUninitializedDashboard`, `buildFullDashboard` (P6)
- [x] 3.3 Verify: `tsc --noEmit` passes with no new errors

## 4. Infra Hygiene — Version, migration, config (P8, P2, P11)

- [x] 4.1 Import `version` from package.json in `transport-mcp/src/server.ts`, replace hardcoded `'0.0.3'` (P8)
- [x] 4.2 Add legacy `decisions.json` → `decisions.ndjson` auto-migration in `readDecisions` (P2)
- [x] 4.3 Make milestone patterns configurable in `inferFocus.ts` with defaults for backward compat (P11)
- [x] 4.4 Verify: `npm run build` and `npm test` pass

## 5. Final Verification

- [x] 5.1 Run full `npm run build` — clean exit
- [x] 5.2 Run `npm test` — all tests pass (10/10)
- [x] 5.3 Grep verification: 1 `process.cwd()` in `packages/core/src/runtime/index.ts` (boundary layer — intentional per D1), zero in commands/queries/understanding
