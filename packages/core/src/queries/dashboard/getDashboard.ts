import type { GitPort } from '../../ports/git.js';
import type { StoragePort } from '../../ports/storage.js';
import { buildDashboardData, buildDashboardSummary, type BuildDashboardInput } from './buildDashboard.js';
import type { DashboardData } from './types.js';

export interface DashboardToolInput extends BuildDashboardInput {}

export interface DashboardToolOutput {
  summary: string;
  dashboard: DashboardData;
}

/** @internal Internal composition helper; not part of the stable public API surface. */
export async function brainDashboard(input: DashboardToolInput, storage: StoragePort, git: GitPort): Promise<DashboardToolOutput> {
  const dashboard = await buildDashboardData(input, storage, git);
  return {
    summary: buildDashboardSummary(dashboard),
    dashboard,
  };
}
