import * as fs from 'fs';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupTempRepoRoot, createTempRepoRoot } from '../test/testRepo.js';
import { buildFallbackManifest, getManifestPath, readManifest, writeManifest } from './manifest.js';

const repoRoots: string[] = [];

afterEach(() => {
  for (const repoRoot of repoRoots.splice(0)) {
    cleanupTempRepoRoot(repoRoot);
  }
});

describe('manifest storage', () => {
  it('builds a fallback manifest from the repo root name', () => {
    const repoRoot = createTempRepoRoot('project-brain-manifest-');
    repoRoots.push(repoRoot);

    const manifest = buildFallbackManifest(repoRoot);

    expect(manifest.project_name).toBe(path.basename(repoRoot));
    expect(manifest.summary).toBe('Project identity has not been explicitly initialized yet.');
    expect(manifest.repo_type).toBe('application');
    expect(manifest.primary_stack).toEqual([]);
  });

  it('reads legacy manifest fields into the current shape', () => {
    const repoRoot = createTempRepoRoot('project-brain-manifest-');
    repoRoots.push(repoRoot);

    const manifestPath = getManifestPath(repoRoot);
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        project_name: 'Legacy Brain',
        one_liner: 'Legacy summary',
        tech_stack: ['TypeScript', 'Node.js'],
        goals: ['Ship stable MCP', 'Preserve context'],
        created_at: '2026-03-01T00:00:00.000Z',
      }),
      'utf-8'
    );

    expect(readManifest(repoRoot)).toEqual({
      project_name: 'Legacy Brain',
      summary: 'Legacy summary',
      repo_type: 'application',
      primary_stack: ['TypeScript', 'Node.js'],
      long_term_goal: 'Ship stable MCP; Preserve context',
      locale: undefined,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    });
  });

  it('writes the manifest into the project brain directory', () => {
    const repoRoot = createTempRepoRoot('project-brain-manifest-');
    repoRoots.push(repoRoot);

    const manifest = {
      project_name: 'Project Brain',
      summary: 'Memory engine',
      repo_type: 'application',
      primary_stack: ['TypeScript'],
      long_term_goal: 'Reduce agent amnesia',
      locale: 'en-US',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-02T00:00:00.000Z',
    };

    const manifestPath = writeManifest(manifest, repoRoot);

    expect(manifestPath).toBe(path.join(repoRoot, '.project-brain', 'manifest.json'));
    expect(readManifest(repoRoot)).toEqual(manifest);
  });
});
