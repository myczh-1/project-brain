#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { projectInit } from './tools/projectInit.js';
import { projectRecentActivity } from './tools/recentActivity.js';
import { projectContext } from './tools/projectContext.js';
import { projectCaptureNote } from './tools/captureNote.js';
import { recordProgress } from './tools/recordProgress.js';
import { estimateMilestoneProgressTool } from './tools/estimateMilestoneProgress.js';
import { suggestNextActionsTool } from './tools/suggestNextActions.js';

import { brainAnalyze } from './tools/brainAnalyze.js';
const server = new Server(
  {
    name: 'project-brain',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'brain_init',
        description: 'Collect and validate user-confirmed final goals; never writes manifest unless explicit user confirmation is provided',
        inputSchema: {
          type: 'object',
          properties: {
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
            force_goal_update: {
              type: 'boolean',
              description: 'Set true only when user explicitly requests goal changes',
            },
            update_reason: {
              type: 'string',
              description: 'Required when force_goal_update=true',
            },
            confirmed_by_user: {
              type: 'boolean',
              description: 'Must be true before manifest can be written',
            },
            goal_confirmation_source: {
              type: 'string',
              description: 'Where explicit user confirmation came from (e.g. quoted user message)',
            },
            goal_confirmation: {
              type: 'object',
              description: 'Legacy-compatible confirmation object; accepted for backward compatibility',
              properties: {
                confirmed_by_user: {
                  type: 'boolean',
                  description: 'Must be true. Prevents model-guessed initialization',
                },
                goal_horizon: {
                  type: 'string',
                  enum: ['final'],
                  description: 'Must be "final". Do not store current implementation-only goals',
                },
                source: {
                  type: 'string',
                  description: 'Source of truth for confirmation (e.g. user message or PRD section)',
                },
              },
              required: ['confirmed_by_user', 'goal_horizon', 'source'],
            },
            answers: {
              type: 'object',
              properties: {
                project_name: { type: 'string' },
                one_liner: { type: 'string' },
                goals: { type: 'array', items: { type: 'string' }, minItems: 1 },
                constraints: { type: 'array', items: { type: 'string' } },
                tech_stack: { type: 'array', items: { type: 'string' } },
                locale: { type: 'string' },
              },
            },
          },
        },
      },
      {
        name: 'brain_analyze',
        description: `Analyze project status, progress, and context using git history and project metadata.

**ALWAYS use this tool when:**
- User asks about project status, progress, or current state (e.g., "how's the project", "what's the progress", "项目进度如何")
- User asks "what should I do next" or "what's the priority"
- User asks about project goals, milestones, or focus areas
- At the start of any coding session to understand project context
- Before making architectural decisions or planning work

This is the PRIMARY tool for understanding any project using ProjectBrain. It returns complete analysis including goals, progress estimation, recent activity, hot paths, and prioritized next actions.`,
        inputSchema: {
          type: 'object',
          properties: {
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
            depth: {
              type: 'string',
              enum: ['quick', 'full'],
              description: 'quick: summary with top 5 commits, full: detailed analysis with top 10 commits and milestone details (default: full)',
            },
            recent_commits: {
              type: 'number',
              description: 'Number of commits to analyze (default: 50)',
            },
          },
        },
      },
      {
        name: 'brain_recent_activity',
        description: 'Get recent git activity with commits and hot paths',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of commits to retrieve (default: 50)',
            },
            since_days: {
              type: 'number',
              description: 'Get commits from last N days',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
          },
        },
      },
      {
        name: 'brain_context',
        description: 'Generate AI-ready project context',
        inputSchema: {
          type: 'object',
          properties: {
            depth: {
              type: 'string',
              enum: ['short', 'normal'],
              description: 'Context depth (default: normal)',
            },
            include_recent_activity: {
              type: 'boolean',
              description: 'Include recent git activity (default: true)',
            },
            recent_commits: {
              type: 'number',
              description: 'Number of recent commits to include (default: 30)',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
          },
        },
      },
      {
        name: 'brain_capture_note',
        description: 'Capture a note about the project',
        inputSchema: {
          type: 'object',
          properties: {
            note: {
              type: 'string',
              description: 'Note content',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization (e.g., decision, unknown, milestone)',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
          },
          required: ['note'],
        },
      },
      {
        name: 'brain_record_progress',
        description: 'Record development progress, decisions, or milestone signals',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['progress', 'decision', 'milestone'],
              description: 'Type of record to create',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
            progress: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                confidence: { type: 'string', enum: ['low', 'mid', 'high'] },
              },
            },
            decision: {
              type: 'object',
              properties: {
                decision: { type: 'string' },
                reason: { type: 'string' },
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
        description: 'Estimate progress percentage for milestones with explainable reasoning',
        inputSchema: {
          type: 'object',
          properties: {
            milestone_name: {
              type: 'string',
              description: 'Optional: estimate specific milestone only',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
            recent_commits: {
              type: 'number',
              description: 'Number of commits to analyze (default: 50)',
            },
          },
        },
      },
      {
        name: 'brain_suggest_actions',
        description: 'Generate prioritized next action recommendations based on project state',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of actions to return (default: 5)',
            },
            filter_by_milestone: {
              type: 'string',
              description: 'Optional: filter by milestone name',
            },
            repo_path: {
              type: 'string',
              description: 'Optional repository path',
            },
            recent_commits: {
              type: 'number',
              description: 'Number of commits to analyze (default: 50)',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'brain_init': {
        const result = await projectInit(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_analyze': {
        const result = await brainAnalyze(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_recent_activity': {
        const result = await projectRecentActivity(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_context': {
        const result = await projectContext(args as any);
        return {
          content: [
            {
              type: 'text',
              text: result.context_text,
            },
          ],
        };
      }
      case 'brain_record_progress': {
        const result = await recordProgress(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_capture_note': {
        const result = await projectCaptureNote(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_estimate_progress': {
        const result = await estimateMilestoneProgressTool(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'brain_suggest_actions': {
        const result = await suggestNextActionsTool(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Project Brain MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
