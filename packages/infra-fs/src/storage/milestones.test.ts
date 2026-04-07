import * as fs from 'fs';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupTempRepoRoot, createTempRepoRoot } from '../test/testRepo.js';
import { getMilestonesPath, readMilestones, updateMilestone, writeMilestones } from './milestones.js';

const repoRoots: string[] = [];

afterEach(() => {
  for (const repoRoot of repoRoots.splice(0)) {
    cleanupTempRepoRoot(repoRoot);
  }
});

describe('milestones storage', () => {
  it('writes and reads milestones', () => {
    const repoRoot = createTempRepoRoot('project-brain-milestones-');
    repoRoots.push(repoRoot);

    writeMilestones(
      [
        {
          name: 'Ship storage hardening',
          status: 'in_progress',
          confidence: 'high',
        },
      ],
      repoRoot
    );

    expect(readMilestones(repoRoot)).toEqual([
      {
        name: 'Ship storage hardening',
        status: 'in_progress',
        confidence: 'high',
      },
    ]);
  });

  it('updates an existing milestone by name', () => {
    const repoRoot = createTempRepoRoot('project-brain-milestones-');
    repoRoots.push(repoRoot);

    writeMilestones(
      [
        {
          name: 'Ship storage hardening',
          status: 'not_started',
        },
      ],
      repoRoot
    );

    updateMilestone(
      {
        name: 'Ship storage hardening',
        status: 'completed',
        confidence: 'mid',
      },
      repoRoot
    );

    expect(readMilestones(repoRoot)).toEqual([
      {
        name: 'Ship storage hardening',
        status: 'completed',
        confidence: 'mid',
      },
    ]);
  });

  it('throws when milestones JSON is corrupt instead of pretending the file is empty', () => {
    const repoRoot = createTempRepoRoot('project-brain-milestones-');
    repoRoots.push(repoRoot);

    const milestonesPath = getMilestonesPath(repoRoot);
    fs.mkdirSync(path.dirname(milestonesPath), { recursive: true });
    fs.writeFileSync(milestonesPath, '{not-valid-json', 'utf-8');

    expect(() => readMilestones(repoRoot)).toThrow(/Invalid milestones JSON/);
  });
});
