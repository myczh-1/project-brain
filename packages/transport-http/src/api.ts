import {
  createContextService,
  createRuntimeService,
  type ChangeContextInput,
  type ProjectContextInput,
} from '@myczh/project-brain/core';
import { createFsStorage, createFsGit } from '@myczh/project-brain/infra-fs';
import { brainDashboard, type DashboardToolInput } from '../../core/src/queries/dashboard/getDashboard.js';

export interface HttpApiHandlers {
  initializeProject(
    input: Parameters<ReturnType<typeof createRuntimeService>['initializeProject']>[0]
  ): ReturnType<ReturnType<typeof createRuntimeService>['initializeProject']>;
  getDashboard(input: DashboardToolInput): ReturnType<typeof brainDashboard>;
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
  const storage = createFsStorage();
  const git = createFsGit();
  const runtime = createRuntimeService(storage);
  const context = createContextService(storage, git);
  return {
    initializeProject: runtime.initializeProject,
    getDashboard: (input) => brainDashboard(input, storage, git),
    getProjectContext: context.getProjectContext,
    getChangeContext: context.getChangeContext,
    ingestMemory: runtime.ingestMemory,
    updateProjectSpec: runtime.defineProjectSpec,
  };
}
