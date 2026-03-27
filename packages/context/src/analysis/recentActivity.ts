import { calculateHotPaths } from '../../../core-protocol/src/git/hotPaths.js';
import { parseLog, parseLogSinceDays, type Commit } from '../../../core-protocol/src/git/parseLog.js';
import type { HotPath } from '../../../core-protocol/src/git/hotPaths.js';

export interface RecentActivityInput {
  limit?: number;
  since_days?: number;
  repo_path?: string;
}

export interface RecentActivityOutput {
  commits: Commit[];
  hot_paths: HotPath[];
  summary: string;
}

export async function projectRecentActivity(input: RecentActivityInput): Promise<RecentActivityOutput> {
  const cwd = input.repo_path || process.cwd();
  const commits = input.since_days ? parseLogSinceDays(input.since_days, cwd) : parseLog(input.limit || 50, cwd);
  const hotPaths = calculateHotPaths(commits);

  const tagCounts = new Map<string, number>();
  for (const commit of commits) {
    tagCounts.set(commit.tag, (tagCounts.get(commit.tag) || 0) + 1);
  }

  const tagSummary = Array.from(tagCounts.entries())
    .map(([tag, count]) => `${count} ${tag}`)
    .join(', ');

  return {
    commits,
    hot_paths: hotPaths,
    summary: `${commits.length} commits: ${tagSummary}`,
  };
}
