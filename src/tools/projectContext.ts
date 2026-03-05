import { readManifest, Manifest } from '../storage/manifest.js';
import { readNotes, Note } from '../storage/notes.js';
import { parseLog, Commit } from '../git/parseLog.js';
import { calculateHotPaths } from '../git/hotPaths.js';
import { inferFocus, inferMilestoneSignals, MilestoneSignal } from '../understanding/inferFocus.js';
import { generateContextText, ContextData } from '../understanding/contextTemplate.js';
import { readProgress } from '../storage/progress.js';
import { readDecisions } from '../storage/decisions.js';
import { readMilestones } from '../storage/milestones.js';
import { estimateAllMilestones, ProgressEstimation } from '../understanding/estimateProgress.js';
import { NextAction } from '../storage/nextActions.js';
import { recommendNextActions } from '../understanding/recommendActions.js';

export interface ProjectContextInput {
  depth?: 'short' | 'normal';
  include_recent_activity?: boolean;
  recent_commits?: number;
  repo_path?: string;
}

export interface ProjectContextOutput {
  context_text: string;
  structured: {
    manifest: Manifest | null;
    recent_commits: Commit[];
    notes: Note[];
    focus: string;
    confidence: string;
    milestone_progress?: ProgressEstimation[];
    next_actions?: NextAction[];
  };
}

export async function projectContext(input: ProjectContextInput): Promise<ProjectContextOutput> {
  const cwd = input.repo_path || process.cwd();
  const depth = input.depth || 'normal';
  const includeActivity = input.include_recent_activity !== false;
  const recentCommitsCount = input.recent_commits || 30;

  const manifest = readManifest(cwd);
  const notes = readNotes(cwd);
  
  let recentCommits: Commit[] = [];
  let focus = null;
  let milestoneSignals: MilestoneSignal[] = [];
  let milestoneProgress: ProgressEstimation[] = [];
  let nextActions: NextAction[] = [];

  if (includeActivity) {
    recentCommits = parseLog(recentCommitsCount, cwd);
    const hotPaths = calculateHotPaths(recentCommits, cwd);
    focus = inferFocus(recentCommits, hotPaths);
    milestoneSignals = inferMilestoneSignals(recentCommits, hotPaths);
    
    // Estimate milestone progress
    const milestones = readMilestones(cwd);
    if (milestones.length > 0) {
      milestoneProgress = estimateAllMilestones(milestones, recentCommits, hotPaths);
    }
    
    // Generate next action recommendations
    const progress = readProgress(cwd);
    const decisions = readDecisions(cwd);
    const recommendations = recommendNextActions(
      milestones,
      recentCommits,
      hotPaths,
      progress,
      decisions,
      milestoneProgress
    );
    nextActions = recommendations.next_actions;
  }

  const progress = readProgress(cwd);
  const decisions = readDecisions(cwd);
  const milestones = readMilestones(cwd);

  const contextData: ContextData = {
    manifest,
    recentCommits: depth === 'short' ? recentCommits.slice(0, 5) : recentCommits,
    notes,
    focus,
    milestoneSignals,
    progress,
    decisions,
    milestones,
    milestoneProgress,
    nextActions,
  };

  const contextText = generateContextText(contextData);

  return {
    context_text: contextText,
    structured: {
      manifest,
      recent_commits: contextData.recentCommits,
      notes,
      focus: focus?.focus || '',
      confidence: focus?.confidence || '',
      milestone_progress: milestoneProgress,
      next_actions: nextActions,
    },
  };
}
