import type { Note, StoragePort } from '../ports/storage.js';

export interface CaptureNoteInput {
  note: string;
  tags?: string[];
  related_change_id?: string;
  repo_path?: string;
}

export interface CaptureNoteOutput {
  status: 'ok';
  note_id: string;
}

export async function projectCaptureNote(input: CaptureNoteInput, storage: StoragePort): Promise<CaptureNoteOutput> {
  const cwd = input.repo_path || process.cwd();

  const note: Note = {
    id: storage.generateNoteId(),
    time: new Date().toISOString(),
    tags: input.tags || [],
    note: input.note,
    related_change_id: input.related_change_id,
  };

  storage.appendNote(note, cwd);

  return {
    status: 'ok',
    note_id: note.id,
  };
}
