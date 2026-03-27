import type { ChangeSpec } from '../../core-protocol/src/storage/changes.js';
import type { Decision } from '../../core-protocol/src/storage/decisions.js';
import type { Manifest } from '../../core-protocol/src/storage/manifest.js';
import type { Milestone } from '../../core-protocol/src/storage/milestones.js';
import type { Note } from '../../core-protocol/src/storage/notes.js';
import type { ProgressEntry } from '../../core-protocol/src/storage/progress.js';
import type { ProjectSpec } from '../../core-protocol/src/storage/projectSpec.js';
import type { CaptureNoteInput, CaptureNoteOutput } from '../../core-protocol/src/runtime/captureNote.js';
import type { CheckpointWorkInput, CheckpointWorkOutput } from '../../core-protocol/src/runtime/checkpointWork.js';
import type { CreateChangeInput, CreateChangeOutput } from '../../core-protocol/src/runtime/createChange.js';
import type { DefineProjectSpecInput, DefineProjectSpecOutput } from '../../core-protocol/src/runtime/defineProjectSpec.js';
import type { LogDecisionInput, LogDecisionOutput } from '../../core-protocol/src/runtime/logDecision.js';
import type { RecordProgressInput, RecordProgressOutput } from '../../core-protocol/src/runtime/recordProgress.js';
import type { StartWorkInput, StartWorkOutput } from '../../core-protocol/src/runtime/startWork.js';
import type { UpdateChangeInput, UpdateChangeOutput } from '../../core-protocol/src/runtime/updateChange.js';
import type { IngestMemoryInput, IngestMemoryOutput } from '../../core-protocol/src/runtime/ingestMemory.js';
import type { ProjectInitInput, ProjectInitOutput } from '../../core-protocol/src/runtime/initializeProject.js';
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
  | { type: 'ingest_memory'; input: IngestMemoryInput };

export type RuntimeQuery =
  | { type: 'get_manifest'; repo_path?: string }
  | { type: 'get_project_spec'; repo_path?: string }
  | { type: 'get_change'; change_id: string; repo_path?: string }
  | { type: 'list_changes'; repo_path?: string }
  | { type: 'list_decisions'; repo_path?: string }
  | { type: 'list_notes'; repo_path?: string }
  | { type: 'list_progress'; repo_path?: string }
  | { type: 'list_milestones'; repo_path?: string }
  | { type: 'get_state'; repo_path?: string };

export type RuntimeMessage = RuntimeCommand | RuntimeQuery;

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
  | IngestMemoryOutput;

export type RuntimeQueryResult =
  | Manifest
  | ProjectSpec
  | ChangeSpec
  | Decision[]
  | Note[]
  | ProgressEntry[]
  | Milestone[]
  | ChangeSpec[]
  | RuntimeStateSnapshot
  | null;

export type RuntimeMessageResult = RuntimeCommandResult | RuntimeQueryResult;
