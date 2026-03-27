import { execFileSync } from 'child_process';

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
    throw new Error(`Git command failed: ${message}`);
  }
}

export function getRepoRoot(cwd?: string): string {
  return gitExec(['rev-parse', '--show-toplevel'], cwd);
}

export function isGitRepo(cwd?: string): boolean {
  try {
    gitExec(['rev-parse', '--git-dir'], cwd);
    return true;
  } catch {
    return false;
  }
}
