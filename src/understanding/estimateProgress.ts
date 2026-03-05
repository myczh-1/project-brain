import { Commit } from '../git/parseLog.js';
import { HotPath } from '../git/hotPaths.js';
import { Milestone } from '../storage/milestones.js';

export interface ContributingSignal {
  signal_type: string;
  weight: number;
  value: number;
  description: string;
}

export interface ProgressEstimation {
  milestone_name: string;
  percentage: number;
  confidence: 'low' | 'mid' | 'high';
  explanation: string;
  contributing_signals: ContributingSignal[];
}

/**
 * Estimate progress for a single milestone based on commit activity and hot paths
 */
export function estimateMilestoneProgress(
  milestone: Milestone,
  commits: Commit[],
  hotPaths: HotPath[]
): ProgressEstimation {
  const signals: ContributingSignal[] = [];
  
  // Base percentage from status
  let basePercentage = 0;
  if (milestone.status === 'not_started') {
    basePercentage = 0;
  } else if (milestone.status === 'in_progress') {
    basePercentage = 30; // Base for in-progress
  } else if (milestone.status === 'completed') {
    return {
      milestone_name: milestone.name,
      percentage: 100,
      confidence: 'high',
      explanation: 'Milestone marked as completed',
      contributing_signals: [{
        signal_type: 'status',
        weight: 1.0,
        value: 100,
        description: 'Status: completed'
      }]
    };
  }

  // Signal 1: Commit activity analysis (40% weight)
  const commitSignal = analyzeCommitActivity(milestone, commits);
  signals.push(commitSignal);

  // Signal 2: Hot path matching (30% weight)
  const hotPathSignal = analyzeHotPathMatch(milestone, hotPaths);
  signals.push(hotPathSignal);

  // Signal 3: Time-based activity (30% weight)
  const timeSignal = analyzeTimeActivity(milestone, commits);
  signals.push(timeSignal);

  // Calculate weighted percentage
  const weightedPercentage = signals.reduce((sum, signal) => {
    return sum + (signal.value * signal.weight);
  }, 0);

  const finalPercentage = Math.min(95, Math.max(basePercentage, weightedPercentage));

  // Determine confidence based on signal consistency
  const confidence = determineConfidence(signals, commits);

  // Generate explanation
  const explanation = generateExplanation(finalPercentage, signals, confidence);

  return {
    milestone_name: milestone.name,
    percentage: Math.round(finalPercentage),
    confidence,
    explanation,
    contributing_signals: signals
  };
}

/**
 * Analyze commit activity related to milestone
 */
function analyzeCommitActivity(milestone: Milestone, commits: Commit[]): ContributingSignal {
  const keywords = extractKeywords(milestone.name);
  const recentCommits = commits.slice(0, 20); // Last 20 commits
  
  let matchCount = 0;
  for (const commit of recentCommits) {
    const message = commit.message.toLowerCase();
    if (keywords.some(kw => message.includes(kw))) {
      matchCount++;
    }
  }

  const matchRatio = recentCommits.length > 0 ? matchCount / recentCommits.length : 0;
  const value = Math.min(100, matchRatio * 200); // Scale up

  return {
    signal_type: 'commit_activity',
    weight: 0.4,
    value,
    description: `${matchCount} of ${recentCommits.length} recent commits match milestone keywords`
  };
}

/**
 * Analyze hot path matching
 */
function analyzeHotPathMatch(milestone: Milestone, hotPaths: HotPath[]): ContributingSignal {
  if (hotPaths.length === 0) {
    return {
      signal_type: 'hot_path_match',
      weight: 0.3,
      value: 0,
      description: 'No hot paths detected'
    };
  }

  const keywords = extractKeywords(milestone.name);
  const topHotPaths = hotPaths.slice(0, 3);
  
  let matchScore = 0;
  let matchedPaths: string[] = [];

  for (const hotPath of topHotPaths) {
    const pathLower = hotPath.path.toLowerCase();
    if (keywords.some(kw => pathLower.includes(kw))) {
      matchScore += hotPath.change_count;
      matchedPaths.push(hotPath.path);
    }
  }

  const totalChanges = topHotPaths.reduce((sum, hp) => sum + hp.change_count, 0);
  const value = totalChanges > 0 ? (matchScore / totalChanges) * 100 : 0;

  return {
    signal_type: 'hot_path_match',
    weight: 0.3,
    value,
    description: matchedPaths.length > 0 
      ? `Hot paths match: ${matchedPaths.join(', ')}`
      : 'No hot path matches milestone scope'
  };
}

/**
 * Analyze time-based activity
 */
function analyzeTimeActivity(milestone: Milestone, commits: Commit[]): ContributingSignal {
  if (commits.length === 0) {
    return {
      signal_type: 'time_activity',
      weight: 0.3,
      value: 0,
      description: 'No recent commits'
    };
  }

  const keywords = extractKeywords(milestone.name);
  const now = new Date();
  
  // Find most recent matching commit
  let mostRecentMatch: Date | null = null;
  let recentMatchCount = 0;

  for (const commit of commits) {
    const message = commit.message.toLowerCase();
    if (keywords.some(kw => message.includes(kw))) {
      const commitDate = new Date(commit.time);
      if (!mostRecentMatch || commitDate > mostRecentMatch) {
        mostRecentMatch = commitDate;
      }
      
      // Count commits in last 7 days
      const daysSince = (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) {
        recentMatchCount++;
      }
    }
  }

  if (!mostRecentMatch) {
    return {
      signal_type: 'time_activity',
      weight: 0.3,
      value: 0,
      description: 'No matching commits found'
    };
  }

  const daysSinceLastActivity = (now.getTime() - mostRecentMatch.getTime()) / (1000 * 60 * 60 * 24);
  
  // Decay function: 100% if today, 50% if 7 days ago, 0% if 30+ days ago
  let value = 0;
  if (daysSinceLastActivity <= 1) {
    value = 100;
  } else if (daysSinceLastActivity <= 7) {
    value = 100 - ((daysSinceLastActivity - 1) / 6) * 50;
  } else if (daysSinceLastActivity <= 30) {
    value = 50 - ((daysSinceLastActivity - 7) / 23) * 50;
  }

  return {
    signal_type: 'time_activity',
    weight: 0.3,
    value,
    description: `${recentMatchCount} related commits in last 7 days, most recent ${Math.round(daysSinceLastActivity)} days ago`
  };
}

/**
 * Extract keywords from milestone name
 */
function extractKeywords(milestoneName: string): string[] {
  const name = milestoneName.toLowerCase();
  const words = name.split(/\s+/);
  
  // Filter out common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  const keywords = words.filter(w => !stopWords.includes(w) && w.length > 2);
  
  return keywords;
}

/**
 * Determine confidence level based on signal consistency
 */
function determineConfidence(signals: ContributingSignal[], commits: Commit[]): 'low' | 'mid' | 'high' {
  if (commits.length < 5) {
    return 'low'; // Not enough data
  }

  // Check signal variance
  const values = signals.map(s => s.value);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // High consistency = high confidence
  if (stdDev < 20) {
    return 'high';
  } else if (stdDev < 40) {
    return 'mid';
  } else {
    return 'low';
  }
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(percentage: number, signals: ContributingSignal[], confidence: string): string {
  const parts: string[] = [];
  
  for (const signal of signals) {
    const contribution = Math.round(signal.value * signal.weight);
    parts.push(`${signal.description} (${signal.weight * 100}% weight → ${contribution}%)`);
  }

  return `${percentage}% complete because:\n- ${parts.join('\n- ')}\nConfidence: ${confidence}`;
}

/**
 * Estimate progress for all milestones
 */
export function estimateAllMilestones(
  milestones: Milestone[],
  commits: Commit[],
  hotPaths: HotPath[]
): ProgressEstimation[] {
  return milestones.map(milestone => 
    estimateMilestoneProgress(milestone, commits, hotPaths)
  );
}
