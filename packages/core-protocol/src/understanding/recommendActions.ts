import type { HotPath } from '../git/hotPaths.js';
import type { Commit } from '../git/parseLog.js';
import type { Decision } from '../storage/decisions.js';
import type { Milestone } from '../storage/milestones.js';
import type { NextAction } from '../storage/nextActions.js';
import type { ProgressEntry } from '../storage/progress.js';

export interface ActionRecommendation {
  next_actions: NextAction[];
  reasoning_summary: string;
}

export function recommendNextActions(
  milestones: Milestone[],
  commits: Commit[],
  hotPaths: HotPath[],
  _progress: ProgressEntry[],
  decisions: Decision[]
): ActionRecommendation {
  const candidates: NextAction[] = [];
  for (const milestone of milestones) {
    if (milestone.status !== 'completed') {
      const action = generateMilestoneAction(milestone);
      if (action) candidates.push(action);
    }
  }
  candidates.push(...detectStalledMilestones(milestones, commits));
  candidates.push(...generateHotPathActions(hotPaths));
  candidates.push(...extractActionsFromDecisions(decisions));
  const sorted = candidates.map(action => ({ ...action, priority_score: calculateRICEScore(action) })).sort((a, b) => b.priority_score - a.priority_score);
  const topActions = sorted.slice(0, 5);
  return { next_actions: topActions, reasoning_summary: generateReasoningSummary(topActions, candidates.length) };
}

function generateMilestoneAction(milestone: Milestone): NextAction | null {
  let impact = milestone.status === 'in_progress' || milestone.completion === 'high' ? 3 : 2;
  let effort = 3;
  if (milestone.completion === 'high') effort = 2;
  else if (milestone.completion === 'low') effort = 4;
  const completionText = milestone.completion ? `Completion: ${milestone.completion}` : 'Completion: not set';
  return {
    id: `milestone-${milestone.name.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Complete: ${milestone.name}`,
    description: `Work on completing the ${milestone.name} milestone. ${completionText}.`,
    priority_score: 0,
    reasoning: `Milestone is ${milestone.status}. ${completionText}.`,
    impact,
    effort,
    confidence: milestone.confidence || 'mid',
    related_milestone: milestone.name,
    suggested_by: 'milestone_tracking',
    created_at: new Date().toISOString(),
  };
}

function detectStalledMilestones(milestones: Milestone[], commits: Commit[]): NextAction[] {
  const actions: NextAction[] = [];
  const now = new Date();
  for (const milestone of milestones) {
    if (milestone.status === 'completed') continue;
    const keywords = extractKeywords(milestone.name);
    let mostRecentMatch: Date | null = null;
    for (const commit of commits) {
      const message = commit.message.toLowerCase();
      if (keywords.some(kw => message.includes(kw))) {
        const commitDate = new Date(commit.time);
        if (!mostRecentMatch || commitDate > mostRecentMatch) mostRecentMatch = commitDate;
      }
    }
    if (mostRecentMatch) {
      const daysSince = (now.getTime() - mostRecentMatch.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7) {
        actions.push({
          id: `stalled-${milestone.name.toLowerCase().replace(/\s+/g, '-')}`,
          title: `Revive: ${milestone.name}`,
          description: `This milestone has had no activity for ${Math.round(daysSince)} days. Consider reviewing blockers or re-prioritizing.`,
          priority_score: 0,
          reasoning: `Stalled for ${Math.round(daysSince)} days. May be blocked or deprioritized.`,
          impact: 2,
          effort: 3,
          confidence: 'mid',
          related_milestone: milestone.name,
          suggested_by: 'stall_detection',
          created_at: new Date().toISOString(),
        });
      }
    }
  }
  return actions;
}

function generateHotPathActions(hotPaths: HotPath[]): NextAction[] {
  const actions: NextAction[] = [];
  const topHotPath = hotPaths[0];
  if (topHotPath && topHotPath.change_count >= 5) {
    actions.push({
      id: `hotpath-${topHotPath.path.replace(/\//g, '-')}`,
      title: `Continue work in ${topHotPath.path}`,
      description: `This area has ${topHotPath.change_count} recent changes. Consider completing related tasks or adding tests.`,
      priority_score: 0,
      reasoning: `High activity area (${topHotPath.change_count} changes). Momentum suggests continuing here.`,
      impact: 2,
      effort: 2,
      confidence: 'mid',
      suggested_by: 'hot_path_analysis',
      created_at: new Date().toISOString(),
    });
  }
  return actions;
}

function extractActionsFromDecisions(decisions: Decision[]): NextAction[] {
  const actions: NextAction[] = [];
  const actionKeywords = ['implement', 'add', 'create', 'build', 'refactor', 'fix', 'update'];
  for (const decision of decisions.slice(-5)) {
    const decisionLower = decision.decision.toLowerCase();
    if (actionKeywords.some(kw => decisionLower.includes(kw))) {
      actions.push({
        id: `decision-${decision.id}`,
        title: `Follow up: ${decision.decision}`,
        description: `Decision made: ${decision.decision}. Rationale: ${decision.rationale}`,
        priority_score: 0,
        reasoning: `Recent decision suggests this action. Made on ${decision.created_at.split('T')[0]}.`,
        impact: 2,
        effort: 3,
        confidence: 'mid',
        suggested_by: 'decision_analysis',
        created_at: new Date().toISOString(),
      });
    }
  }
  return actions;
}

function calculateRICEScore(action: NextAction): number {
  const confidenceMap = { high: 1.0, mid: 0.8, low: 0.5 };
  const confidenceValue = confidenceMap[action.confidence];
  return Math.round(((action.impact * confidenceValue) / action.effort) * 100);
}

function extractKeywords(text: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  return text.toLowerCase().split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 2);
}

function generateReasoningSummary(topActions: NextAction[], totalCandidates: number): string {
  if (topActions.length === 0) return 'No actionable recommendations at this time.';
  const signalList = Array.from(new Set(topActions.map(a => a.suggested_by))).join(', ');
  return `Generated ${totalCandidates} candidate actions from signals: ${signalList}. Top ${topActions.length} actions selected by RICE scoring (Impact × Confidence / Effort).`;
}
