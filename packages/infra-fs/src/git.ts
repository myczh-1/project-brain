import type { GitPort } from '../../core/src/ports/git.js';
import { isGitRepo, getRepoRoot, gitExec } from './git/gitExec.js';
import { parseLog, parseLogSinceDays } from './git/parseLog.js';
import { calculateHotPaths } from './git/hotPaths.js';

export function createFsGit(): GitPort {
  return {
    isGitRepo,
    getRepoRoot,
    gitExec,
    parseLog,
    parseLogSinceDays,
    calculateHotPaths,
  };
}
