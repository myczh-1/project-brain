## ADDED Requirements

### Requirement: MCP server version read from package.json
The MCP server MUST read its version from the nearest `package.json` file instead of hardcoding a version string. The version MUST always match the published npm package version.

#### Scenario: Version after npm publish
- **WHEN** the package is published as version X.Y.Z
- **THEN** the MCP server MUST report version X.Y.Z in its capability negotiation

### Requirement: Legacy decisions.json auto-migration
When `readDecisions` is called and `decisions.json` exists but `decisions.ndjson` does not, the storage layer MUST:
1. Read all decisions from `decisions.json`
2. Write them to `decisions.ndjson` in NDJSON format
3. Rename `decisions.json` to `decisions.json.bak`

#### Scenario: First read with legacy format
- **WHEN** `.project-brain/decisions.json` exists and `.project-brain/decisions.ndjson` does not
- **THEN** decisions MUST be readable via the standard `readDecisions` function
- **THEN** `decisions.ndjson` MUST be created
- **THEN** `decisions.json` MUST be renamed to `decisions.json.bak`

#### Scenario: Both formats exist
- **WHEN** both `decisions.json` and `decisions.ndjson` exist
- **THEN** `decisions.ndjson` MUST be used (no migration needed)
- **THEN** `decisions.json` MUST be left untouched

### Requirement: Configurable milestone patterns
The understanding layer's milestone inference MUST accept an optional patterns configuration instead of using only hardcoded patterns. Default patterns SHALL be provided for backward compatibility, but consumers MUST be able to override them.

#### Scenario: Default behavior unchanged
- **WHEN** milestone inference is called without custom patterns
- **THEN** the existing hardcoded patterns MUST be used as defaults

#### Scenario: Custom patterns provided
- **WHEN** milestone inference is called with custom patterns
- **THEN** only the custom patterns MUST be used for inference
