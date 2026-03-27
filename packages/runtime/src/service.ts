import { readChange, readAllChanges } from '../../core-protocol/src/storage/changes.js';
import { readDecisions } from '../../core-protocol/src/storage/decisions.js';
import { readManifest } from '../../core-protocol/src/storage/manifest.js';
import { readMilestones } from '../../core-protocol/src/storage/milestones.js';
import { readNotes } from '../../core-protocol/src/storage/notes.js';
import { readProgress } from '../../core-protocol/src/storage/progress.js';
import { readProjectSpec } from '../../core-protocol/src/storage/projectSpec.js';
import { projectCaptureNote } from '../../core-protocol/src/runtime/captureNote.js';
import { checkpointWork } from '../../core-protocol/src/runtime/checkpointWork.js';
import { createChange } from '../../core-protocol/src/runtime/createChange.js';
import { defineProjectSpec } from '../../core-protocol/src/runtime/defineProjectSpec.js';
import { logDecision } from '../../core-protocol/src/runtime/logDecision.js';
import { recordProgress } from '../../core-protocol/src/runtime/recordProgress.js';
import { startWork } from '../../core-protocol/src/runtime/startWork.js';
import { updateChange } from '../../core-protocol/src/runtime/updateChange.js';
import { ingestMemory } from '../../core-protocol/src/runtime/ingestMemory.js';
import { projectInit } from '../../core-protocol/src/runtime/initializeProject.js';
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

export interface RuntimeStateSnapshot {
  manifest: Manifest | null;
  project_spec: ProjectSpec | null;
  changes: ChangeSpec[];
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
  getManifest(repoPath?: string): Manifest | null;
  getProjectSpec(repoPath?: string): ProjectSpec | null;
  getChange(changeId: string, repoPath?: string): ChangeSpec | null;
  listChanges(repoPath?: string): ChangeSpec[];
  listDecisions(repoPath?: string): Decision[];
  listNotes(repoPath?: string): Note[];
  listProgress(repoPath?: string): ProgressEntry[];
  listMilestones(repoPath?: string): Milestone[];
  getState(repoPath?: string): RuntimeStateSnapshot;
}

export function createRuntimeService(): RuntimeService {
  return {
    initializeProject: projectInit,
    defineProjectSpec,
    createChange,
    updateChange,
    logDecision,
    captureNote: projectCaptureNote,
    recordProgress,
    startWork,
    checkpointWork,
    ingestMemory,
    getManifest: readManifest,
    getProjectSpec: readProjectSpec,
    getChange: readChange,
    listChanges: readAllChanges,
    listDecisions: readDecisions,
    listNotes: readNotes,
    listProgress: readProgress,
    listMilestones: readMilestones,
    getState(repoPath) {
      return {
        manifest: readManifest(repoPath),
        project_spec: readProjectSpec(repoPath),
        changes: readAllChanges(repoPath),
        decisions: readDecisions(repoPath),
        notes: readNotes(repoPath),
        progress: readProgress(repoPath),
        milestones: readMilestones(repoPath),
      };
    },
  };
}
