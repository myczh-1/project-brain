import { gitExec } from './gitExec.js';

export interface Commit {
  hash: string;
  time: string;
  author: string;
  message: string;
  tag: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'other';
  files_changed: string[];
}

function classifyCommit(message: string): Commit['tag'] {
  const lower = message.toLowerCase();
  if (lower.startsWith('feat:') || lower.startsWith('feat(')) return 'feat';
  if (lower.startsWith('fix:') || lower.startsWith('fix(')) return 'fix';
  if (lower.startsWith('refactor:') || lower.startsWith('refactor(')) return 'refactor';
  if (lower.startsWith('docs:') || lower.startsWith('docs(')) return 'docs';
  if (lower.startsWith('test:') || lower.startsWith('test(')) return 'test';
  if (lower.startsWith('chore:') || lower.startsWith('chore(')) return 'chore';
  return 'other';
}

function isMissingHistoryError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('not a git repository') ||
    message.includes('does not have any commits yet') ||
    message.includes('your current branch')
  );
}

const RECORD_SEPARATOR = '\x1e';
const FIELD_SEPARATOR = '\x1f';

function parseNameOnlyLog(output: string): Commit[] {
  if (!output) return [];

  const records = output.split(RECORD_SEPARATOR).filter(r => r.trim());
  const commits: Commit[] = [];

  for (const record of records) {
    const lines = record.split('\n');
    const headerLine = lines[0];
    if (!headerLine) continue;
    const parts = headerLine.split(FIELD_SEPARATOR);
    if (parts.length < 4) continue;
    const [hash, time, author, message] = parts;
    const files = lines.slice(1).filter(f => f.trim());
    commits.push({ hash, time, author, message, tag: classifyCommit(message), files_changed: files });
  }

  return commits;
}

function runLogWithArgs(args: string[], cwd?: string): Commit[] {
  let output = '';
  try {
    output = gitExec(args, cwd);
  } catch (error) {
    if (isMissingHistoryError(error)) return [];
    throw error;
  }

  return parseNameOnlyLog(output);
}

export function parseLog(limit: number, cwd?: string): Commit[] {
  return runLogWithArgs(
    ['log', '-n', `${limit}`, '--date=iso', '--name-only', `--pretty=format:${RECORD_SEPARATOR}%H${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%s`],
    cwd
  );
}

export function parseLogSinceDays(days: number, cwd?: string): Commit[] {
  return runLogWithArgs(
    ['log', `--since=${days} days ago`, '--date=iso', '--name-only', `--pretty=format:${RECORD_SEPARATOR}%H${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%s`],
    cwd
  );
}
