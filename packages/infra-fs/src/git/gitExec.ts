import { execFileSync } from 'child_process';

export class GitExecError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'GitExecError';
  }
}

export function gitExec(args: string[], cwd?: string): string {
  try {
    const result = execFileSync('git', args, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new GitExecError(`Git command failed (${args.join(' ')}): ${message}`, error);
  }
}

export function getRepoRoot(cwd?: string): string {
  return gitExec(['rev-parse', '--show-toplevel'], cwd);
}

export function isGitRepo(cwd?: string): boolean {
  try {
    gitExec(['rev-parse', '--git-dir'], cwd);
    return true;
  } catch (error) {
    if (
      error instanceof GitExecError &&
      (error.message.includes('not a git repository') || error.message.includes('this operation must be run in a work tree'))
    ) {
      return false;
    }
    throw error;
  }
}
