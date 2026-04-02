## ADDED Requirements

### Requirement: Protocol has zero internal dependencies
The `protocol` package SHALL import nothing from any other internal package (`core`, `infra-fs`, `transport-*`, `app`). It SHALL only import from Node.js built-ins and external dependencies (e.g., `zod`).

#### Scenario: Protocol compiles independently
- **WHEN** all other internal packages are removed from the filesystem
- **THEN** `tsc` on the `protocol` package alone SHALL produce zero errors

#### Scenario: No cross-package imports in protocol source
- **WHEN** scanning all `.ts` files under `packages/protocol/src/`
- **THEN** zero import statements SHALL reference `@myczh/project-brain/*` subpaths

### Requirement: Protocol exports only types and schemas
The `protocol` package SHALL export TypeScript type definitions, Zod schemas, and file format contracts. It SHALL NOT export any runtime functions that perform I/O, state mutation, or side effects.

#### Scenario: Protocol exports are type-safe contracts
- **WHEN** inspecting the `protocol` package's public API
- **THEN** all exports SHALL be either TypeScript `type`/`interface` declarations or Zod schema objects

### Requirement: Runtime message types live in protocol
The runtime message discriminated union types (`RuntimeMessage`, `RuntimeCommand`, `RuntimeQuery`, etc.) SHALL be defined in `protocol`, not in `core` or `runtime`.

#### Scenario: Transport layers import message types from protocol
- **WHEN** transport packages need to reference message type definitions
- **THEN** they SHALL import from `@myczh/project-brain/protocol`, not from `core`
