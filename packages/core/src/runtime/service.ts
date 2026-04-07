import type { StoragePort, ChangeSpec, Decision, Manifest, Milestone, ModuleRecord, Note, ProgressEntry, ProjectSpec } from '../ports/storage.js';
import type { GitPort } from '../ports/git.js';
import {
  projectCaptureNote,
  checkpointWork,
  createChange,
  defineProjectSpec,
  ingestMemory,
  projectInit,
  logDecision,
  recordProgress,
  startWork,
  updateChange,
  type CaptureNoteInput,
  type CaptureNoteOutput,
  type CheckpointWorkInput,
  type CheckpointWorkOutput,
  type CreateChangeInput,
  type CreateChangeOutput,
  type DefineProjectSpecInput,
  type DefineProjectSpecOutput,
  type IngestMemoryInput,
  type IngestMemoryOutput,
  type LogDecisionInput,
  type LogDecisionOutput,
  type ProjectInitInput,
  type ProjectInitOutput,
  type RecordProgressInput,
  type RecordProgressOutput,
  type StartWorkInput,
  type StartWorkOutput,
  type UpdateChangeInput,
  type UpdateChangeOutput,
} from '../commands/index.js';
import { createContextService, type ContextService } from '../queries/service.js';
import type {
  DashboardToolInput,
  DashboardToolOutput,
  ProjectContextInput,
  ProjectContextOutput,
  ChangeContextInput,
  ChangeContextOutput,
  ListModulesInput,
  ListModulesOutput,
  ModuleContextInput,
  ModuleContextOutput,
  ContextBudgetPlanInput,
  ContextBudgetPlanOutput,
  RecentActivityInput,
  RecentActivityOutput,
  BrainAnalyzeInput,
  BrainAnalyzeOutput,
  FinishWorkInput,
  FinishWorkOutput,
} from '../queries/index.js';

export interface RuntimeStateSnapshot {
  manifest: Manifest | null;
  project_spec: ProjectSpec | null;
  changes: ChangeSpec[];
  modules: ModuleRecord[];
  decisions: Decision[];
  notes: Note[];
  progress: ProgressEntry[];
  milestones: Milestone[];
}

export interface RuntimeService {
  initializeProject(input: ProjectInitInput): Promise<ProjectInitOutput>;
  defineProjectSpec(input: DefineProjectSpecInput): Promise<DefineProjectSpecOutput>;
  createChange(input: CreateChangeInput): Promise<CreateChangeOutput>;
  updateChange(input: UpdateChangeInput): Promise<UpdateChangeOutput>;
  logDecision(input: LogDecisionInput): Promise<LogDecisionOutput>;
  captureNote(input: CaptureNoteInput): Promise<CaptureNoteOutput>;
  recordProgress(input: RecordProgressInput): Promise<RecordProgressOutput>;
  startWork(input: StartWorkInput): Promise<StartWorkOutput>;
  checkpointWork(input: CheckpointWorkInput): Promise<CheckpointWorkOutput>;
  ingestMemory(input: IngestMemoryInput): Promise<IngestMemoryOutput>;
  finishWork(input: FinishWorkInput): Promise<FinishWorkOutput>;
  getDashboard(input: DashboardToolInput): Promise<DashboardToolOutput>;
  getProjectContext(input: ProjectContextInput): Promise<ProjectContextOutput>;
  getChangeContext(input: ChangeContextInput): Promise<ChangeContextOutput>;
  listModules(input: ListModulesInput): Promise<ListModulesOutput>;
  getModuleContext(input: ModuleContextInput): Promise<ModuleContextOutput>;
  getContextBudgetPlan(input: ContextBudgetPlanInput): Promise<ContextBudgetPlanOutput>;
  getRecentActivity(input: RecentActivityInput): Promise<RecentActivityOutput>;
  analyze(input: BrainAnalyzeInput): Promise<BrainAnalyzeOutput>;
  getState(repoPath?: string): RuntimeStateSnapshot;
}

export function createRuntimeService(storage: StoragePort, git: GitPort): RuntimeService {
  const contextService: ContextService = createContextService(storage, git);
  return {
    initializeProject: (input) => projectInit(input, storage),
    defineProjectSpec: (input) => defineProjectSpec(input, storage),
    createChange: (input) => createChange(input, storage),
    updateChange: (input) => updateChange(input, storage),
    logDecision: (input) => logDecision(input, storage),
    captureNote: (input) => projectCaptureNote(input, storage),
    recordProgress: (input) => recordProgress(input, storage),
    startWork: (input) => startWork(input, storage),
    checkpointWork: (input) => checkpointWork(input, storage),
    ingestMemory: (input) => ingestMemory(input, storage),
    finishWork: (input) => contextService.finishWork(input),
    getDashboard: (input) => contextService.getDashboard(input),
    getProjectContext: (input) => contextService.getProjectContext(input),
    getChangeContext: (input) => contextService.getChangeContext(input),
    listModules: (input) => contextService.listModules(input),
    getModuleContext: (input) => contextService.getModuleContext(input),
    getContextBudgetPlan: (input) => contextService.getContextBudgetPlan(input),
    getRecentActivity: (input) => contextService.getRecentActivity(input),
    analyze: (input) => contextService.analyze(input),
    getState(repoPath) {
      return {
        manifest: storage.readManifest(repoPath),
        project_spec: storage.readProjectSpec(repoPath),
        changes: storage.readAllChanges(repoPath),
        modules: storage.readModules(repoPath),
        decisions: storage.readDecisions(repoPath),
        notes: storage.readNotes(repoPath),
        progress: storage.readProgress(repoPath),
        milestones: storage.readMilestones(repoPath),
      };
    },
  };
}
