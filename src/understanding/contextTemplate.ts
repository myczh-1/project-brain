import { Manifest } from '../storage/manifest.js';
import { Commit } from '../git/parseLog.js';
import { Note } from '../storage/notes.js';
import { FocusInference, MilestoneSignal } from './inferFocus.js';
import { ProgressEntry } from '../storage/progress.js';
import { Decision } from '../storage/decisions.js';
import { Milestone } from '../storage/milestones.js';

export interface ContextData {
  manifest: Manifest | null;
  recentCommits: Commit[];
  notes: Note[];
  focus: FocusInference | null;
  milestoneSignals?: MilestoneSignal[];
  progress?: ProgressEntry[];
  decisions?: Decision[];
  milestones?: Milestone[];
}

export function generateContextText(data: ContextData): string {
  const sections: string[] = [];

  sections.push('# Project Context\n');

  if (data.manifest) {
    sections.push('## One-liner');
    sections.push(data.manifest.one_liner || 'Not specified');
    sections.push('');

    if (data.manifest.goals.length > 0) {
      sections.push('## Goals');
      data.manifest.goals.forEach(goal => sections.push(`- ${goal}`));
      sections.push('');
    }

    if (data.manifest.constraints.length > 0 || data.manifest.tech_stack.length > 0) {
      sections.push('## Constraints & Tech');
      data.manifest.constraints.forEach(c => sections.push(`- ${c}`));
      data.manifest.tech_stack.forEach(t => sections.push(`- ${t}`));
      sections.push('');
    }
  }

  if (data.focus) {
    sections.push('## Current inferred focus');
    sections.push(data.focus.focus);
    sections.push(`confidence: ${data.focus.confidence}`);
    sections.push('');
  }
  if (data.milestoneSignals && data.milestoneSignals.length > 0) {
    sections.push('## Milestone Signals');
    data.milestoneSignals.forEach(signal => {
      sections.push(`- ${signal.name} (confidence: ${signal.confidence})`);
      sections.push(`  ${signal.reason}`);
    });
    sections.push('');
  }

  if (data.progress && data.progress.length > 0) {
    sections.push('## Recent Progress');
    data.progress.slice(-5).forEach(p => {
      sections.push(`- [${p.date.split('T')[0]}] ${p.summary} (confidence: ${p.confidence})`);
    });
    sections.push('');
  }

  if (data.decisions && data.decisions.length > 0) {
    sections.push('## Key Decisions');
    data.decisions.slice(-5).forEach(d => {
      sections.push(`- ${d.decision}`);
      sections.push(`  Reason: ${d.reason}`);
    });
    sections.push('');
  }


  if (data.recentCommits.length > 0) {
    sections.push('## Recent activity');
    const summaryLines = data.recentCommits.slice(0, 10).map(c => 
      `- [${c.tag}] ${c.message.substring(0, 80)}`
    );
    sections.push(...summaryLines);
    sections.push('');
  }

  if (data.notes.length > 0) {
    const unknowns = data.notes.filter(n => n.tags.includes('unknown'));
    if (unknowns.length > 0) {
      sections.push('## Unknowns');
      unknowns.forEach(u => sections.push(`- ${u.note}`));
      sections.push('');
    }
  }

  return sections.join('\n');
}
