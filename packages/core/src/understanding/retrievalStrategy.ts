import type { Decision, Note, ProgressEntry } from '../ports/storage.js';

export type RetrievalEntrypoint = 'standard' | 'investigation';

function normalizeTerms(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9_/-]+/i)
    .map(part => part.trim())
    .filter(part => part.length >= 3);
}

export function expandRetrievalTerms(task: string | undefined, hints: string[]): string[] {
  const seed = [task || '', ...hints].join(' ');
  return Array.from(new Set(normalizeTerms(seed))).slice(0, 20);
}

export function textMatchesTerms(text: string, terms: string[]): boolean {
  const lowered = text.toLowerCase();
  return terms.some(term => lowered.includes(term));
}

export function resolveCommitWindow(entrypoint: RetrievalEntrypoint, requested?: number): number {
  if (requested && requested > 0) return requested;
  return entrypoint === 'investigation' ? 120 : 30;
}

export function evaluateRetrievalConfidence(
  entrypoint: RetrievalEntrypoint,
  decisionHits: number,
  noteHits: number,
  progressHits: number,
  commitHits: number
): {
  confidence: 'low' | 'mid' | 'high';
  low_confidence_reason?: string;
  suggested_fallback_entrypoint?: 'investigation';
} {
  const rationaleHits = decisionHits + noteHits;
  if (rationaleHits === 0 && progressHits === 0 && commitHits === 0) {
    return {
      confidence: 'low',
      low_confidence_reason: 'No relevant evidence matched this request across memory and code activity.',
      suggested_fallback_entrypoint: entrypoint === 'standard' ? 'investigation' : undefined,
    };
  }
  if (rationaleHits === 0) {
    return {
      confidence: 'low',
      low_confidence_reason: 'Only implementation signals were found; rationale evidence is missing.',
      suggested_fallback_entrypoint: entrypoint === 'standard' ? 'investigation' : undefined,
    };
  }
  if (rationaleHits < 2) {
    return { confidence: 'mid' };
  }
  return { confidence: 'high' };
}

export function buildHistoryEvidenceChain(
  decisions: Decision[],
  notes: Note[],
  progress: ProgressEntry[]
): Array<{
  source: 'decision' | 'note' | 'progress';
  ref: string;
  excerpt: string;
}> {
  return [
    ...decisions.slice(0, 4).map(decision => ({
      source: 'decision' as const,
      ref: decision.id,
      excerpt: `${decision.title}: ${decision.decision}`.slice(0, 180),
    })),
    ...notes.slice(0, 4).map(note => ({
      source: 'note' as const,
      ref: note.id,
      excerpt: note.note.slice(0, 180),
    })),
    ...progress.slice(0, 4).map(entry => ({
      source: 'progress' as const,
      ref: entry.id,
      excerpt: entry.summary.slice(0, 180),
    })),
  ].slice(0, 8);
}
