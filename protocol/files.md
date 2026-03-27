# File Layout

Project Brain stores durable state in a `.project-brain/` directory rooted at the repository boundary.

Canonical layout:

```text
.project-brain/
  manifest.json
  project-spec.json
  changes/
    <change-id>.json
  decisions.ndjson
  notes.ndjson
  progress.ndjson
  milestones.json
```

## Principles

- Every file is portable plain JSON or NDJSON.
- Tools may create only the files they need.
- Missing files are valid; Project Brain is designed to tolerate partial state.
- Producers should preserve file names and top-level record shapes exactly as documented here.

## File Roles

- `manifest.json`
  - Optional identity anchor.
  - Stores project name, summary, repo type, stack, and long-term goal.
- `project-spec.json`
  - Stable project truth.
  - Stores product goal, non-goals, architecture rules, coding rules, and agent rules.
- `changes/<change-id>.json`
  - One structured change contract per file.
  - Change IDs are filesystem-safe lowercase identifiers.
- `decisions.ndjson`
  - Append-only decision log.
  - One JSON object per line.
- `notes.ndjson`
  - Append-only raw note log.
  - One JSON object per line.
- `progress.ndjson`
  - Append-only progress log.
  - One JSON object per line.
- `milestones.json`
  - Snapshot-style milestone state.
  - Stored as a JSON array.

## Required vs Optional State

Protocol v0 does not require any single file to exist before the rest can be written.

- `manifest.json` is optional.
- `project-spec.json` is optional.
- `changes/` may be absent.
- NDJSON logs may be absent or empty.
- `milestones.json` may be absent.

This means a lightweight producer can start from any of these:

- only `project-spec.json`
- only `changes/<id>.json`
- only `notes.ndjson`
- only `progress.ndjson`

## Path and Encoding Rules

- All files use UTF-8.
- JSON files should be pretty-printed with 2-space indentation.
- NDJSON files use one compact JSON object per line.
- Lines should end with `\n`.
- Paths are repository-relative beneath `.project-brain/`.

## Change ID Rules

The current implementation normalizes change IDs with these expectations:

- lowercase preferred
- non-alphanumeric characters replaced with `-`
- no leading or trailing `-`
- suitable for `<change-id>.json`

Writers may generate their own stable IDs, but should keep them filesystem-safe.

## Extensions

Derived artifacts are not part of the minimal interoperable state contract.

Examples:

- inferred milestone updates
- `next_actions.ndjson`

Implementations may expose those as optional extensions, but lightweight producers only need to write the canonical source records listed above.
