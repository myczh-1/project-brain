## Context

ProjectBrain is a single npm package (`@myczh/project-brain`) with 9 internal pseudo-packages under `packages/`. The current dependency graph has cycles:

```
application ←→ runtime (runtime imports application/commands, application re-exports runtime)
context → runtime (finishWork.ts imports runtime)
protocol → application (protocol/runtime.ts imports application types)
application → context (re-exports createContextService)
```

The `package.json` exposes ~15 subpath exports mapping to these internal packages. There is no interface abstraction for storage/git — all commands directly call filesystem functions from `core-protocol/storage`.

The Phase 1 code review already cleaned up dead code, removed type casts, and consolidated imports. This Phase 2 restructure addresses the remaining structural problems.

## Goals / Non-Goals

**Goals:**
- Eliminate all circular dependency chains between internal packages
- Make `protocol` a pure contract layer with zero internal imports
- Merge `application` + `context` + `runtime` into a unified `core` that owns all business logic
- Introduce port interfaces for storage and git in `core`, implemented by `infra-fs`
- Reduce `package.json` subpath exports to match real module boundaries (~5-6 exports)
- Remove `mode-service` pass-through package
- Maintain identical external behavior: MCP tools, HTTP endpoints, CLI all work the same

**Non-Goals:**
- Changing the `.project-brain/` file format or protocol semantics
- Adding new features or capabilities
- Changing the public MCP tool schemas or HTTP API
- Rewriting the analysis/context query logic (just relocating it)
- Full test suite creation (only service-boundary smoke tests)
- Breaking `mode-embedded` consumers (keep it working, potentially thinner)

## Decisions

### 1. Merge application + context + runtime → `core`

**Decision**: Collapse three packages into one `core` package that owns: commands (use cases), queries (context/dashboard/analysis), the runtime message dispatcher, service interfaces, and domain types.

**Rationale**: These three packages form a circular cluster and share the same domain. Splitting them creates artificial boundaries that the code doesn't respect. A single `core` with clear internal file organization (commands/, queries/, runtime/, ports/) is simpler and honestly represents the dependency structure.

**Alternatives considered**:
- Keep them separate but break cycles by inverting dependencies → Still 3 packages for one domain; more indirection for no real modularity gain.
- Merge only application + runtime, keep context separate → Context depends on runtime state (finishWork), so the cycle persists.

### 2. Protocol stays pure — types and schemas only

**Decision**: `protocol` must have zero imports from any other internal package. It exports TypeScript types, Zod schemas, and the `.project-brain/` file format contracts. The `runtime.ts` file currently in protocol (which imports application types) will move to `core`.

**Rationale**: Protocol is the contract surface. If it imports implementation code, it's not a contract — it's a leaky abstraction. Pure protocol enables external consumers to depend on just the types without pulling in the entire runtime.

**Alternatives considered**:
- Inline protocol types into core → Loses the clean contract surface for external consumers and lightweight integrations.

### 3. Extract `infra-fs` with port interfaces in `core`

**Decision**: Define `StoragePort` and `GitPort` interfaces in `core/ports/`. Move all `core-protocol/storage/` and `core-protocol/git/` filesystem implementations to `infra-fs/` which implements those ports.

**Rationale**: Commands currently call `readManifest()`, `ensureBrainDir()`, `getRepoRoot()` directly — tight coupling to filesystem. With ports, `core` depends on interfaces while `infra-fs` provides the implementation. This enables unit testing commands without a real filesystem.

**Alternatives considered**:
- Keep direct fs calls, mock at module level in tests → Fragile mocks, no compile-time safety, doesn't solve the architectural coupling.
- Use dependency injection framework → Overkill for this project size. Simple constructor/factory injection via ports is sufficient.

### 4. Composition root in `app`

**Decision**: `app` becomes the sole composition root. It wires `core` + `infra-fs` + transports together. `mode-service` is deleted (it's just a pass-through). `mode-embedded` stays as a thin convenience export for embedded usage, or folds into `core` if it adds no value beyond composition.

**Rationale**: A single composition root makes the wiring explicit and eliminates the "where does initialization happen?" question.

### 5. Target package.json exports

**Decision**: Reduce to:
```
"."              → core (main entry, most consumers need this)
"./protocol"     → pure types/schemas
"./infra-fs"     → storage/git adapters
"./transport-http" → HTTP server
"./transport-mcp"  → MCP server
"./app"          → composition root + CLI
```

Remove: `./application`, `./application/commands`, `./core-protocol`, `./core-protocol/git`, `./core-protocol/storage`, `./core-protocol/understanding`, `./mode-embedded`, `./mode-service`, `./runtime`, `./context`, `./protocol/runtime`.

**Rationale**: 15 exports for internal pseudo-packages creates a false impression of modularity. 6 exports matching real boundaries is honest.

### 6. Migration strategy: incremental, build-green at each step

**Decision**: Execute in ordered groups. Each group produces a buildable state before the next begins:
1. Create `core` package, move files in, update internal imports
2. Create port interfaces and `infra-fs`, wire implementations
3. Update transports to import from `core`
4. Delete empty old packages, update `package.json` exports
5. Clean up `mode-service`, simplify `mode-embedded`

**Rationale**: Big-bang restructures leave the codebase broken for too long. Incremental steps with build verification at each stage catch errors early.

## Risks / Trade-offs

**[Risk] Large diff touching most files** → Mitigation: Execute in small atomic commits, each buildable. Revert is easy per-commit.

**[Risk] Subtle import path breakage in consumers** → Mitigation: This is a single-package monorepo with no external consumers of internal subpath exports (only the MCP/HTTP transports). All imports are internal and verifiable by `tsc`.

**[Risk] Port interfaces add indirection** → Trade-off accepted: Slight indirection cost enables testability and clean architecture. The interfaces are simple (read/write functions), not enterprise patterns.

**[Risk] mode-embedded breakage** → Mitigation: Check if mode-embedded has real consumers before removing. If it's used by the OpenCode skill or other integrations, keep it as a thin composition helper over `core`.

**[Trade-off] Single `core` package is large** → Accepted: Better an honest large module than three dishonestly small ones with cycles. Internal file organization (commands/, queries/, ports/) provides structure.
