# Project Brain

Project memory and execution context engine for AI coding agents.

Project Brain is an MCP server that helps agents understand a repository through layered memory:

- `manifest`: project identity anchor
- `project-spec`: stable governance rules
- `change-spec`: single-change contract
- `decisions`: rationale log
- `notes`: raw observations
- `progress / milestones`: execution facts
- `git / hot paths`: code evidence

It is designed to answer two different questions:

- "What kind of project is this?"
- "What should an agent know before executing this change?"

## Positioning

Project Brain is not just another spec workflow tool.

- OpenSpec focuses on defining structured changes
- Project Brain focuses on combining project memory, historical decisions, and code evidence into agent-ready context

Project Brain can also consume OpenSpec change inputs from `openspec/changes/` as a read-only source when generating change context.

## Quick Start

Run the MCP server:

```bash
npx -y @myczh/project-brain
```

If you see:

```text
Project Brain MCP server running on stdio
```

the server started successfully.

## Add to MCP Client

### OpenCode

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "project-brain": {
      "type": "local",
      "command": ["npx", "-y", "@myczh/project-brain"],
      "enabled": true
    }
  }
}
```

### Claude Desktop

Update `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "@myczh/project-brain"]
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "project-brain": {
      "command": "npx",
      "args": ["-y", "@myczh/project-brain"]
    }
  }
}
```

## Memory Layout

Project Brain stores data in `.project-brain/`:

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

### Layer responsibilities

- `manifest.json`: project identity only
- `project-spec.json`: stable rules that stay valid across multiple changes
- `changes/<id>.json`: the contract for one change
- `decisions.ndjson`: concrete decisions and rationale
- `notes.ndjson`: temporary or raw observations
- `progress.ndjson`: execution facts, blockers, current status
- `milestones.json`: milestone state used for broader analysis

## Available Tools

### Identity and governance

- `brain_init`: initialize or update the project identity anchor
- `brain_define_project_spec`: define stable project rules

### Change execution

- `brain_create_change`: create a change-spec
- `brain_update_change`: update an existing change-spec
- `brain_change_context`: generate execution-ready context for a specific change

### Memory capture

- `brain_log_decision`: record a concrete decision with rationale
- `brain_capture_note`: capture a raw note or observation
- `brain_record_progress`: record progress facts or milestone state

### Analysis

- `brain_context`: get project-level context
- `brain_recent_activity`: inspect recent commits and hot paths
- `brain_analyze`: run deeper analysis with progress estimation and action suggestions
- `brain_estimate_progress`: estimate milestone progress
- `brain_suggest_actions`: generate prioritized next actions

## Example Flow

1. Initialize the project identity with `brain_init`
2. Define stable rules with `brain_define_project_spec`
3. Create a change with `brain_create_change`
4. Log important choices with `brain_log_decision`
5. Track implementation facts with `brain_record_progress`
6. Ask `brain_change_context` for the full execution context before coding

## OpenSpec Compatibility

Project Brain does not depend on OpenSpec, but it can read change intent from:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>.md`

Compatibility is read-only in this version. Project Brain keeps its own memory layers for identity, stable rules, decisions, and progress.

## Local Development

```bash
git clone https://github.com/myczh-1/project-brain-mcp
cd project-brain-mcp
pnpm install
pnpm build
pnpm dev
```

## License

MIT
