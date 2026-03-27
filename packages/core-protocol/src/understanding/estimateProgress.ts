import type { Commit } from '../git/parseLog.js';
import type { Milestone } from '../storage/milestones.js';

export type Completion = 'low' | 'mid' | 'high';
export type StalenessRisk = 'low' | 'mid' | 'high';
export type Momentum = 'active' | 'slowing' | 'stalled';

export interface ProgressOverview {
  overall_completion: Completion;
  staleness_risk: StalenessRisk;
  momentum: Momentum;
}

export function aggregateCompletion(milestones: Milestone[]): Completion {
  const withCompletion = milestones.filter(m => m.completion);
  if (withCompletion.length === 0) return 'low';
  const scores: Record<Completion, number> = { low: 1, mid: 2, high: 3 };
  const total = withCompletion.reduce((sum, m) => sum + scores[m.completion!], 0);
  const avg = total / withCompletion.length;
  if (avg >= 2.5) return 'high';
  if (avg >= 1.5) return 'mid';
  return 'low';
}

export function computeStalenessRisk(commits: Commit[]): StalenessRisk {
  if (commits.length === 0) return 'high';
  const latestAt = new Date(commits[0].time);
  const daysSince = (Date.now() - latestAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 3) return 'low';
  if (daysSince <= 14) return 'mid';
  return 'high';
}

export function computeMomentum(commits: Commit[]): Momentum {
  if (commits.length === 0) return 'stalled';
  const now = Date.now();
  const recentWindow = 7 * 24 * 60 * 60 * 1000;
  const recentCount = commits.filter(c => now - new Date(c.time).getTime() < recentWindow).length;
  if (recentCount >= 5) return 'active';
  if (recentCount >= 1) return 'slowing';
  return 'stalled';
}

export function estimateProgressOverview(milestones: Milestone[], commits: Commit[]): ProgressOverview {
  return {
    overall_completion: aggregateCompletion(milestones),
    staleness_risk: computeStalenessRisk(commits),
    momentum: computeMomentum(commits),
  };
}
