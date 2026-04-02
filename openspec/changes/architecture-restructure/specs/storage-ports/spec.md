## ADDED Requirements

### Requirement: Storage port interface defined in core
The `core` package SHALL define a `StoragePort` interface (or set of interfaces) that abstracts all `.project-brain/` directory operations: reading/writing manifest, project-spec, changes, decisions, notes, progress, and milestones.

#### Scenario: Storage operations go through port interface
- **WHEN** a command in `core` needs to read or write brain data
- **THEN** it SHALL call a method on the `StoragePort` interface, not directly call filesystem functions

#### Scenario: StoragePort has no filesystem imports
- **WHEN** inspecting the `StoragePort` interface definition in `packages/core/src/ports/`
- **THEN** it SHALL contain zero imports from `fs`, `path`, or any filesystem module

### Requirement: Git port interface defined in core
The `core` package SHALL define a `GitPort` interface that abstracts git operations: checking if a path is a git repo, getting repo root, reading git log, and getting recent activity.

#### Scenario: Git operations go through port interface
- **WHEN** a query or command in `core` needs git information
- **THEN** it SHALL call a method on the `GitPort` interface, not directly call `execSync('git ...')`

### Requirement: infra-fs implements ports
The `infra-fs` package SHALL implement `StoragePort` and `GitPort` using real filesystem and git CLI operations. It SHALL import the port interfaces from `core` and export concrete implementations.

#### Scenario: infra-fs depends on core for types only
- **WHEN** scanning imports in `packages/infra-fs/src/`
- **THEN** imports from `core` SHALL be limited to port interface types, not command or query implementations

#### Scenario: infra-fs is the only package with direct fs/git calls
- **WHEN** scanning all packages except `infra-fs` for `fs.readFileSync`, `fs.writeFileSync`, `execSync('git`
- **THEN** zero matches SHALL be found (all filesystem/git operations are isolated in `infra-fs`)

### Requirement: Repo root resolution is a port operation
The `getRepoRootPath()` function SHALL be part of the `GitPort` interface. Commands and queries SHALL NOT call it directly from a storage module.

#### Scenario: Brain directory discovery uses ports
- **WHEN** any command resolves the `.project-brain/` directory location
- **THEN** it SHALL use `GitPort.getRepoRoot()` followed by path joining, not a direct `getRepoRootPath()` call
