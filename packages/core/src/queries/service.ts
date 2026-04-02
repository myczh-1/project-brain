import type { GitPort } from '../ports/git.js';
import type { StoragePort } from '../ports/storage.js';
import { brainAnalyze, type BrainAnalyzeInput, type BrainAnalyzeOutput } from './analysis/brainAnalyze.js';
import { finishWork, type FinishWorkInput, type FinishWorkOutput } from './analysis/finishWork.js';
import { projectRecentActivity, type RecentActivityInput, type RecentActivityOutput } from './analysis/recentActivity.js';
import { suggestNextActionsTool, type SuggestNextActionsInput, type SuggestNextActionsOutput } from './analysis/suggestNextActions.js';
import { changeContext, type ChangeContextInput, type ChangeContextOutput } from './context/getChangeContext.js';
import { projectContext, type ProjectContextInput, type ProjectContextOutput } from './context/getProjectContext.js';
import { brainDashboard, type DashboardToolInput, type DashboardToolOutput } from './dashboard/getDashboard.js';

export interface ContextService {
  getDashboard(input: DashboardToolInput): Promise<DashboardToolOutput>;
  getProjectContext(input: ProjectContextInput): Promise<ProjectContextOutput>;
  getChangeContext(input: ChangeContextInput): Promise<ChangeContextOutput>;
  getRecentActivity(input: RecentActivityInput): Promise<RecentActivityOutput>;
  suggestNextActions(input: SuggestNextActionsInput): Promise<SuggestNextActionsOutput>;
  analyze(input: BrainAnalyzeInput): Promise<BrainAnalyzeOutput>;
  finishWork(input: FinishWorkInput): Promise<FinishWorkOutput>;
}

export function createContextService(storage: StoragePort, git: GitPort): ContextService {
  return {
    getDashboard: (input) => brainDashboard(input, storage, git),
    getProjectContext: (input) => projectContext(input, storage, git),
    getChangeContext: (input) => changeContext(input, storage, git),
    getRecentActivity: (input) => projectRecentActivity(input, git),
    suggestNextActions: (input) => suggestNextActionsTool(input, storage, git),
    analyze: (input) => brainAnalyze(input, storage, git),
    finishWork: (input) => finishWork(input, storage, git),
  };
}
