import { buildDashboardData, buildDashboardSummary, BuildDashboardInput } from '../dashboard/buildDashboard.js';
import { DashboardData } from '../dashboard/types.js';
import { getDashboardResourceUri } from '../dashboard/renderDashboardApp.js';

export interface DashboardToolInput extends BuildDashboardInput {}

export interface DashboardToolOutput {
  summary: string;
  dashboard: DashboardData;
  resource_uri: string;
}

export async function brainDashboard(
  input: DashboardToolInput
): Promise<DashboardToolOutput> {
  const dashboard = await buildDashboardData(input);

  return {
    summary: buildDashboardSummary(dashboard),
    dashboard,
    resource_uri: getDashboardResourceUri(),
  };
}
