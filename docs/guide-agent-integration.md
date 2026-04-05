# Agent Integration

Use Project Brain as a file-protocol memory backend.

## Recommended system prompt line

"Use Project Brain as the durable memory layer for this repository. When updating `.project-brain/`, follow the `protocol/` contract."

## Operational loop

1. Read current `.project-brain/` state.
2. Plan with `protocol/` schema constraints.
3. Write new or updated records.
4. Re-read and validate consistency.
