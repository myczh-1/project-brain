## ADDED Requirements

### Requirement: app is the sole composition root
The `app` package SHALL be the only place where `core`, `infra-fs`, and transport packages are wired together. No other package SHALL perform service composition or dependency wiring.

#### Scenario: app creates and injects port implementations
- **WHEN** the application starts
- **THEN** `app` SHALL create `StoragePort` and `GitPort` implementations from `infra-fs` and inject them into `core` services

### Requirement: mode-service is removed
The `mode-service` package SHALL be deleted. Its functionality (pass-through composition) SHALL be absorbed by `app`.

#### Scenario: mode-service directory does not exist
- **WHEN** the restructure is complete
- **THEN** `packages/mode-service/` SHALL NOT exist

#### Scenario: CLI entry point moves to app
- **WHEN** checking `package.json` `bin` field
- **THEN** the CLI entry point SHALL reference `app`, not `mode-service`

### Requirement: Trimmed package.json exports
The `package.json` `exports` field SHALL contain at most 6 subpath entries matching real module boundaries: root (`.`), `./protocol`, `./core`, `./infra-fs`, `./transport-http`, `./transport-mcp`.

#### Scenario: No stale subpath exports
- **WHEN** reading `package.json` exports
- **THEN** there SHALL be no entries for `./application`, `./application/commands`, `./core-protocol`, `./core-protocol/git`, `./core-protocol/storage`, `./core-protocol/understanding`, `./mode-embedded`, `./mode-service`, `./runtime`, `./context`, or `./protocol/runtime`

### Requirement: mode-embedded remains functional or is folded
If `mode-embedded` has external consumers, it SHALL remain as a thin composition helper that imports from `core` and `infra-fs`. If it has no external consumers, it MAY be folded into `core` or `app`.

#### Scenario: mode-embedded works after restructure
- **WHEN** `mode-embedded` is kept
- **THEN** it SHALL import from `core` (not from `application`, `context`, or `runtime`) and SHALL produce zero type errors
