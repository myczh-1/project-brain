import { readMilestones } from '../storage/milestones.js';
import { parseLog } from '../git/parseLog.js';
import { calculateHotPaths } from '../git/hotPaths.js';
import { estimateAllMilestones, estimateMilestoneProgress, ProgressEstimation } from '../understanding/estimateProgress.js';

export interface EstimateMilestoneProgressInput {
  milestone_name?: string;  // Optional: estimate specific milestone
  repo_path?: string;
  recent_commits?: number;  // Number of commits to analyze (default: 50)
}

export interface EstimateMilestoneProgressOutput {
  estimations: ProgressEstimation[];
}

export async function estimateMilestoneProgressTool(
  input: EstimateMilestoneProgressInput
): Promise<EstimateMilestoneProgressOutput> {
  const cwd = input.repo_path || process.cwd();
  const recentCommitsCount = input.recent_commits || 50;

  // Load data
  const milestones = readMilestones(cwd);
  const commits = parseLog(recentCommitsCount, cwd);
  const hotPaths = calculateHotPaths(commits, cwd);

  // Filter milestones if specific name provided
  let targetMilestones = milestones;
  if (input.milestone_name) {
    targetMilestones = milestones.filter(m => m.name === input.milestone_name);
    
    if (targetMilestones.length === 0) {
      throw new Error(`Milestone not found: ${input.milestone_name}`);
    }
  }

  // Estimate progress
  const estimations = estimateAllMilestones(targetMilestones, commits, hotPaths);

  return {
    estimations
  };
}
