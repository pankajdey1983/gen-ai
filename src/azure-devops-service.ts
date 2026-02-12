/**
 * Azure DevOps service for managing pull requests and comments
 */

import * as azdev from 'azure-devops-node-api';
import { GitApi } from 'azure-devops-node-api/GitApi.js';
import { 
  GitPullRequest, 
  CommentThread, 
  CommentThreadStatus,
  GitPullRequestIteration,
  VersionControlChangeType 
} from 'azure-devops-node-api/interfaces/GitInterfaces.js';
import { simpleGit, SimpleGit } from 'simple-git';
import { AzureDevOpsConfig, PullRequestInfo, PullRequestComment, PullRequestChange } from './types.js';

export class AzureDevOpsService {
  private gitApi: GitApi | null = null;
  private config: AzureDevOpsConfig;
  private git: SimpleGit;

  constructor(config: AzureDevOpsConfig) {
    this.config = config;
    this.git = simpleGit();
  }

  /**
   * Initialize the Azure DevOps API connection
   */
  async initialize(): Promise<void> {
    try {
      const authHandler = azdev.getPersonalAccessTokenHandler(
        this.config.personalAccessToken
      );
      const connection = new azdev.WebApi(
        this.config.organizationUrl,
        authHandler
      );
      this.gitApi = await connection.getGitApi();
      
      // Test the connection by attempting to get the repository
      try {
        await this.gitApi.getRepository(this.config.repository, this.config.project);
      } catch (error: any) {
        if (error.statusCode === 401 || error.message?.includes('401')) {
          throw new Error(
            '❌ Authentication failed (401 Unauthorized).\n' +
            'Please verify:\n' +
            '1. Your Personal Access Token (PAT) is valid and not expired\n' +
            '2. PAT has "Code (Read & Write)" permissions\n' +
            '3. You have access to the project and repository\n' +
            '4. Organization URL is correct: ' + this.config.organizationUrl
          );
        }
        throw error;
      }
    } catch (error: any) {
      if (error.message?.includes('Authentication failed')) {
        throw error;
      }
      throw new Error('Failed to initialize Azure DevOps API: ' + error.message);
    }
  }

  /**
   * Get the current branch name from the local git repository
   */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  }

  /**
   * Find pull request for a specified branch or current branch
   * @param branchName - Optional branch name. If not provided, uses current Git branch
   */
  async getPullRequestForBranch(branchName?: string): Promise<PullRequestInfo | null> {
    if (!this.gitApi) {
      throw new Error('Azure DevOps API not initialized');
    }

    const branch = branchName || await this.getCurrentBranch();
    const sourceBranch = `refs/heads/${branch}`;

    try {
      // Get all active pull requests
      const pullRequests = await this.gitApi.getPullRequests(
        this.config.repository,
        { sourceRefName: sourceBranch, status: 1 }, // 1 = Active
        this.config.project
      );

      if (pullRequests.length === 0) {
        return null;
      }

      // Return the first matching PR
      const pr = pullRequests[0];
      return {
        pullRequestId: pr.pullRequestId!,
        title: pr.title || '',
        sourceBranch: pr.sourceRefName || '',
        targetBranch: pr.targetRefName || '',
        repository: this.config.repository,
        status: pr.status?.toString() || 'unknown',
        createdBy: pr.createdBy?.displayName || 'Unknown',
        url: `${this.config.organizationUrl}/${this.config.project}/_git/${this.config.repository}/pullrequest/${pr.pullRequestId}`,
      };
    } catch (error: any) {
      if (error.statusCode === 401 || error.message?.includes('401')) {
        throw new Error(
          '❌ Authentication error (401): Your Personal Access Token may be invalid or expired. ' +
          'Please check your PAT in the configuration.'
        );
      }
      if (error.statusCode === 404) {
        throw new Error(
          `❌ Repository not found (404): Could not find repository "${this.config.repository}" in project "${this.config.project}". ` +
          'Please verify the project and repository names are correct.'
        );
      }
      console.error('Error fetching pull request:', error);
      throw new Error(`Failed to get pull request: ${error.message || error}`);
    }
  }

  /**
   * Get all active comments from a pull request
   */
  async getActiveComments(pullRequestId: number): Promise<PullRequestComment[]> {
    if (!this.gitApi) {
      throw new Error('Azure DevOps API not initialized');
    }

    try {
      const threads = await this.gitApi.getThreads(
        this.config.repository,
        pullRequestId,
        this.config.project
      );

      const activeComments: PullRequestComment[] = [];

      for (const thread of threads) {
        // Only process active threads
        if (thread.status !== CommentThreadStatus.Active) {
          continue;
        }

        if (thread.comments && thread.comments.length > 0) {
          for (const comment of thread.comments) {
            if (comment.content) {
              activeComments.push({
                id: comment.id || 0,
                content: comment.content,
                filePath: thread.threadContext?.filePath || '',
                line: thread.threadContext?.rightFileStart?.line,
                author: comment.author?.displayName || 'Unknown',
                status: 'active',
                threadId: thread.id || 0,
              });
            }
          }
        }
      }

      return activeComments;
    } catch (error: any) {
      if (error.statusCode === 401 || error.message?.includes('401')) {
        throw new Error(
          '❌ Authentication error (401): Your Personal Access Token may be invalid or expired.'
        );
      }
      console.error('Error fetching comments:', error);
      throw new Error(`Failed to get comments: ${error.message || error}`);
    }
  }

  /**
   * Get all pull request threads (including resolved)
   */
  async getAllThreads(pullRequestId: number): Promise<CommentThread[]> {
    if (!this.gitApi) {
      throw new Error('Azure DevOps API not initialized');
    }

    return await this.gitApi.getThreads(
      this.config.repository,
      pullRequestId,
      this.config.project
    );
  }

  /**
   * Update a comment thread status
   */
  async updateThreadStatus(
    pullRequestId: number,
    threadId: number,
    status: CommentThreadStatus
  ): Promise<void> {
    if (!this.gitApi) {
      throw new Error('Azure DevOps API not initialized');
    }

    await this.gitApi.updateThread(
      { status },
      this.config.repository,
      pullRequestId,
      threadId,
      this.config.project
    );
  }

  /**
   * Get all file changes (diffs) for a pull request
   */
  async getPullRequestChanges(pullRequestId: number): Promise<PullRequestChange[]> {
    if (!this.gitApi) {
      throw new Error('Azure DevOps API not initialized');
    }

    try {
      // Get the PR iterations to find the changes
      const iterations = await this.gitApi.getPullRequestIterations(
        this.config.repository,
        pullRequestId,
        this.config.project
      );

      if (!iterations || iterations.length === 0) {
        return [];
      }

      // Get changes from the latest iteration
      const latestIteration = iterations[iterations.length - 1];
      const iterationChanges = await this.gitApi.getPullRequestIterationChanges(
        this.config.repository,
        pullRequestId,
        latestIteration.id!,
        this.config.project
      );

      const changes: PullRequestChange[] = [];

      if (iterationChanges.changeEntries) {
        for (const change of iterationChanges.changeEntries) {
          const changeType = this.mapChangeType(change.changeType);
          const changePath = change.item?.path || '';

          // Generate a summary of the change
          const diff = this.generateDiffSummary(change);

          changes.push({
            changeType,
            path: changePath,
            originalPath: change.sourceServerItem,
            diff
          });
        }
      }

      return changes;
    } catch (error: any) {
      if (error.statusCode === 401 || error.message?.includes('401')) {
        throw new Error(
          '❌ Authentication error (401): Your Personal Access Token may be invalid or expired.'
        );
      }
      console.error('Error fetching pull request changes:', error);
      throw new Error(`Failed to get pull request changes: ${error.message || error}`);
    }
  }

  /**
   * Map Azure DevOps change type to our simplified change type
   */
  private mapChangeType(changeType?: VersionControlChangeType): 'add' | 'edit' | 'delete' | 'rename' {
    if (!changeType) return 'edit';
    
    // Azure DevOps uses bit flags for change types
    if (changeType & VersionControlChangeType.Add) return 'add';
    if (changeType & VersionControlChangeType.Delete) return 'delete';
    if (changeType & VersionControlChangeType.Rename) return 'rename';
    if (changeType & VersionControlChangeType.Edit) return 'edit';
    
    return 'edit';
  }

  /**
   * Generate a summary of the change
   */
  private generateDiffSummary(change: any): string {
    const changeType = this.mapChangeType(change.changeType);
    const path = change.item?.path || 'unknown';
    
    let summary = `File: ${path}\nChange Type: ${changeType}\n`;
    
    if (change.sourceServerItem && change.sourceServerItem !== change.item?.path) {
      summary += `Original Path: ${change.sourceServerItem}\n`;
    }
    
    return summary;
  }
}
