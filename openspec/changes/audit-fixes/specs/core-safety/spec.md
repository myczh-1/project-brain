## ADDED Requirements

### Requirement: repo_path is required in core layer
All core commands and queries SHALL accept `repo_path` as a required `string` parameter (not optional). Core functions MUST NOT reference `process.cwd()` or any other environment-dependent fallback.

#### Scenario: Core function called without repo_path
- **WHEN** a core function is called with a missing or undefined `repo_path`
- **THEN** TypeScript compilation MUST fail due to type mismatch (string vs undefined)

#### Scenario: Transport layer supplies default
- **WHEN** an MCP tool or HTTP handler receives a request without `repo_path`
- **THEN** the transport layer MUST supply `process.cwd()` before calling the core function

#### Scenario: Grep verification
- **WHEN** all changes are complete
- **THEN** `grep -r "process.cwd()" packages/core/src/` MUST return zero matches

### Requirement: ID length validation at creation
`createChange` MUST validate that the generated change ID does not exceed 80 characters. If the sanitized title produces an ID exceeding this limit, the function MUST throw an error with a descriptive message.

#### Scenario: Title produces oversized ID
- **WHEN** `createChange` is called with a title that sanitizes to more than 80 characters (before the timestamp suffix)
- **THEN** the function MUST throw an error: "Change ID exceeds maximum length of 80 characters"

### Requirement: Single-sanitization for change IDs
`getChangePath` MUST NOT call `sanitizeChangeId` on the provided ID. IDs are sanitized once at creation time and stored as-is. Lookup functions MUST use the ID verbatim.

#### Scenario: ID with already-sanitized format
- **WHEN** `getChangePath` is called with an already-sanitized ID like `my-change-abc123`
- **THEN** the function MUST use the ID directly without re-sanitizing
