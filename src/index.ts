#!/usr/bin/env node

/**
 * Azure DevOps MCP Server
 * Provides tools for managing pull request comments and coding patterns
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsService } from './azure-devops-service.js';
import { PatternManager } from './pattern-manager.js';
import { TemplateManager } from './template-manager.js';
import { getConfig } from './config.js';
import { PullRequestComment, CodingPattern, PRStrategyTemplate } from './types.js';
import { promises as fs } from 'fs';

// Initialize services
let azureDevOpsService: AzureDevOpsService;
let patternManager: PatternManager;
let templateManager: TemplateManager;

try {
  const config = getConfig();
  azureDevOpsService = new AzureDevOpsService(config);
  patternManager = new PatternManager();
  templateManager = new TemplateManager();
} catch (error) {
  console.error('Configuration error:', error);
  process.exit(1);
}

// Define MCP tools
const tools: Tool[] = [
  {
    name: 'get_current_pr',
    description:
      'Get the pull request information for a specified branch. Returns PR details including ID, title, status, and URL. If repository is not specified, uses the default repository from environment configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        branchName: {
          type: 'string',
          description: 'Branch name to find PR for (e.g., "feature/my-feature", "development/user/feature-name"). To get current branch: git rev-parse --abbrev-ref HEAD',
        },
        repository: {
          type: 'string',
          description: 'Optional: Repository name in Azure DevOps. If not provided, uses AZURE_DEVOPS_REPOSITORY from environment. To get from git: git config --get remote.origin.url (extract last segment).',
        },
      },
      required: ['branchName'],
    },
  },
  {
    name: 'get_pr_comments',
    description:
      'Get all active comments from a pull request. Returns a list of comments with file paths, line numbers, content, and authors. If repository is not specified, uses the default repository from environment configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        pullRequestId: {
          type: 'number',
          description: 'The pull request ID to get comments from',
        },
        repository: {
          type: 'string',
          description: 'Optional: Repository name in Azure DevOps. If not provided, uses AZURE_DEVOPS_REPOSITORY from environment. To get from git: git config --get remote.origin.url (extract last segment).',
        },
      },
      required: ['pullRequestId'],
    },
  },
  {
    name: 'read_file_content',
    description:
      'Read the content of a file from the workspace. Use this to examine files mentioned in PR comments.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Relative path to the file from workspace root',
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'get_coding_patterns',
    description:
      'Get all coding patterns and standards from the .pd/pattern.md file. Returns the current patterns documented in the project.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_coding_pattern',
    description:
      'Add a new coding pattern or standard to the .pd/pattern.md file. Use this when identifying new patterns from PR comments.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the coding pattern',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the pattern',
        },
        category: {
          type: 'string',
          description: 'Category (e.g., "Error Handling", "Code Style", "Architecture")',
        },
        example: {
          type: 'string',
          description: 'Optional code example demonstrating the pattern',
        },
      },
      required: ['name', 'description', 'category'],
    },
  },
  {
    name: 'update_patterns_file',
    description:
      'Update the entire .pd/pattern.md file with new content. Use this to reorganize or bulk update patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Full markdown content for the pattern file',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'update_pr_comment_status',
    description:
      'Update the status of a pull request comment thread. Use this to mark comments as fixed, resolved, or reactivate them. Useful after addressing reviewer feedback.',
    inputSchema: {
      type: 'object',
      properties: {
        pullRequestId: {
          type: 'number',
          description: 'The pull request ID containing the comment thread',
        },
        threadId: {
          type: 'number',
          description: 'The thread ID to update status for',
        },
        status: {
          type: 'string',
          enum: ['active', 'fixed', 'wontFix', 'closed', 'byDesign', 'pending'],
          description: 'New status for the thread. Common values: "active" (reopen), "fixed" (mark as resolved), "closed" (close thread)',
        },
        repository: {
          type: 'string',
          description: 'Optional: Repository name in Azure DevOps. If not provided, uses AZURE_DEVOPS_REPOSITORY from environment.',
        },
      },
      required: ['pullRequestId', 'threadId', 'status'],
    },
  },
  {
    name: 'get_pr_changes',
    description:
      'Get all file changes (diffs) for a pull request. Returns detailed information about added, modified, deleted, or renamed files. Use this to review code changes for a PR before providing feedback or approving. If repository is not specified, uses the default repository from environment configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        pullRequestId: {
          type: 'number',
          description: 'The pull request ID to get file changes for',
        },
        repository: {
          type: 'string',
          description: 'Optional: Repository name in Azure DevOps. If not provided, uses AZURE_DEVOPS_REPOSITORY from environment.',
        },
      },
      required: ['pullRequestId'],
    },
  },
  {
    name: 'get_pr_strategy_templates',
    description:
      'Get all PR review strategy templates from .pd/pr-templates.md. Returns helpful prompts and guidelines for reviewing pull requests based on different review types (feature, bug fix, refactoring, etc.).',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_pr_strategy_template',
    description:
      'Get a specific PR review strategy template by name. Returns a focused prompt to guide the PR review process.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the template to retrieve (e.g., "Comprehensive Code Review", "Bug Fix Review", "Feature Review")',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_pr_strategy_templates',
    description:
      'List all available PR review strategy template names and categories. Use this to discover what templates are available.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'add_pr_strategy_template',
    description:
      'Add a new PR review strategy template to .pd/pr-templates.md. Use this to create custom review prompts for specific scenarios.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the template',
        },
        description: {
          type: 'string',
          description: 'Brief description of when to use this template',
        },
        prompt: {
          type: 'string',
          description: 'The detailed strategy prompt/guidelines for the review',
        },
        category: {
          type: 'string',
          description: 'Category (e.g., "Feature Review", "Bug Fix", "Security Review", "Performance")',
        },
      },
      required: ['name', 'prompt', 'category'],
    },
  },
  {
    name: 'update_pr_templates_file',
    description:
      'Update the entire .pd/pr-templates.md file with new content. Use this to reorganize or bulk update templates.',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Full markdown content for the PR templates file',
        },
      },
      required: ['content'],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: 'azure-devops-mcp-server',
    version: '1.0.0',
    description: 'Azure DevOps integration for pull request code reviews. Provides PR strategy templates with review prompts, retrieves PR comments and changes, manages coding patterns, and updates comment status. Use this when reviewing code, analyzing PRs, or needing guidance on code review best practices.',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Initialize Azure DevOps service if not already done
    if (!azureDevOpsService) {
      throw new Error('Azure DevOps service not initialized');
    }

    switch (name) {
      case 'get_current_pr': {
        const branchName = args?.branchName as string;
        let repository = args?.repository as string | undefined;
        
        if (!branchName) {
          throw new Error('branchName is required');
        }
        
        // Use default repository from config if not provided
        if (!repository) {
          const defaultConfig = getConfig();
          repository = defaultConfig.repository;
        }
        
        // Update service config with provided repository
        const config = getConfig();
        const serviceWithRepo = new AzureDevOpsService({
          ...config,
          repository,
        });
        
        await serviceWithRepo.initialize();
        const pr = await serviceWithRepo.getPullRequestForBranch(branchName);
        
        if (!pr) {
          return {
            content: [
              {
                type: 'text',
                text: `No active pull request found for branch "${branchName}" in repository "${repository}".`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pr, null, 2),
            },
          ],
        };
      }

      case 'get_pr_comments': {
        const pullRequestId = args?.pullRequestId as number;
        let repository = args?.repository as string | undefined;
        
        if (!pullRequestId) {
          throw new Error('pullRequestId is required');
        }
        
        // Use default repository from config if not provided
        if (!repository) {
          const defaultConfig = getConfig();
          repository = defaultConfig.repository;
        }

        // Update service config with provided repository
        const config = getConfig();
        const serviceWithRepo = new AzureDevOpsService({
          ...config,
          repository,
        });
        
        await serviceWithRepo.initialize();
        const comments = await serviceWithRepo.getActiveComments(pullRequestId);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(comments, null, 2),
            },
          ],
        };
      }

      case 'read_file_content': {
        const filePath = args?.filePath as string;
        if (!filePath) {
          throw new Error('filePath is required');
        }

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          return {
            content: [
              {
                type: 'text',
                text: `File: ${filePath}\n\n${content}`,
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text',
                text: `Error reading file: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'get_coding_patterns': {
        const patterns = await patternManager.readPatterns();
        return {
          content: [
            {
              type: 'text',
              text: patterns,
            },
          ],
        };
      }

      case 'add_coding_pattern': {
        const name = args?.name as string;
        const description = args?.description as string;
        const category = args?.category as string;
        const example = args?.example as string | undefined;

        if (!name || !description || !category) {
          throw new Error('name, description, and category are required');
        }

        const pattern: CodingPattern = {
          name,
          description,
          category,
          example,
          dateAdded: new Date().toISOString().split('T')[0],
        };

        await patternManager.addPattern(pattern);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully added coding pattern: ${name}`,
            },
          ],
        };
      }

      case 'update_patterns_file': {
        const content = args?.content as string;
        if (!content) {
          throw new Error('content is required');
        }

        await patternManager.updatePatterns(content);

        return {
          content: [
            {
              type: 'text',
              text: 'Successfully updated patterns file',
            },
          ],
        };
      }

      case 'update_pr_comment_status': {
        const pullRequestId = args?.pullRequestId as number;
        const threadId = args?.threadId as number;
        const status = args?.status as string;
        let repository = args?.repository as string | undefined;

        if (!pullRequestId) {
          throw new Error('pullRequestId is required');
        }
        if (!threadId) {
          throw new Error('threadId is required');
        }
        if (!status) {
          throw new Error('status is required');
        }

        // Use default repository from config if not provided
        if (!repository) {
          const defaultConfig = getConfig();
          repository = defaultConfig.repository;
        }

        // Map status string to CommentThreadStatus enum
        const statusMap: { [key: string]: number } = {
          'active': 1,      // Active
          'fixed': 2,       // Fixed
          'wontFix': 3,     // Won't Fix
          'closed': 4,      // Closed
          'byDesign': 5,    // By Design
          'pending': 6,     // Pending
        };

        const threadStatus = statusMap[status];
        if (threadStatus === undefined) {
          throw new Error(`Invalid status: ${status}. Valid values are: active, fixed, wontFix, closed, byDesign, pending`);
        }

        // Update service config with provided repository
        const config = getConfig();
        const serviceWithRepo = new AzureDevOpsService({
          ...config,
          repository,
        });

        await serviceWithRepo.initialize();
        await serviceWithRepo.updateThreadStatus(pullRequestId, threadId, threadStatus);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully updated thread ${threadId} status to "${status}" in PR ${pullRequestId}`,
            },
          ],
        };
      }

      case 'get_pr_changes': {
        const pullRequestId = args?.pullRequestId as number;
        let repository = args?.repository as string | undefined;

        if (!pullRequestId) {
          throw new Error('pullRequestId is required');
        }

        // Use default repository from config if not provided
        if (!repository) {
          const defaultConfig = getConfig();
          repository = defaultConfig.repository;
        }

        // Update service config with provided repository
        const config = getConfig();
        const serviceWithRepo = new AzureDevOpsService({
          ...config,
          repository,
        });

        await serviceWithRepo.initialize();
        const changes = await serviceWithRepo.getPullRequestChanges(pullRequestId);

        if (changes.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No file changes found for PR ${pullRequestId} in repository "${repository}".`,
              },
            ],
          };
        }

        // Format changes for display
        let formattedChanges = `File Changes for PR ${pullRequestId}:\n\n`;
        formattedChanges += `Total files changed: ${changes.length}\n\n`;
        
        for (const change of changes) {
          formattedChanges += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          formattedChanges += `📝 ${change.changeType.toUpperCase()}: ${change.path}\n`;
          if (change.originalPath && change.originalPath !== change.path) {
            formattedChanges += `   Original: ${change.originalPath}\n`;
          }
          if (change.diff) {
            formattedChanges += `\n${change.diff}\n`;
          }
          formattedChanges += `\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: formattedChanges,
            },
          ],
        };
      }

      case 'get_pr_strategy_templates': {
        const templates = await templateManager.readTempglates();
        return {
          content: [
            {
              type: 'text',
              text: templates,
            },
          ],
        };
      }

      case 'get_pr_strategy_template': {
        const name = args?.name as string;
        if (!name) {
          throw new Error('name is required');
        }

        const template = await templateManager.getTemplate(name);
        if (!template) {
          return {
            content: [
              {
                type: 'text',
                text: `Template "${name}" not found. Use list_pr_strategy_templates to see available templates.`,
              },
            ],
            isError: true,
          };
        }

        const formattedTemplate = `# ${template.name}

**Category:** ${template.category}
${template.description ? `**Description:** ${template.description}\n` : ''}
**Prompt:**

${template.prompt}`;

        return {
          content: [
            {
              type: 'text',
              text: formattedTemplate,
            },
          ],
        };
      }

      case 'list_pr_strategy_templates': {
        const templates = await templateManager.listTemplates();
        const formatted = templates.map(t => 
          `- **${t.name}** (${t.category})${t.description ? `: ${t.description}` : ''}`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Available PR Strategy Templates:\n\n${formatted}`,
            },
          ],
        };
      }

      case 'add_pr_strategy_template': {
        const name = args?.name as string;
        const description = args?.description as string;
        const prompt = args?.prompt as string;
        const category = args?.category as string;

        if (!name || !prompt || !category) {
          throw new Error('name, prompt, and category are required');
        }

        const template: PRStrategyTemplate = {
          name,
          description: description || '',
          prompt,
          category,
          dateAdded: new Date().toISOString().split('T')[0],
        };

        await templateManager.addTemplate(template);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully added PR strategy template: ${name}`,
            },
          ],
        };
      }

      case 'update_pr_templates_file': {
        const content = args?.content as string;
        if (!content) {
          throw new Error('content is required');
        }

        await templateManager.updateTemplates(content);

        return {
          content: [
            {
              type: 'text',
              text: 'Successfully updated PR templates file',
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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Azure DevOps MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
