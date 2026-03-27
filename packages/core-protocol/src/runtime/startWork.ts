import { readAllChanges } from '../storage/changes.js';
import { createChange, CreateChangeInput } from './createChange.js';
import { recordProgress, RecordProgressInput } from './recordProgress.js';
import { updateChange } from './updateChange.js';

export interface StartWorkInput {
  repo_path?: string;
  change_id?: string;
  create_change?: CreateChangeInput['change'];
  initial_progress?: RecordProgressInput['progress'];
}

export interface StartWorkOutput {
  status: 'ok';
  action: 'reused_change' | 'created_change' | 'adopted_recent_change';
  change: Awaited<ReturnType<typeof createChange>>['change'];
  change_path: string;
  progress_id?: string;
}

function findReusableChange(repoPath?: string) {
  const changes = readAllChanges(repoPath);
  return changes.find(change => change.status === 'active') || changes.find(change => change.status === 'proposed');
}

export async function startWork(input: StartWorkInput): Promise<StartWorkOutput> {
  const cwd = input.repo_path || process.cwd();

  if (!input.change_id && !input.create_change) {
    const reusable = findReusableChange(cwd);
    if (!reusable) {
      throw new Error(
        'brain_start_work requires change_id or create_change when no active/proposed change exists.'
      );
    }

    const updated = await updateChange({
      repo_path: cwd,
      change_id: reusable.id,
      patch: {
        status: 'active',
      },
    });

    const progressResult = input.initial_progress
      ? await recordProgress({
          repo_path: cwd,
          type: 'progress',
          progress: {
            ...input.initial_progress,
            related_change_id: input.initial_progress.related_change_id || reusable.id,
          },
        })
      : undefined;

    return {
      status: 'ok',
      action: 'adopted_recent_change',
      change: updated.change,
      change_path: updated.change_path,
      progress_id: progressResult?.progress_id,
    };
  }

  if (input.change_id) {
    const updated = await updateChange({
      repo_path: cwd,
      change_id: input.change_id,
      patch: {
        status: 'active',
      },
    });

    const progressResult = input.initial_progress
      ? await recordProgress({
          repo_path: cwd,
          type: 'progress',
          progress: {
            ...input.initial_progress,
            related_change_id: input.initial_progress.related_change_id || input.change_id,
          },
        })
      : undefined;

    return {
      status: 'ok',
      action: 'reused_change',
      change: updated.change,
      change_path: updated.change_path,
      progress_id: progressResult?.progress_id,
    };
  }

  const created = await createChange({
    repo_path: cwd,
    change: {
      ...input.create_change!,
      status: input.create_change?.status || 'active',
    },
  });

  const progressResult = input.initial_progress
    ? await recordProgress({
        repo_path: cwd,
        type: 'progress',
        progress: {
          ...input.initial_progress,
          related_change_id: input.initial_progress.related_change_id || created.change.id,
        },
      })
    : undefined;

  return {
    status: 'ok',
    action: 'created_change',
    change: created.change,
    change_path: created.change_path,
    progress_id: progressResult?.progress_id,
  };
}
