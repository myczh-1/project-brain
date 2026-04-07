import * as fs from 'fs';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupTempRepoRoot, createTempDir, createTempRepoRoot } from '../test/testRepo.js';
import { GitExecError, getRepoRoot, gitExec, isGitRepo } from './gitExec.js';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    if (fs.existsSync(root)) {
      cleanupTempRepoRoot(root);
    }
  }
});

describe('gitExec', () => {
  it('returns command output for a git repository', () => {
    const repoRoot = createTempRepoRoot('project-brain-gitexec-');
    roots.push(repoRoot);

    expect(getRepoRoot(repoRoot)).toBe(repoRoot);
  });

  it('reports a non-git directory as false', () => {
    const root = createTempDir('project-brain-gitexec-nongit-');
    roots.push(root);

    expect(isGitRepo(root)).toBe(false);
  });

  it('preserves unexpected execution failures instead of flattening them into false', () => {
    const missingDir = `${createTempDir('project-brain-gitexec-missing-')}-gone`;
    roots.push(missingDir);

    expect(() => isGitRepo(missingDir)).toThrow(GitExecError);
  });

  it('includes the git subcommand in thrown errors', () => {
    const root = createTempDir('project-brain-gitexec-badcmd-');
    roots.push(root);

    expect(() => gitExec(['definitely-not-a-command'], root)).toThrow(/Git command failed \(definitely-not-a-command\)/);
  });
});
