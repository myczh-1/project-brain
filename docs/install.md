# Install Project Brain With Your AI Assistant

Use your coding assistant as the installer.

Give it this repository, point it at this file, and follow the steps exactly.
Do not introduce alternative flows or make decisions outside this document.

## What The Assistant Must Do

1. Ask for the target AI tool.
- Ask the user: `Which AI tool should be configured? (Codex / Claude / OpenCode)`.
- Do not proceed until the user answers.

2. Ask whether to initialize this repository.
- Ask the user: `Do you want to initialize Project Brain in the current repository?`
- Record the answer as `INIT = yes` or `INIT = no`.
- Persist this value and reuse it in later steps.
- Do not infer or assume.

3. Ensure Project Brain is installed globally.
- Check whether `project-brain` is already available.

```bash
which project-brain
```

- If not found, install globally.

```bash
npm install -g @myczh/project-brain
```

- If installation fails due to permission issues, retry with appropriate privileges if permitted by the environment.
- If installation still fails, report failure clearly and stop.
- Do not install locally.
- Do not use `--save-dev`.
- Do not skip installation verification.

4. Use the standard runtime entrypoint.
- The only allowed runtime command is:

```bash
project-brain stdio
```

- Do not resolve alternative paths.
- Do not use `./node_modules/.bin/...`.
- Do not use `npx` for runtime.
- Do not substitute any wrapper command.

5. Configure the selected AI tool.
- Configure the chosen AI tool to use:

```bash
project-brain stdio
```

- Use the tool's persistent configuration mechanism.
- Inspect the selected tool's official configuration format before editing.
- Do not invent configuration formats.
- Do not guess configuration formats.
- Match the exact format required by the selected tool.
- If the tool does not support automatic config editing, output the exact config snippet and explain exactly where to place it.
- If automatic editing is not possible, clearly state that installation is incomplete.

6. Initialize the repository only if `INIT = yes`.
- Run:

```bash
npx -y @myczh/project-brain init
```

- Do not manually create `.project-brain/`.
- Do not manually edit `AGENTS.md`.
- Only use the official CLI.
- If `INIT = no`, do not run initialization and do not create initialization files manually.

7. Verify installation.
- Check that the AI tool config points to `project-brain stdio`.
- Check that the command is executable.

```bash
project-brain --help
```

- If `INIT = yes`, verify `.project-brain/` exists.
- If `INIT = yes`, verify `AGENTS.md` exists.
- Do not create or modify these files manually during verification.
- Do not start interactive stdio sessions.
- Do not run `project-brain stdio` directly for testing.
- Do not claim success without verification.

8. Report results.
- Output which AI tool was configured.
- Output whether global installation succeeded.
- Output the configured command (`project-brain stdio`).
- Output whether initialization was executed.
- Output which files were created or reused.
- If anything failed, clearly state installation is incomplete and provide manual steps.
- Do not describe unverified steps as completed.

9. Post-install instruction (always show).
- Tell the user they can manually initialize or update Project Brain later with:

```bash
npx -y @myczh/project-brain init
```

- Tell the user not to edit `.project-brain/` files manually.

## Important Rules

- Do not introduce alternative installation strategies.
- Do not choose between global and local installation.
- Do not skip global installation.
- Do not use `npx` as a runtime.
- Do not resolve binary paths dynamically.
- Do not manually create or modify `.project-brain/`.
- Do not overwrite user-authored `AGENTS.md`.
- Do not remove existing OpenSpec structures.
- Do not assume tool capabilities; verify or fallback.
- Do not edit any configuration file when the required format is uncertain.

## Fallback

If automatic configuration is not possible:

- Print the exact configuration snippet.
- Explain where it should be placed.
- Clearly state that installation is not complete.
- Do not attempt partial or speculative edits.
- Do not edit config files when uncertain.
