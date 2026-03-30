import * as fs from 'fs';
import * as path from 'path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanupTempRepoRoot, createTempRepoRoot } from '../test/testRepo.js';

const repoRoots: string[] = [];

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('fs');
  vi.restoreAllMocks();

  for (const repoRoot of repoRoots.splice(0)) {
    cleanupTempRepoRoot(repoRoot);
  }
});

describe('atomicWriteFile', () => {
  it('replaces the target file contents on success', async () => {
    const repoRoot = createTempRepoRoot('project-brain-fileops-');
    repoRoots.push(repoRoot);
    const { atomicWriteFile } = await import('./fileOps.js');

    const targetPath = path.join(repoRoot, '.project-brain', 'manifest.json');
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, 'old-value', 'utf-8');

    atomicWriteFile(targetPath, 'new-value');

    expect(fs.readFileSync(targetPath, 'utf-8')).toBe('new-value');
    expect(fs.readdirSync(path.dirname(targetPath))).toEqual(['manifest.json']);
  });

  it('removes the temporary file and preserves the original file when rename fails', async () => {
    const repoRoot = createTempRepoRoot('project-brain-fileops-');
    repoRoots.push(repoRoot);

    const targetPath = path.join(repoRoot, '.project-brain', 'manifest.json');
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, 'stable-value', 'utf-8');

    vi.doMock('fs', async () => {
      const actual = await vi.importActual<typeof import('fs')>('fs');
      return {
        ...actual,
        renameSync: vi.fn(() => {
          throw new Error('rename failed');
        }),
      };
    });
    const { atomicWriteFile } = await import('./fileOps.js');

    expect(() => atomicWriteFile(targetPath, 'new-value')).toThrow('rename failed');
    expect(fs.readFileSync(targetPath, 'utf-8')).toBe('stable-value');
    expect(fs.readdirSync(path.dirname(targetPath))).toEqual(['manifest.json']);
  });
});
