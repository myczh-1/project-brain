import type { StoragePort } from '../ports/storage.js';
import { createRuntimeService, type RuntimeService } from './service.js';
import type { RuntimeMessage, RuntimeMessageResult } from './protocol.js';

export { createRuntimeService } from './service.js';
export type { RuntimeService, RuntimeStateSnapshot } from './service.js';
export type {
  RuntimeCommand,
  RuntimeCommandResult,
  RuntimeMessage,
  RuntimeMessageResult,
  RuntimeQuery,
  RuntimeQueryResult,
} from './protocol.js';

export function createRuntime(storage: StoragePort, defaultRepoPath?: string, service: RuntimeService = createRuntimeService(storage)) {
  return {
    async handle(message: RuntimeMessage): Promise<RuntimeMessageResult> {
      switch (message.type) {
        case 'initialize_project':
          return service.initializeProject(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'define_project_spec':
          return service.defineProjectSpec(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'create_change':
          return service.createChange(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'update_change':
          return service.updateChange(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'log_decision':
          return service.logDecision(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'capture_note':
          return service.captureNote(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'record_progress':
          return service.recordProgress(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'start_work':
          return service.startWork(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'checkpoint_work':
          return service.checkpointWork(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'ingest_memory':
          return service.ingestMemory(withDefaultRepoPath(message.input, defaultRepoPath));
        case 'get_manifest':
          return service.getManifest(message.repo_path || defaultRepoPath);
        case 'get_project_spec':
          return service.getProjectSpec(message.repo_path || defaultRepoPath);
        case 'get_change':
          return service.getChange(message.change_id, message.repo_path || defaultRepoPath);
        case 'list_changes':
          return service.listChanges(message.repo_path || defaultRepoPath);
        case 'list_decisions':
          return service.listDecisions(message.repo_path || defaultRepoPath);
        case 'list_notes':
          return service.listNotes(message.repo_path || defaultRepoPath);
        case 'list_progress':
          return service.listProgress(message.repo_path || defaultRepoPath);
        case 'list_milestones':
          return service.listMilestones(message.repo_path || defaultRepoPath);
        case 'get_state':
          return service.getState(message.repo_path || defaultRepoPath);
        default:
          return assertNever(message);
      }
    },
  };
}

function withDefaultRepoPath<T extends { repo_path?: string }>(input: T, defaultRepoPath?: string): T {
  return input.repo_path || !defaultRepoPath ? input : { ...input, repo_path: defaultRepoPath };
}

function assertNever(value: never): never {
  throw new Error(`Unsupported runtime message: ${JSON.stringify(value)}`);
}
