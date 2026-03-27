import type { Commit } from '../../../core-protocol/src/git/parseLog.js';
import type { HotPath } from '../../../core-protocol/src/git/hotPaths.js';
import type { Decision } from '../../../core-protocol/src/storage/decisions.js';
import type { Manifest } from '../../../core-protocol/src/storage/manifest.js';
import type { Milestone } from '../../../core-protocol/src/storage/milestones.js';
import type { NextAction } from '../../../core-protocol/src/storage/nextActions.js';
import type { Note } from '../../../core-protocol/src/storage/notes.js';
import type { ProgressEntry } from '../../../core-protocol/src/storage/progress.js';
import type { ProjectSpec } from '../../../core-protocol/src/storage/projectSpec.js';

export interface DashboardOverview {
  project_name: string;
  summary: string;
  goals: string[];
  current_focus: {
    area: string;
    confidence: string;
  };
  overall_completion: 'low' | 'mid' | 'high' | null;
  confidence: string;
}

export interface DashboardActivity {
  summary: string;
  recent_commits: Commit[];
  hot_paths: HotPath[];
  last_active_at: string | null;
  staleness_risk: string;
}

export interface DashboardMemoryListSection<T> {
  title: string;
  summary: string;
  total_count: number;
  visible_count: number;
  items: T[];
  empty_message?: string;
}

export interface DashboardMemory {
  long_term: {
    manifest: Manifest | null;
    project_spec: ProjectSpec | null;
  };
  progress_memory: DashboardMemoryListSection<ProgressEntry>;
  decision_memory: DashboardMemoryListSection<Decision>;
  milestone_memory: DashboardMemoryListSection<Milestone>;
  note_memory: DashboardMemoryListSection<Note>;
}

export interface DashboardMeta {
  generated_at: string;
  repo_path: string;
  is_initialized: boolean;
  include_deep_analysis: boolean;
  degradation_notice: string;
}

export interface DashboardData {
  overview: DashboardOverview;
  activity: DashboardActivity;
  memory: DashboardMemory;
  next_actions: NextAction[];
  meta: DashboardMeta;
}
