# Getting Started with Project Brain

This guide provides step-by-step instructions for installing, configuring, and using Project Brain in your development environment.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js 18 or higher
- A git repository where you intend to use Project Brain

## Installation

Start with the setup flow:

```bash
npx -y @myczh/project-brain setup
```

This command initializes `.project-brain/` and prints the recommended file-based workflow.

If you prefer to install a reusable command, you can also run:

```bash
npm install -g @myczh/project-brain
project-brain setup
```

## Using Your AI Assistant

Project Brain now works as a file-based protocol. Your AI assistant should:

1. Read `protocol/` to understand the data contract.
2. Read the current `.project-brain/` state before making changes.
3. Write structured JSON or NDJSON records directly into `.project-brain/`.

If you already use OpenSpec, pair it with Project Brain in the same repository and let the assistant use OpenSpec for planning while Project Brain records durable execution state.

## First Use — Initialize Project

Once initialized, your AI assistant can interact with Project Brain by reading and updating `.project-brain/` directly.

1. **Initialize Project**: Run `project-brain init` or `project-brain setup`.
2. **Check Context**: Read `.project-brain/manifest.json`, `project-spec.json`, and recent NDJSON records.

## Daily Workflow

Follow this pattern to maintain a durable project memory:

1. **Before Work**: Call `brain_context` to hydrate the assistant with current goals and recent progress.
2. **Start Meaningful Work**: Call `brain_start_work` when beginning a new feature or fix.
3. **During Work**:
   - Call `brain_checkpoint` to record milestones.
   - Call `brain_log_decision` when making architectural or implementation choices.
   - Call `brain_capture_note` for observations or follow-up items.
4. **End of Work**: Call `brain_finish_work` to summarize the changes and update the project state.

## Understanding Your Data

Project Brain stores all data in a `.project-brain/` directory at your repository root:

- `manifest.json`: Project identity (name, summary, repo type, stack).
- `project-spec.json`: Stable project truth and rules.
- `changes/<id>.json`: Structured records for individual implementation tasks.
- `decisions.ndjson`: Append-only log of engineering decisions.
- `notes.ndjson`: Captured fragments and observations.
- `progress.ndjson`: Timeline of execution updates and blockers.
- `milestones.json`: Broad phase and milestone tracking.

You can inspect these files directly in the repository.

## Troubleshooting

- **Missing `.project-brain/`**: Run `project-brain setup`.
- **Assistant writes invalid data**: Point it back to `protocol/` and ensure it reads before writing.
- **Concurrent updates**: Re-read the current JSON snapshot files before replacing them.

## Next Steps

- Review the [OpenSpec Integration Guide](./guide-openspec-integration.md) to learn how to use Project Brain with specification-driven development.
