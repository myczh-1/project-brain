import { calculateHotPaths, type HotPath } from '../../../core-protocol/src/git/hotPaths.js';
import { parseLog, type Commit } from '../../../core-protocol/src/git/parseLog.js';
import { estimateProgressOverview, type Completion, type Momentum, type StalenessRisk } from '../../../core-protocol/src/understanding/estimateProgress.js';
import { inferFocus, inferMilestoneSignals } from '../../../core-protocol/src/understanding/inferFocus.js';
import { recommendNextActions } from '../../../core-protocol/src/understanding/recommendActions.js';
import { readDecisions } from '../../../core-protocol/src/storage/decisions.js';
import { buildFallbackManifest, readManifest } from '../../../core-protocol/src/storage/manifest.js';
import { readMilestones, upsertInferredMilestones, type Milestone } from '../../../core-protocol/src/storage/milestones.js';
import { type NextAction } from '../../../core-protocol/src/storage/nextActions.js';
import { readProgress } from '../../../core-protocol/src/storage/progress.js';

export interface BrainAnalyzeInput {
  repo_path?: string;
  depth?: 'quick' | 'full';
  recent_commits?: number;
}

export interface BrainAnalyzeOutput {
  summary: string;
  project_name: string;
  goals: string[];
  current_focus: {
    area: string;
    confidence: string;
  };
  progress: {
    overall_completion: Completion;
    momentum: Momentum;
    staleness_risk: StalenessRisk;
    milestones?: Milestone[];
  };
  recent_activity: {
    commits: Commit[];
    hot_paths: HotPath[];
    activity_summary: string;
  };
  suggested_actions: NextAction[];
  confidence: string;
}

export async function brainAnalyze(input: BrainAnalyzeInput): Promise<BrainAnalyzeOutput> {
  const cwd = input.repo_path || process.cwd();
  const depth = input.depth || 'full';
  const recentCommitsCount = input.recent_commits || 50;

  const manifest = readManifest(cwd) || buildFallbackManifest(cwd);
  const commits = parseLog(recentCommitsCount, cwd);
  const hotPaths = calculateHotPaths(commits);
  const focus = inferFocus(commits, hotPaths);
  const milestoneSignals = inferMilestoneSignals(commits, hotPaths);

  let milestones = readMilestones(cwd);
  if (milestoneSignals.length > 0) {
    milestones = upsertInferredMilestones(milestoneSignals, cwd);
  }

  const progressOverview = estimateProgressOverview(milestones, commits);
  const progress = readProgress(cwd);
  const decisions = readDecisions(cwd);
  const recommendations = recommendNextActions(milestones, commits, hotPaths, progress, decisions);

  const tagCounts = new Map<string, number>();
  for (const commit of commits) {
    tagCounts.set(commit.tag, (tagCounts.get(commit.tag) || 0) + 1);
  }
  const tagSummary = Array.from(tagCounts.entries())
    .map(([tag, count]) => `${count} ${tag}`)
    .join(', ');

  return {
    summary: [
      `Project: ${manifest.project_name}`,
      `Progress: ${progressOverview.overall_completion} (${progressOverview.momentum})`,
      `Focus: ${focus?.focus || 'Unknown'}`,
      `Momentum: ${progressOverview.momentum}`,
      `Top priority: ${recommendations.next_actions[0]?.title || 'No actions suggested'}`,
    ].join(' | '),
    project_name: manifest.project_name,
    goals: manifest.long_term_goal ? [manifest.long_term_goal] : [],
    current_focus: {
      area: focus?.focus || 'Unknown',
      confidence: focus?.confidence || 'low',
    },
    progress: {
      overall_completion: progressOverview.overall_completion,
      momentum: progressOverview.momentum,
      staleness_risk: progressOverview.staleness_risk,
      milestones: depth === 'full' ? milestones : undefined,
    },
    recent_activity: {
      commits: depth === 'quick' ? commits.slice(0, 5) : commits.slice(0, 10),
      hot_paths: hotPaths.slice(0, 5),
      activity_summary: `${commits.length} commits: ${tagSummary}`,
    },
    suggested_actions: recommendations.next_actions.slice(0, 5),
    confidence: progressOverview.overall_completion,
  };
}
