## ADDED Requirements

### Requirement: Single core package replaces application, context, and runtime
The packages `application`, `context`, and `runtime` SHALL be merged into a single `core` package. The `core` package SHALL own all use cases (commands), queries (context, dashboard, analysis), the runtime message dispatcher, and domain error types.

#### Scenario: Old package directories are removed
- **WHEN** the restructure is complete
- **THEN** `packages/application/`, `packages/context/`, and `packages/runtime/` SHALL NOT exist

#### Scenario: Core package builds cleanly
- **WHEN** running `tsc --noEmit`
- **THEN** the `core` package SHALL produce zero type errors

### Requirement: Core has clean internal file organization
The `core` package SHALL organize its source files into clear subdirectories: `commands/` (use cases), `queries/` (context, dashboard, analysis), `runtime/` (message dispatch), `ports/` (storage/git interfaces), and `errors/` (domain error types).

#### Scenario: File structure matches domain boundaries
- **WHEN** listing `packages/core/src/` subdirectories
- **THEN** the directories SHALL include `commands/`, `queries/`, `runtime/`, and `ports/`

### Requirement: No circular dependencies within core
The `core` package SHALL have no circular import chains between its internal modules. Commands SHALL NOT import from runtime. Runtime SHALL import from commands. Queries MAY import from ports but SHALL NOT import from runtime.

#### Scenario: Import graph is acyclic
- **WHEN** analyzing the import graph of all `.ts` files under `packages/core/src/`
- **THEN** no circular dependency cycles SHALL exist

### Requirement: Core owns the service interface
The `RuntimeService` interface and `ContextService` interface SHALL be defined within `core`, not in separate packages. Transport layers SHALL import these interfaces from `core`.

#### Scenario: Transport packages import service from core
- **WHEN** `transport-mcp` or `transport-http` creates a runtime/context service
- **THEN** the import SHALL come from `@myczh/project-brain/core` or a `core` subpath
