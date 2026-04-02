import type { Commit, HotPath } from '../../ports/git.js';
import type { Decision, Milestone, NextAction, ProgressEntry } from '../../ports/storage.js';

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
    manifest: import('../../ports/storage.js').Manifest | null;
    project_spec: import('../../ports/storage.js').ProjectSpec | null;
  };
  progress_memory: DashboardMemoryListSection<ProgressEntry>;
  decision_memory: DashboardMemoryListSection<Decision>;
  milestone_memory: DashboardMemoryListSection<Milestone>;
  note_memory: DashboardMemoryListSection<import('../../ports/storage.js').Note>;
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
