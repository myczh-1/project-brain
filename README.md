# Project Brain

Durable project memory for AI-assisted development.

## Overview

Project Brain stores structured engineering memory in `.project-brain/` and exposes a file-protocol-first workflow for agents.

## Quick Start

```bash
npx -y @myczh/project-brain setup
```

Then follow `protocol/` definitions and let your agent read/write `.project-brain/` records directly.

## CLI

- `project-brain setup`
- `project-brain doctor`
- `project-brain init`
- `project-brain help`

## Packages

- `core`: domain commands/queries/runtime.
- `protocol`: schema and type contract.
- `infra-fs`: filesystem-backed storage and git adapters.
- `mode-embedded`: embedded runtime helper for in-process usage.
- `app`: CLI entrypoint for file-protocol workflow.

## Data Model

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
