# Project Brain

Durable project memory for AI-assisted development.

## What It Does

- Provides a durable project memory mechanism for AI-assisted development loops.
- Stores project context, changes, decisions, and progress in the `.project-brain/` directory.
- Uses a lightweight file-based workflow where AI tools read and write `.project-brain/` directly.

## Quick Start

Recommended installation path: ask your AI assistant to follow [docs/install-with-ai.md](./docs/install-with-ai.md).

For detailed workflow instructions, see [docs/guide-openspec-integration.md](./docs/guide-openspec-integration.md). In brief, the AI assistant reads the definitions in `protocol/` and writes structured data to `.project-brain/` directly.

1. Bootstrap the repository:
   ```bash
   npx -y @myczh/project-brain setup
   ```
2. Ask your AI assistant to follow `docs/install-with-ai.md`.
3. Let the assistant wire your tool to `project-brain stdio` and update the appropriate prompt/config files.

## CLI Commands

- `project-brain setup`: Initialize `.project-brain/` and print file-based workflow guidance.
- `project-brain doctor`: Check whether the repository is ready for the file-based workflow.
- `project-brain init`: Create the minimal `.project-brain/` setup for the current repository.
- `project-brain stdio`: Run the Project Brain tool surface over newline-delimited JSON on stdin/stdout.

## Core Data Model

Project Brain manages structured state within the `.project-brain/` directory:

- `manifest.json`: Optional project identity (name, summary, stack).
- `project-spec.json`: Stable project truth and architectural rules.
- `changes/`: Directory containing structured records for individual changes.
- `decisions.ndjson`: Rationale for project and implementation decisions.
- `notes.ndjson`: Raw observations and unresolved fragments.
- `progress.ndjson`: Execution updates, blockers, and status.
- `milestones.json`: Broad phase and milestone tracking.

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

## Core Operations

Project Brain's main operations are exposed as library functions for tools or hosts that want to build on top of the file-based protocol:

- Read and inspect: `brain_context`, `brain_dashboard`, `brain_change_context`, `brain_recent_activity`, `brain_analyze`, `brain_suggest_actions`
- Write and record: `brain_create_change`, `brain_start_work`, `brain_checkpoint`, `brain_finish_work`, `brain_update_change`, `brain_log_decision`, `brain_record_progress`, `brain_capture_note`, `brain_ingest_memory`
- Initialize: `brain_init`

## Integration Guides

- [Install With AI](./docs/install-with-ai.md)
- [Getting Started](./docs/guide-getting-started.md)
- [OpenSpec Integration](./docs/guide-openspec-integration.md)

## Architecture

Project Brain follows a layered architecture:

- **protocol**: Pure type definitions and schemas.
- **core**: Domain logic, commands, queries, and ports.
- **infra-fs**: Filesystem implementation of storage and git ports.
- **mode-embedded**: File-based integration helpers for repository-local workflows.
- **app**: Bootstrap CLI and stdio entry point.

## Development

```bash
npm install
npm run build
npm test
npm run test:watch
```

## License

MIT

---

[中文文档](./README.zh-CN.md)
