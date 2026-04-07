# Install With AI

Project Brain is designed to be installed by your coding assistant, not by hand-editing a long list of config files.

Recommended flow:

1. Open your AI coding tool in this repository.
2. Ask it to follow this document.
3. Let it inspect the local environment, propose the right configuration changes, and apply them with your approval.

Suggested prompt:

```text
Please install Project Brain in this repository by following docs/install-with-ai.md.
Detect whether this environment is Codex, Claude, or OpenCode, configure Project Brain through `project-brain stdio`, and update the appropriate project-level or global prompt/config files.
Prefer project-level configuration when possible. Explain each file you plan to modify before editing it.
```

## What The Assistant Should Do

1. Inspect the current repository.
   - Confirm the repository root.
   - Check whether `.project-brain/` already exists.
   - Check whether `protocol/` exists.
   - Check whether OpenSpec is present.

2. Initialize Project Brain if needed.
   - If `.project-brain/manifest.json` is missing, run:

   ```bash
   npx -y @myczh/project-brain setup
   ```

   - If the repository is already initialized, do not overwrite existing memory.

3. Detect the AI tool being configured.
   - Codex
   - Claude
   - OpenCode

4. Prefer project-level integration.
   - If the tool supports project-level prompt or tool config, use that first.
   - Only use global configuration when project-level configuration is unavailable or the user explicitly asks for it.

5. Configure Project Brain through `stdio`.
   - The runtime entrypoint is:

   ```bash
   project-brain stdio
   ```

   - The assistant should wire this command into the target tool's local tool/MCP/agent configuration in the format expected by that tool.

6. Add or update the prompt/instructions.
   - The assistant should add a short Project Brain integration prompt to the target tool's configuration.
   - Recommended prompt text:

   ```text
   Use Project Brain as the durable memory layer for this repository.
   When you need project memory or task context, call the Project Brain stdio tools.
   When updating `.project-brain/`, follow the `protocol/` contract.
   Prefer module-scoped retrieval before broad historical search.
   ```

7. Explain the changes made.
   - Show which files were updated.
   - Summarize whether the integration was project-level or global.
   - Confirm that `project-brain stdio` is the configured runtime entrypoint.

## Important Rules

- Do not invent undocumented `.project-brain/` fields.
- Do not overwrite existing Project Brain records unless a real update is intended.
- Treat `.project-brain/` as repository-root state even if the current working directory is nested.
- Preserve any existing OpenSpec workflow in the repository.
- If the target tool has multiple valid config locations, explain the options and prefer the project-local one.

## Minimal Verification

After installation, the assistant should verify:

1. The repository has a valid `.project-brain/` directory.
2. The target AI tool config points to `project-brain stdio`.
3. The prompt/instructions mention Project Brain and `protocol/`.
4. A simple stdio request succeeds, for example:

```bash
printf '%s\n' '{"id":"smoke-1","message":{"type":"get_state","repo_path":"'"$(pwd)"'"}}' | project-brain stdio
```

## Fallback

If the assistant cannot safely edit the target tool's config automatically:

- it should print the exact config snippet needed,
- explain where that snippet should be placed,
- and avoid making speculative edits.
