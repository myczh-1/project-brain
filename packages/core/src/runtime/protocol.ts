import { z } from 'zod';
import type {
  CaptureNoteInput,
  CaptureNoteOutput,
  CreateChangeInput,
  CreateChangeOutput,
  DefineProjectSpecInput,
  DefineProjectSpecOutput,
  LogDecisionInput,
  LogDecisionOutput,
  ProjectInitInput,
  ProjectInitOutput,
  RecordProgressInput,
  RecordProgressOutput,
  UpdateChangeInput,
  UpdateChangeOutput,
} from '../commands/index.js';
import type {
  ChangeContextInput as QueryChangeContextInput,
  ChangeContextOutput as QueryChangeContextOutput,
  BrainAnalyzeInput as QueryBrainAnalyzeInput,
  BrainAnalyzeOutput as QueryBrainAnalyzeOutput,
} from '../queries/index.js';
import type { RuntimeStateSnapshot } from './service.js';
import { getStateSchema, runtimeInputSchemas } from './inputSchemas.js';

const runtimeInputMessageSchemas = [
  z.object({ type: z.literal('initialize_project'), input: runtimeInputSchemas.initialize_project }).strict(),
  z.object({ type: z.literal('define_project_spec'), input: runtimeInputSchemas.define_project_spec }).strict(),
  z.object({ type: z.literal('create_change'), input: runtimeInputSchemas.create_change }).strict(),
  z.object({ type: z.literal('update_change'), input: runtimeInputSchemas.update_change }).strict(),
  z.object({ type: z.literal('log_decision'), input: runtimeInputSchemas.log_decision }).strict(),
  z.object({ type: z.literal('capture_note'), input: runtimeInputSchemas.capture_note }).strict(),
  z.object({ type: z.literal('record_progress'), input: runtimeInputSchemas.record_progress }).strict(),
  z.object({ type: z.literal('get_change_context'), input: runtimeInputSchemas.get_change_context }).strict(),
  z.object({ type: z.literal('analyze'), input: runtimeInputSchemas.analyze }).strict(),
] as const;

const runtimeInputMessageSchema = z.union(runtimeInputMessageSchemas);

export const runtimeMessageSchema = z.union([runtimeInputMessageSchema, getStateSchema]);

export type RuntimeCommand =
  | { type: 'initialize_project'; input: ProjectInitInput }
  | { type: 'define_project_spec'; input: DefineProjectSpecInput }
  | { type: 'create_change'; input: CreateChangeInput }
  | { type: 'update_change'; input: UpdateChangeInput }
  | { type: 'log_decision'; input: LogDecisionInput }
  | { type: 'capture_note'; input: CaptureNoteInput }
  | { type: 'record_progress'; input: RecordProgressInput };

export type RuntimeQuery =
  | { type: 'get_change_context'; input: QueryChangeContextInput }
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
  | RecordProgressOutput;

export type RuntimeQueryResult =
  | QueryChangeContextOutput
  | QueryBrainAnalyzeOutput
  | RuntimeStateSnapshot
  ;

export type RuntimeMessageResult = RuntimeCommandResult | RuntimeQueryResult;

export function parseRuntimeMessage(value: unknown): RuntimeMessage {
  return runtimeMessageSchema.parse(value);
}
