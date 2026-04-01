import {
  createContextService,
  createRuntimeService,
  type ChangeContextInput,
  type DashboardToolInput,
  type ProjectContextInput,
} from '@myczh/project-brain/application';

export interface HttpApiHandlers {
  initializeProject(
    input: Parameters<ReturnType<typeof createRuntimeService>['initializeProject']>[0]
  ): ReturnType<ReturnType<typeof createRuntimeService>['initializeProject']>;
  getDashboard(input: DashboardToolInput): ReturnType<ReturnType<typeof createContextService>['getDashboard']>;
  getProjectContext(input: ProjectContextInput): ReturnType<ReturnType<typeof createContextService>['getProjectContext']>;
  getChangeContext(input: ChangeContextInput): ReturnType<ReturnType<typeof createContextService>['getChangeContext']>;
  ingestMemory(
    input: Parameters<ReturnType<typeof createRuntimeService>['ingestMemory']>[0]
  ): ReturnType<ReturnType<typeof createRuntimeService>['ingestMemory']>;
  updateProjectSpec(
    input: Parameters<ReturnType<typeof createRuntimeService>['defineProjectSpec']>[0]
  ): ReturnType<ReturnType<typeof createRuntimeService>['defineProjectSpec']>;
}

export function createHttpApiHandlers(): HttpApiHandlers {
  const runtime = createRuntimeService();
  const context = createContextService();
  return {
    initializeProject: runtime.initializeProject,
    getDashboard: context.getDashboard,
    getProjectContext: context.getProjectContext,
    getChangeContext: context.getChangeContext,
    ingestMemory: runtime.ingestMemory,
    updateProjectSpec: runtime.defineProjectSpec,
  };
}
