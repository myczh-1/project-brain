import type { GitPort } from '../ports/git.js';
import type { StoragePort } from '../ports/storage.js';
import { changeContext, type ChangeContextInput, type ChangeContextOutput } from './context/getChangeContext.js';
import { contextBudgetPlan, type ContextBudgetPlanInput, type ContextBudgetPlanOutput } from './context/getContextBudgetPlan.js';
import { projectContext, type ProjectContextInput, type ProjectContextOutput } from './context/getProjectContext.js';

export interface ContextService {
  getProjectContext(input: ProjectContextInput): Promise<ProjectContextOutput>;
  getChangeContext(input: ChangeContextInput): Promise<ChangeContextOutput>;
  getContextBudgetPlan(input: ContextBudgetPlanInput): Promise<ContextBudgetPlanOutput>;
}

export function createContextService(storage: StoragePort, git: GitPort): ContextService {
  return {
    getProjectContext: (input) => projectContext(input, storage, git),
    getChangeContext: (input) => changeContext(input, storage, git),
    getContextBudgetPlan: (input) => contextBudgetPlan(input, storage, git),
  };
}
