## Why

The current codebase has 9 internal pseudo-packages (`application`, `context`, `core-protocol`, `runtime`, `protocol`, `mode-embedded`, `mode-service`, `transport-http`, `transport-mcp`) that form a single published npm package. These pseudo-packages have circular dependencies (application↔runtime↔context, protocol→application), the protocol layer is impure (imports application code), and there are no storage/git port abstractions — making the core untestable without a real filesystem. The package boundaries don't reflect real module boundaries, creating cognitive overhead and fragile import chains.

## What Changes

- **BREAKING** Collapse 9 internal packages into 4-5 real modules with clean dependency direction: `protocol` → `core` → `infra-fs` → `transport-*` → `app`
- Merge `application`, `context`, and `runtime` into a single `core` package that owns all use cases, queries, analysis, domain errors, and service port interfaces
- Make `protocol` truly pure — zero imports from any other internal package
- Extract storage/git filesystem operations into `infra-fs`, implementing port interfaces defined in `core`
- Remove `mode-service` (pass-through with no added value)
- Fold `mode-embedded` into `core` or keep as thin composition helper
- Trim `package.json` subpath exports from ~9 to match actual module boundaries
- Break all circular dependency chains

## Capabilities

### New Capabilities
- `pure-protocol`: Protocol layer with zero internal dependencies — pure type definitions, schemas, and contract surface
- `unified-core`: Single core module merging application + context + runtime — owns all use cases, queries, analysis, ports, and domain errors
- `storage-ports`: Port/adapter pattern for storage and git operations — core defines interfaces, infra-fs implements them
- `clean-composition`: Minimal composition root (app) and trimmed public API surface

### Modified Capabilities

## Impact

- **All internal packages** reorganized: `application/`, `context/`, `runtime/` merged into `core/`; `core-protocol/` storage/git extracted to `infra-fs/`
- **package.json exports** reduced from ~9 subpaths to 4-5 matching real modules
- **Import paths** throughout codebase will change (internal restructure, public API preserved)
- **Transport layers** (`transport-http`, `transport-mcp`) updated to import from `core` instead of `application`/`context`
- **No external API changes** — MCP tool schemas, HTTP endpoints, and CLI interface remain identical
- **Test infrastructure** — storage/git can be mocked via port interfaces, enabling unit tests without filesystem
