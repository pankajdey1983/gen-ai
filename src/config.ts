/**
 * Configuration management for Azure DevOps MCP Server
 */

import { AzureDevOpsConfig } from './types.js';

export function getConfig(): AzureDevOpsConfig {
  // Configuration from environment variables only
  const organizationUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const personalAccessToken = process.env.AZURE_DEVOPS_PAT;
  const project = process.env.AZURE_DEVOPS_PROJECT;
  const repository = process.env.AZURE_DEVOPS_REPOSITORY;

  if (!organizationUrl || !personalAccessToken || !project || !repository) {
    throw new Error(
      'Missing required environment variables. Please set:\n' +
      '  - AZURE_DEVOPS_ORG_URL\n' +
      '  - AZURE_DEVOPS_PAT\n' +
      '  - AZURE_DEVOPS_PROJECT\n' +
      '  - AZURE_DEVOPS_REPOSITORY'
    );
  }

  return {
    organizationUrl,
    personalAccessToken,
    project,
    repository,
  };
}
