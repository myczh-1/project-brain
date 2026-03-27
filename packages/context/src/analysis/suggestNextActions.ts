import { calculateHotPaths } from '../../../core-protocol/src/git/hotPaths.js';
import { parseLog } from '../../../core-protocol/src/git/parseLog.js';
import { inferMilestoneSignals } from '../../../core-protocol/src/understanding/inferFocus.js';
import { recommendNextActions, type ActionRecommendation } from '../../../core-protocol/src/understanding/recommendActions.js';
import { readDecisions } from '../../../core-protocol/src/storage/decisions.js';
import { readMilestones, upsertInferredMilestones } from '../../../core-protocol/src/storage/milestones.js';
import { readProgress } from '../../../core-protocol/src/storage/progress.js';

export interface SuggestNextActionsInput {
  limit?: number;
  filter_by_milestone?: string;
  repo_path?: string;
  recent_commits?: number;
}

export interface SuggestNextActionsOutput {
  next_actions: ActionRecommendation['next_actions'];
  reasoning_summary: string;
}

export async function suggestNextActionsTool(input: SuggestNextActionsInput): Promise<SuggestNextActionsOutput> {
  const cwd = input.repo_path || process.cwd();
  const limit = input.limit || 5;
  const recentCommitsCount = input.recent_commits || 50;

  let milestones = readMilestones(cwd);
  const progress = readProgress(cwd);
  const decisions = readDecisions(cwd);
  const commits = parseLog(recentCommitsCount, cwd);
  const hotPaths = calculateHotPaths(commits);
  const inferredSignals = inferMilestoneSignals(commits, hotPaths);

  if (inferredSignals.length > 0) {
    milestones = upsertInferredMilestones(inferredSignals, cwd);
  }

  const recommendations = recommendNextActions(milestones, commits, hotPaths, progress, decisions);
  const filteredActions = input.filter_by_milestone
    ? recommendations.next_actions.filter(action => action.related_milestone === input.filter_by_milestone)
    : recommendations.next_actions;

  return {
    next_actions: filteredActions.slice(0, limit),
    reasoning_summary: recommendations.reasoning_summary,
  };
}
