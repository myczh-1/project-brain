export interface Commit {
  hash: string;
  time: string;
  author: string;
  message: string;
  tag: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'other';
  files_changed: string[];
}

export interface HotPath {
  path: string;
  change_count: number;
}

export interface GitPort {
  isGitRepo(cwd?: string): boolean;
  getRepoRoot(cwd?: string): string;
  gitExec(args: string[], cwd?: string): string;
  parseLog(limit: number, cwd?: string): Commit[];
  parseLogSinceDays(days: number, cwd?: string): Commit[];
  calculateHotPaths(commits: Commit[]): HotPath[];
}
