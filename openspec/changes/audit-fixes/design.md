## Context

ProjectBrain follows a Port/Adapter architecture: `protocol → core → infra-fs → transports`. Core is supposed to be pure domain logic with no filesystem or environment dependencies, receiving `StoragePort` and `GitPort` as injected parameters.

However, every core command/query still has `const cwd = input.repo_path || process.cwd()` — a Node.js environment dependency leaking into the core layer. Additionally, NLP heuristics (`looksLikeDecision`, `validateDecisionInput`) are domain-irrelevant concerns that leaked into core commands. The transport-mcp server hardcodes its version, and the `ProjectContextOutput` type is duplicated.

All 11 issues found in the Linus-style audit are internal improvements. No public API surface changes.

## Goals / Non-Goals

**Goals:**
- Remove all `process.cwd()` references from core layer (17 files)
- Make `repo_path` a required parameter in core function signatures
- Move NLP heuristics to transport/advisory layer
- Eliminate type duplication and structural waste
- Fix version mismatch and infrastructure hygiene issues

**Non-Goals:**
- Changing any public API (MCP tools, HTTP endpoints, CLI)
- Adding new features or capabilities
- Refactoring the understanding layer's algorithm (only making patterns configurable)
- Adding tests (follow-up task, not part of this change)

## Decisions

### D1: `repo_path` required at core, optional at transport

Core functions will require `repo_path: string` (not optional). Transport layers keep `repo_path?: string` and supply `process.cwd()` as the default before calling core. This keeps the environment dependency at the boundary where it belongs.

**Alternative considered**: Throwing if `repo_path` is missing in core. Rejected because it would change error behavior for existing callers who rely on the default.

### D2: Weak-signal validation becomes advisory warnings

`validateDecisionInput` (P4) currently throws a hard error for words like "todo", "maybe". This will be changed to return warnings in the response object instead, matching the pattern already used by `ingestMemory`'s `warnings` field. The `looksLikeDecision` heuristic (P5) moves to the note handler's warnings — same pattern, just relocated.

### D3: `ProjectContextOutput` uses `Omit` to remove duplication

Instead of maintaining two identical 50-line type blocks, the `structured` field will be typed as `Omit<ProjectContextOutput, 'context_text' | 'structured'>`. The implementation already spreads `structured` into the top level, so this is purely a type-level fix.

### D4: ID validation at creation, not at lookup

`sanitizeChangeId` is currently applied both at `generateChangeId` (creation) and `getChangePath` (lookup). The lookup call will be removed — IDs are sanitized once at creation and stored as-is. `createChange` will validate length and throw if the generated ID exceeds 80 characters.

### D5: Version read from package.json

`transport-mcp/server.ts` will import `version` from `../../package.json` (with `resolveJsonModule: true` already enabled in tsconfig) instead of hardcoding `'0.0.3'`.

### D6: Legacy migration is read-time, not startup

If `decisions.json` exists and `decisions.ndjson` doesn't, `readDecisions` in infra-fs will read from `.json`, convert to NDJSON format, write `decisions.ndjson`, and optionally rename the old file to `decisions.json.bak`. This happens once, lazily, on first read.

## Risks / Trade-offs

- **P10 (17 files)**: High-count but mechanically simple — each file gets the same one-line change. Risk is in missing a file. Mitigation: grep verification after all edits.
- **D2 (warnings vs errors)**: Existing callers that catch the `logDecision` error for "todo"-like inputs will see different behavior. Low risk — this is a strictness relaxation, not a tightening.
- **D5 (import package.json)**: Some bundlers have issues with JSON imports. Low risk — this is a Node.js server, not bundled for browser.
- **D6 (auto-migration)**: Could corrupt data if migration is interrupted. Mitigation: write NDJSON first, then rename old file — atomic sequence.
