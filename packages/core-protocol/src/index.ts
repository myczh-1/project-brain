export { createRuntime, createRuntimeService } from '../../runtime/src/index.js';
import { createRuntime as createProtocolCore } from '../../runtime/src/index.js';
export type {
  RuntimeCommand,
  RuntimeCommandResult,
  RuntimeMessage,
  RuntimeMessageResult,
  RuntimeQuery,
  RuntimeQueryResult,
  RuntimeService,
  RuntimeStateSnapshot,
} from '../../runtime/src/index.js';

export { createProtocolCore };
