import { describe, expect, it } from 'vitest';
import {
  buildHistoryEvidenceChain,
  evaluateRetrievalConfidence,
  expandRetrievalTerms,
  resolveCommitWindow,
  textMatchesTerms,
} from './retrievalStrategy.js';

describe('retrievalStrategy', () => {
  it('expands legacy aliases for investigation hints', () => {
    const terms = expandRetrievalTerms('fix auth session bug', ['refresh flow']);
    expect(terms).toContain('legacy auth');
    expect(terms).toContain('refresh cookie');
  });

  it('matches text against expanded terms', () => {
    const matched = textMatchesTerms('legacy auth still uses old route matcher', ['old route matcher']);
    expect(matched).toBe(true);
  });

  it('resolves commit window by entrypoint', () => {
    expect(resolveCommitWindow('standard')).toBe(30);
    expect(resolveCommitWindow('investigation')).toBe(120);
    expect(resolveCommitWindow('investigation', 15)).toBe(15);
  });

  it('returns low confidence and investigation fallback for thin standard evidence', () => {
    const result = evaluateRetrievalConfidence('standard', 0, 0, 1, 5);
    expect(result.confidence).toBe('low');
    expect(result.suggested_fallback_entrypoint).toBe('investigation');
  });

  it('builds bounded evidence chain', () => {
    const chain = buildHistoryEvidenceChain(
      [{ id: 'd1', title: 'T', decision: 'D', rationale: 'R', alternatives_considered: [], scope: 'project', created_at: '' }],
      [{ id: 'n1', note: 'N', tags: [], time: '' }],
      [{ id: 'p1', summary: 'P', confidence: 'mid', date: '' }]
    );
    expect(chain.length).toBe(3);
    expect(chain[0].source).toBe('decision');
  });
});
