import type {
  CaptureNoteInput,
  CaptureNoteOutput,
  CheckpointWorkInput,
  CheckpointWorkOutput,
  CreateChangeInput,
  CreateChangeOutput,
  DefineProjectSpecInput,
  DefineProjectSpecOutput,
  IngestMemoryInput,
  IngestMemoryOutput,
  LogDecisionInput,
  LogDecisionOutput,
  ProjectInitInput,
  ProjectInitOutput,
  RecordProgressInput,
  RecordProgressOutput,
  StartWorkInput,
  StartWorkOutput,
  UpdateChangeInput,
  UpdateChangeOutput,
} from '../commands/index.js';
import type {
  DashboardToolInput as QueryDashboardToolInput,
  DashboardToolOutput as QueryDashboardToolOutput,
  ProjectContextInput as QueryProjectContextInput,
  ProjectContextOutput as QueryProjectContextOutput,
  ChangeContextInput as QueryChangeContextInput,
  ChangeContextOutput as QueryChangeContextOutput,
  ListModulesInput as QueryListModulesInput,
  ListModulesOutput as QueryListModulesOutput,
  ModuleContextInput as QueryModuleContextInput,
  ModuleContextOutput as QueryModuleContextOutput,
  ContextBudgetPlanInput as QueryContextBudgetPlanInput,
  ContextBudgetPlanOutput as QueryContextBudgetPlanOutput,
  RecentActivityInput as QueryRecentActivityInput,
  RecentActivityOutput as QueryRecentActivityOutput,
  BrainAnalyzeInput as QueryBrainAnalyzeInput,
  BrainAnalyzeOutput as QueryBrainAnalyzeOutput,
  FinishWorkInput as QueryFinishWorkInput,
  FinishWorkOutput as QueryFinishWorkOutput,
} from '../queries/index.js';
import type { RuntimeStateSnapshot } from './service.js';

export type RuntimeCommand =
  | { type: 'initialize_project'; input: ProjectInitInput }
  | { type: 'define_project_spec'; input: DefineProjectSpecInput }
  | { type: 'create_change'; input: CreateChangeInput }
  | { type: 'update_change'; input: UpdateChangeInput }
  | { type: 'log_decision'; input: LogDecisionInput }
  | { type: 'capture_note'; input: CaptureNoteInput }
  | { type: 'record_progress'; input: RecordProgressInput }
  | { type: 'start_work'; input: StartWorkInput }
  | { type: 'checkpoint_work'; input: CheckpointWorkInput }
  | { type: 'ingest_memory'; input: IngestMemoryInput }
  | { type: 'finish_work'; input: QueryFinishWorkInput };

export type RuntimeQuery =
  | { type: 'get_dashboard'; input: QueryDashboardToolInput }
  | { type: 'get_project_context'; input: QueryProjectContextInput }
  | { type: 'get_change_context'; input: QueryChangeContextInput }
  | { type: 'list_modules'; input: QueryListModulesInput }
  | { type: 'get_module_context'; input: QueryModuleContextInput }
  | { type: 'get_context_budget_plan'; input: QueryContextBudgetPlanInput }
  | { type: 'get_recent_activity'; input: QueryRecentActivityInput }
  | { type: 'analyze'; input: QueryBrainAnalyzeInput }
  | { type: 'get_state'; repo_path: string };

export type RuntimeMessage = RuntimeCommand | RuntimeQuery;
export type RuntimeResultFor<T extends RuntimeMessage> = T extends RuntimeCommand
  ? RuntimeCommandResult
  : T extends RuntimeQuery
  ? RuntimeQueryResult
  : never;

export type RuntimeCommandResult =
  | ProjectInitOutput
  | DefineProjectSpecOutput
  | CreateChangeOutput
  | UpdateChangeOutput
  | LogDecisionOutput
  | CaptureNoteOutput
  | RecordProgressOutput
  | StartWorkOutput
  | CheckpointWorkOutput
  | IngestMemoryOutput
  | QueryFinishWorkOutput;

export type RuntimeQueryResult =
  | QueryDashboardToolOutput
  | QueryProjectContextOutput
  | QueryChangeContextOutput
  | QueryListModulesOutput
  | QueryModuleContextOutput
  | QueryContextBudgetPlanOutput
  | QueryRecentActivityOutput
  | QueryBrainAnalyzeOutput
  | RuntimeStateSnapshot
  ;

export type RuntimeMessageResult = RuntimeCommandResult | RuntimeQueryResult;
