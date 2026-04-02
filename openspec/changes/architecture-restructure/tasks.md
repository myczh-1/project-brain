## 1. Pure Protocol Layer

- [x] 1.1 Move `protocol/src/runtime.ts` content (RuntimeMessage types that import from application) into `core` — protocol keeps only pure type re-exports
- [x] 1.2 Audit all `protocol/src/*.ts` files for imports from `@myczh/project-brain/*` and remove them
- [x] 1.3 Verify `protocol` compiles independently with zero internal cross-references

## 2. Define Port Interfaces in Core

- [x] 2.1 Create `packages/core/src/ports/storage.ts` with `StoragePort` interface (readManifest, writeManifest, readProjectSpec, writeProjectSpec, readChange, writeChange, readAllChanges, appendDecision, appendNote, appendProgress, readDecisions, readNotes, readProgress, readMilestones, writeMilestones, ensureBrainDir, brainDirExists)
- [x] 2.2 Create `packages/core/src/ports/git.ts` with `GitPort` interface (isGitRepo, getRepoRoot, getGitLog, getRecentActivity)
- [x] 2.3 Create `packages/core/src/ports/index.ts` barrel export

## 3. Create Unified Core Package

- [x] 3.1 Create `packages/core/src/commands/` directory and copy all command files from `packages/application/src/commands/`
- [x] 3.2 Create `packages/core/src/queries/` directory and copy context/dashboard/analysis files from `packages/context/src/`
- [x] 3.3 Create `packages/core/src/runtime/` directory and copy runtime dispatcher + service from `packages/runtime/src/`
- [x] 3.4 Update all internal imports within `core` to use relative paths (no `@myczh/project-brain/*` self-references)
- [x] 3.5 Refactor commands to accept `StoragePort` + `GitPort` via parameter injection instead of direct imports from `core-protocol/storage`
- [x] 3.6 Refactor queries to accept `StoragePort` + `GitPort` via parameter injection instead of direct imports
- [x] 3.7 Update `RuntimeService` and `ContextService` interfaces to live in `core`
- [x] 3.8 Create `packages/core/src/index.ts` barrel export with all public types and factory functions
- [x] 3.9 Verify `core` builds with zero circular dependencies (no cross-imports between commands/ and runtime/)

## 4. Create infra-fs Package

- [x] 4.1 Create `packages/infra-fs/src/storage.ts` implementing `StoragePort` using code from `core-protocol/src/storage/`
- [x] 4.2 Create `packages/infra-fs/src/git.ts` implementing `GitPort` using code from `core-protocol/src/git/`
- [x] 4.3 Create `packages/infra-fs/src/index.ts` barrel export
- [x] 4.4 Verify `infra-fs` imports from `core` are limited to port interface types only

## 5. Update Transport Layers

- [x] 5.1 Update `transport-mcp/src/server.ts` to import from `@myczh/project-brain/core` instead of `@myczh/project-brain/application`
- [x] 5.2 Update `transport-http/src/server.ts` to import from `@myczh/project-brain/core` instead of `application`/`context`
- [x] 5.3 Verify both transports build cleanly with the new import paths

## 6. Update Composition Root

- [x] 6.1 Update `packages/app/src/serverMain.ts` to wire `core` + `infra-fs` + transports
- [x] 6.2 Move CLI entry point from `mode-service` to `app`
- [x] 6.3 Update `mode-embedded` to import from `core` + `infra-fs` instead of old packages
- [x] 6.4 Delete `packages/mode-service/`

## 7. Clean Up Package Exports

- [x] 7.1 Update `package.json` exports to: `.` (core), `./protocol`, `./core`, `./infra-fs`, `./transport-http`, `./transport-mcp`, `./app`
- [x] 7.2 Remove stale exports: `./application`, `./application/commands`, `./core-protocol`, `./core-protocol/*`, `./mode-embedded`, `./mode-service`, `./runtime`, `./context`, `./protocol/runtime`
- [x] 7.3 Update `tsconfig.json` path aliases to match new package structure
- [x] 7.4 Update `package.json` `bin` field to point to `app` CLI entry

## 8. Delete Old Packages

- [x] 8.1 Delete `packages/application/`
- [x] 8.2 Delete `packages/context/`
- [x] 8.3 Delete `packages/runtime/`
- [x] 8.4 Delete `packages/core-protocol/` (all content moved to `core` ports or `infra-fs`)
- [x] 8.5 Delete stale `packages/core/` (leftover re-export files from Phase 1)

## 9. Final Verification

- [x] 9.1 Run `tsc --noEmit` — zero errors
- [x] 9.2 Run `npm run build` — clean output
- [x] 9.3 Run `npm test` — all existing tests pass (or update test imports)
- [x] 9.4 Verify no circular dependencies: scan `core` imports for cycles
- [x] 9.5 Verify protocol purity: scan `protocol` for zero internal imports
- [x] 9.6 Verify fs isolation: scan all packages except `infra-fs` for zero direct `fs.*` / `execSync('git` calls
- [x] 9.7 Smoke test: start server, verify MCP tools and HTTP endpoints respond correctly
