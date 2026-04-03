## Why

A Linus Torvalds-style audit of the entire codebase (71 source files) found 11 issues. The most critical is **P10**: every core command defaults `repo_path` to `process.cwd()`, which silently returns wrong data in multi-repo MCP server scenarios. The remaining issues range from a hardcoded version string to NLP heuristics in the core layer that don't belong there. All fixes are low-risk internal improvements with no public API breakage.

## What Changes

- **P10**: Remove `process.cwd()` fallback from all 17 core commands/queries. Make `repo_path` required at the core layer; transport layers supply it.
- **P8**: Read MCP server version from `package.json` instead of hardcoding `0.0.3`.
- **P3**: Eliminate `ProjectContextOutput.structured` field duplication (~50 duplicate lines) by referencing a shared type.
- **P9**: Add length validation in `createChange` so oversized IDs fail early with a clear error instead of being silently truncated by `sanitizeChangeId`.
- **P4**: Downgrade `logDecision` weak-signal validation from hard error to warning returned in response.
- **P5**: Move `looksLikeDecision` heuristic out of core `ingestMemory` — make it a transport-layer advisory, not a core concern.
- **P1**: Remove double-sanitization in `getChangePath` — IDs are sanitized at creation time only.
- **P6**: Split `buildDashboard` into focused helper functions for the three mutually exclusive branches.
- **P2**: Add one-time auto-migration from legacy `decisions.json` to `decisions.ndjson`.
- **P11**: Make understanding-layer milestone patterns configurable rather than hardcoded.

## Capabilities

### New Capabilities
- `core-safety`: Remove `process.cwd()` defaults, add ID length validation, fix double-sanitization — harden core against silent failures.
- `heuristic-cleanup`: Move NLP heuristics out of core layer, downgrade weak-signal validation to warnings — keep core pure.
- `type-dedup`: Eliminate `ProjectContextOutput` type duplication, split `buildDashboard` into focused helpers — reduce structural waste.
- `infra-hygiene`: Auto-migrate legacy `decisions.json`, read version from `package.json`, make milestone patterns configurable — clean infrastructure.

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Affected code**: All 17 files in `packages/core/src/commands/` and `packages/core/src/queries/` (P10), `packages/transport-mcp/src/server.ts` (P8), `packages/core/src/queries/context/getProjectContext.ts` (P3), `packages/infra-fs/src/storage/changes.ts` (P1, P9), `packages/core/src/commands/logDecision.ts` (P4), `packages/core/src/commands/ingestMemory.ts` (P5), `packages/core/src/queries/dashboard/buildDashboard.ts` (P6), `packages/infra-fs/src/storage/decisions.ts` (P2), `packages/core/src/understanding/` (P11)
- **APIs**: No public API changes. MCP tools, HTTP endpoints, and CLI remain identical. `repo_path` was already marked required in MCP tool descriptions.
- **Dependencies**: No new dependencies.
- **Risk**: Low. P10 is the highest-effort fix (17 files) but mechanically simple. All changes are internal.
