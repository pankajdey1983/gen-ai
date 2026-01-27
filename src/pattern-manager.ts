/**
 * Pattern management service for coding standards
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { CodingPattern } from './types.js';

export class PatternManager {
  private patternFilePath: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.patternFilePath = join(workspaceRoot, '.pd', 'pattern.md');
  }

  /**
   * Ensure the .pd directory exists
   */
  private async ensureDirectory(): Promise<void> {
    const dir = dirname(this.patternFilePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  /**
   * Read all patterns from the pattern.md file
   */
  async readPatterns(): Promise<string> {
    try {
      const content = await fs.readFile(this.patternFilePath, 'utf-8');
      return content;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty template
        return this.getDefaultPatternTemplate();
      }
      throw error;
    }
  }

  /**
   * Append a new pattern to the pattern.md file
   */
  async addPattern(pattern: CodingPattern): Promise<void> {
    await this.ensureDirectory();

    const currentContent = await this.readPatterns();
    const newEntry = this.formatPattern(pattern);

    // If file is empty or just has template, replace it
    if (currentContent === this.getDefaultPatternTemplate()) {
      await fs.writeFile(this.patternFilePath, newEntry, 'utf-8');
    } else {
      // Append to existing content
      await fs.writeFile(
        this.patternFilePath,
        currentContent + '\n\n' + newEntry,
        'utf-8'
      );
    }
  }

  /**
   * Update the entire pattern file
   */
  async updatePatterns(content: string): Promise<void> {
    await this.ensureDirectory();
    await fs.writeFile(this.patternFilePath, content, 'utf-8');
  }

  /**
   * Format a pattern as markdown
   */
  private formatPattern(pattern: CodingPattern): string {
    let formatted = `### ${pattern.name}\n\n`;
    formatted += `**Category:** ${pattern.category}\n\n`;
    formatted += `**Date Added:** ${pattern.dateAdded}\n\n`;
    formatted += `**Description:**\n${pattern.description}\n`;

    if (pattern.example) {
      formatted += `\n**Example:**\n\`\`\`\n${pattern.example}\n\`\`\`\n`;
    }

    return formatted;
  }

  /**
   * Get default pattern template
   */
  private getDefaultPatternTemplate(): string {
    return `# Coding Patterns and Standards

This file tracks coding patterns, standards, and best practices identified during code reviews.

---

`;
  }

  /**
   * Check if pattern file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.patternFilePath);
      return true;
    } catch {
      return false;
    }
  }
}
