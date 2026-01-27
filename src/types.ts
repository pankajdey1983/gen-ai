/**
 * Type definitions for Azure DevOps MCP Server
 */

export interface PullRequestComment {
  id: number;
  content: string;
  filePath: string;
  line?: number;
  author: string;
  status: 'active' | 'fixed' | 'closed';
  threadId: number;
}

export interface PullRequestInfo {
  pullRequestId: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  repository: string;
  status: string;
  createdBy: string;
  url: string;
}

export interface AzureDevOpsConfig {
  organizationUrl: string;
  personalAccessToken: string;
  project: string;
  repository: string ;
}

export interface CommentSuggestion {
  commentId: number;
  filePath: string;
  originalContent: string;
  suggestedFix: string;
  reasoning: string;
}

export interface CodingPattern {
  name: string;
  description: string;
  example?: string;
  category: string;
  dateAdded: string;
}

export interface PullRequestChange {
  changeType: 'add' | 'edit' | 'delete' | 'rename';
  path: string;
  originalPath?: string;
  content?: string;
  diff?: string;
}
