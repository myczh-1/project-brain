#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { projectInit } from './tools/projectInit.js';
import { defineProjectSpec } from './tools/defineProjectSpec.js';
import { createChange } from './tools/createChange.js';
import { updateChange } from './tools/updateChange.js';
import { logDecision } from './tools/logDecision.js';
import { changeContext } from './tools/changeContext.js';
import { projectRecentActivity } from './tools/recentActivity.js';
import { projectContext } from './tools/projectContext.js';
import { projectCaptureNote } from './tools/captureNote.js';
import { recordProgress } from './tools/recordProgress.js';
import { estimateMilestoneProgressTool } from './tools/estimateMilestoneProgress.js';
import { suggestNextActionsTool } from './tools/suggestNextActions.js';
import { brainAnalyze } from './tools/brainAnalyze.js';
import { ingestMemory } from './tools/ingestMemory.js';
import { brainDashboard } from './tools/dashboard.js';
import {
  getDashboardResourceDefinition,
  getDashboardResourceContents,
  getDashboardResourceMimeType,
  getDashboardResourceUri,
} from './dashboard/renderDashboardApp.js';

function textResult(payload: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
  };
}

const server = new Server(
  { name: 'project-brain', version: '0.0.1' },
  { capabilities: { resources: {}, tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'brain_dashboard',
      description: 'Return a read-only project dashboard with structured data and an MCP Apps UI resource when supported by the host.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string', description: 'Optional repository path' },
          include_deep_analysis: {
            type: 'boolean',
            description: 'Set false for a lighter summary path that skips deep analysis.',
          },
          recent_commits: {
            type: 'number',
            description: 'Number of commits to inspect when building the dashboard (default: 50).',
          },
        },
      },
      _meta: {
        ui: {
          resourceUri: getDashboardResourceUri(),
          visibility: ['app', 'model'],
        },
        'openai/outputTemplate': getDashboardResourceUri(),
        'openai/widgetAccessible': true,
      },
    },
    {
      name: 'brain_init',
      description: 'Initialize or update the project identity anchor in manifest.json.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string', description: 'Optional repository path' },
          answers: {
            type: 'object',
            properties: {
              project_name: { type: 'string' },
              summary: { type: 'string' },
              repo_type: { type: 'string' },
              primary_stack: { type: 'array', items: { type: 'string' } },
              long_term_goal: { type: 'string' },
            },
          },
        },
      },
    },
    {
      name: 'brain_define_project_spec',
      description: 'Create or update the stable governance rules for the project.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          spec: {
            type: 'object',
            properties: {
              product_goal: { type: 'string' },
              non_goals: { type: 'array', items: { type: 'string' } },
              architecture_rules: { type: 'array', items: { type: 'string' } },
              coding_rules: { type: 'array', items: { type: 'string' } },
              agent_rules: { type: 'array', items: { type: 'string' } },
              source: { type: 'string' },
            },
            required: ['product_goal'],
          },
        },
        required: ['spec'],
      },
    },
    {
      name: 'brain_create_change',
      description: 'Create a change-spec for a single iteration or feature.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          change: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              summary: { type: 'string' },
              status: { type: 'string', enum: ['proposed', 'active', 'done', 'dropped'] },
              goals: { type: 'array', items: { type: 'string' } },
              non_goals: { type: 'array', items: { type: 'string' } },
              constraints: { type: 'array', items: { type: 'string' } },
              acceptance_criteria: { type: 'array', items: { type: 'string' } },
              affected_areas: { type: 'array', items: { type: 'string' } },
              related_decision_ids: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'summary'],
          },
        },
        required: ['change'],
      },
    },
    {
      name: 'brain_update_change',
      description: 'Update an existing change-spec.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          change_id: { type: 'string' },
          patch: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              status: { type: 'string', enum: ['proposed', 'active', 'done', 'dropped'] },
              goals: { type: 'array', items: { type: 'string' } },
              non_goals: { type: 'array', items: { type: 'string' } },
              constraints: { type: 'array', items: { type: 'string' } },
              acceptance_criteria: { type: 'array', items: { type: 'string' } },
              affected_areas: { type: 'array', items: { type: 'string' } },
              related_decision_ids: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        required: ['change_id', 'patch'],
      },
    },
    {
      name: 'brain_log_decision',
      description: 'Record a concrete decision with rationale.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          decision: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              decision: { type: 'string' },
              rationale: { type: 'string' },
              alternatives_considered: { type: 'array', items: { type: 'string' } },
              scope: { type: 'string', enum: ['project', 'change', 'module'] },
              related_change_id: { type: 'string' },
              supersedes: { type: 'string' },
            },
            required: ['title', 'decision', 'rationale'],
          },
        },
        required: ['decision'],
      },
    },
    {
      name: 'brain_change_context',
      description: 'Generate execution-ready context for a specific change, including optional OpenSpec compatibility.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          change_id: { type: 'string' },
          recent_commits: { type: 'number' },
        },
        required: ['change_id'],
      },
    },
    {
      name: 'brain_ingest_memory',
      description: 'Validate and ingest a single GPT-structured memory record into the correct ProjectBrain layer.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          memory: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['project_spec', 'change_spec', 'decision', 'note', 'progress'],
              },
              confirmed_by_user: { type: 'boolean' },
              source: { type: 'string' },
              payload: {
                type: 'object',
                description: 'Structured payload for the declared memory type.',
              },
            },
            required: ['type', 'payload', 'confirmed_by_user'],
          },
        },
        required: ['memory'],
      },
    },
    {
      name: 'brain_analyze',
      description: 'Deep project analysis with progress estimation and action recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
          depth: { type: 'string', enum: ['quick', 'full'] },
          recent_commits: { type: 'number' },
        },
      },
    },
    {
      name: 'brain_recent_activity',
      description: 'Get recent git activity with commits and hot paths.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          since_days: { type: 'number' },
          repo_path: { type: 'string' },
        },
      },
    },
    {
      name: 'brain_context',
      description: 'Get project-level context: identity, stable rules, recent decisions, progress, and code evidence.',
      inputSchema: {
        type: 'object',
        properties: {
          repo_path: { type: 'string' },
        },
      },
    },
    {
      name: 'brain_capture_note',
      description: 'Capture a raw observation or temporary note about the project.',
      inputSchema: {
        type: 'object',
        properties: {
          note: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          related_change_id: { type: 'string' },
          repo_path: { type: 'string' },
        },
        required: ['note'],
      },
    },
    {
      name: 'brain_record_progress',
      description: 'Record development progress facts or milestone state.',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['progress', 'milestone'] },
          repo_path: { type: 'string' },
          progress: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              status: { type: 'string', enum: ['planned', 'in_progress', 'blocked', 'done'] },
              blockers: { type: 'array', items: { type: 'string' } },
              related_change_id: { type: 'string' },
              confidence: { type: 'string', enum: ['low', 'mid', 'high'] },
            },
          },
          milestone: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              status: { type: 'string', enum: ['not_started', 'in_progress', 'completed'] },
              confidence: { type: 'string', enum: ['low', 'mid', 'high'] },
            },
          },
        },
        required: ['type'],
      },
    },
    {
      name: 'brain_estimate_progress',
      description: 'Estimate progress percentage for milestones with explainable reasoning.',
      inputSchema: {
        type: 'object',
        properties: {
          milestone_name: { type: 'string' },
          repo_path: { type: 'string' },
          recent_commits: { type: 'number' },
        },
      },
    },
    {
      name: 'brain_suggest_actions',
      description: 'Generate prioritized next action recommendations based on project state.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          filter_by_milestone: { type: 'string' },
          repo_path: { type: 'string' },
          recent_commits: { type: 'number' },
        },
      },
    },
  ],
}));

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [getDashboardResourceDefinition()],
}));

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params;

  if (uri !== getDashboardResourceUri()) {
    throw new Error(`Unknown resource: ${uri}`);
  }

  return getDashboardResourceContents();
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'brain_dashboard': {
        const result = await brainDashboard(args as never);
        return {
          content: [
            {
              type: 'text',
              text: result.summary,
            },
            {
              type: 'resource_link',
              uri: result.resource_uri,
              name: 'project-brain-dashboard',
              title: 'Project Brain Dashboard',
              description: 'Open the dashboard UI in hosts that support MCP Apps resources.',
              mimeType: getDashboardResourceMimeType(),
            },
          ],
          structuredContent: result.dashboard as unknown as Record<string, unknown>,
          _meta: {
            ui: {
              resourceUri: result.resource_uri,
            },
            'openai/outputTemplate': result.resource_uri,
            'project-brain/generatedAt': result.dashboard.meta.generated_at,
          },
        };
      }
      case 'brain_init':
        return textResult(await projectInit(args as never));
      case 'brain_define_project_spec':
        return textResult(await defineProjectSpec(args as never));
      case 'brain_create_change':
        return textResult(await createChange(args as never));
      case 'brain_update_change':
        return textResult(await updateChange(args as never));
      case 'brain_log_decision':
        return textResult(await logDecision(args as never));
      case 'brain_change_context':
        return textResult(await changeContext(args as never));
      case 'brain_ingest_memory':
        return textResult(await ingestMemory(args as never));
      case 'brain_analyze':
        return textResult(await brainAnalyze(args as never));
      case 'brain_recent_activity':
        return textResult(await projectRecentActivity(args as never));
      case 'brain_context':
        return textResult(await projectContext(args as never));
      case 'brain_record_progress':
        return textResult(await recordProgress(args as never));
      case 'brain_capture_note':
        return textResult(await projectCaptureNote(args as never));
      case 'brain_estimate_progress':
        return textResult(await estimateMilestoneProgressTool(args as never));
      case 'brain_suggest_actions':
        return textResult(await suggestNextActionsTool(args as never));
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Project Brain MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
