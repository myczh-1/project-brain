## ADDED Requirements

### Requirement: ProjectContextOutput eliminates type duplication
`ProjectContextOutput` MUST define the shared fields once. The `structured` field MUST be typed as `Omit<ProjectContextOutput, 'context_text' | 'structured'>` instead of duplicating ~50 lines of type definitions.

#### Scenario: Type compilation
- **WHEN** the project compiles with `tsc --noEmit`
- **THEN** `ProjectContextOutput` MUST have zero duplicated field definitions
- **THEN** all consumers of `structured` MUST still have full type information

### Requirement: buildDashboard uses focused helper functions
`buildDashboard` MUST extract its three mutually exclusive branches (full dashboard, change-only, project-only) into separate named functions. The main function MUST dispatch to the appropriate helper based on input.

#### Scenario: Dashboard with no specific focus
- **WHEN** `buildDashboard` is called without a change_id filter
- **THEN** the full dashboard helper MUST be called
- **THEN** the response MUST include all sections (project, changes, decisions, progress)

#### Scenario: Dashboard with change_id
- **WHEN** `buildDashboard` is called with a specific `change_id`
- **THEN** the change-focused helper MUST be called
- **THEN** the response MUST focus on that change's context
