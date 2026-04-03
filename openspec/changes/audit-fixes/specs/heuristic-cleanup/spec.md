## ADDED Requirements

### Requirement: logDecision returns warnings instead of throwing for weak signals
`logDecision` MUST NOT throw an error for inputs containing weak-signal keywords (todo, maybe, idea, etc.). Instead, it MUST return a `warnings` field in the response with an advisory message. The decision MUST still be recorded.

#### Scenario: Decision with "todo" in rationale
- **WHEN** `logDecision` is called with rationale containing "todo"
- **THEN** the decision MUST be recorded successfully
- **THEN** the response MUST include `warnings: ["Decision text contains weak signals..."]`

#### Scenario: Decision with no weak signals
- **WHEN** `logDecision` is called with clean input
- **THEN** the response MUST have no `warnings` field (or empty array)

### Requirement: looksLikeDecision stays in note handler only
The `looksLikeDecision` heuristic in `ingestMemory.ts` MUST remain within the `note` handler's `warnings` method only. It MUST NOT be exported or used in core domain logic. It serves as an advisory suggestion for the note intake path.

#### Scenario: Note ingested that looks like a decision
- **WHEN** a note is ingested with text containing "we decided"
- **THEN** the response MUST include a warning suggesting to use type="decision" instead
- **THEN** the note MUST still be recorded (not rejected)
