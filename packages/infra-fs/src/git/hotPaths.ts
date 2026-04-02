import type { Commit } from './parseLog.js';

export interface HotPath {
  path: string;
  change_count: number;
}

function normalizePath(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 2) return filePath;
  return parts.slice(0, 2).join('/');
}

export function calculateHotPaths(commits: Commit[]): HotPath[] {
  const pathCounts = new Map<string, number>();
  for (const commit of commits) {
    for (const file of commit.files_changed) {
      const normalized = normalizePath(file);
      pathCounts.set(normalized, (pathCounts.get(normalized) || 0) + 1);
    }
  }

  return Array.from(pathCounts.entries())
    .map(([path, change_count]) => ({ path, change_count }))
    .sort((a, b) => b.change_count - a.change_count);
}
