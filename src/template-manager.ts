/**
 * Template Manager for PR Strategy Templates
 * Manages PR review strategy templates in .pd/pr-templates.md
 */

import { promises as fs } from 'fs';
import { PRStrategyTemplate } from './types.js';
import * as path from 'path';

export class TemplateManager {
  private readonly templateFilePath: string;

  constructor() {
    this.templateFilePath = path.join(process.cwd(), '.pd', 'pr-templates.md');
  }

  /**
   * Ensure the .pd directory and templates file exist
   */
  private async ensureTemplateFile(): Promise<void> {
    const dir = path.dirname(this.templateFilePath);
    
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    try {
      await fs.access(this.templateFilePath);
    } catch {
      // Create default template file
      const defaultContent = `# PR Review Strategy Templates

This file contains templates to help guide PR reviews and provide strategic prompts.

## Templates

### Comprehensive Code Review
**Category:** General Review
**Date Added:** ${new Date().toISOString().split('T')[0]}

**Prompt:**
When reviewing this PR, consider the following aspects:

1. **Code Quality & Best Practices**
   - Does the code follow established coding patterns?
   - Are there any code smells or anti-patterns?
   - Is the code readable and maintainable?

2. **Functionality & Logic**
   - Does the implementation match the requirements?
   - Are edge cases handled properly?
   - Are there potential bugs or logical errors?

3. **Performance & Efficiency**
   - Are there any performance concerns?
   - Could any operations be optimized?
   - Are resources properly managed?

4. **Testing & Coverage**
   - Are there adequate tests for new functionality?
   - Do existing tests need updates?
   - Are error scenarios tested?

5. **Security & Safety**
   - Are there any security vulnerabilities?
   - Is input validation adequate?
   - Are sensitive data handled properly?

6. **Documentation & Comments**
   - Is the code properly documented?
   - Are complex algorithms explained?
   - Are API changes documented?

---

### Quick Feature Review
**Category:** Feature Review
**Date Added:** ${new Date().toISOString().split('T')[0]}

**Prompt:**
For this feature implementation, focus on:

1. **Feature Completeness** - Does it deliver the requested functionality?
2. **Integration** - How well does it integrate with existing code?
3. **User Experience** - Is the feature intuitive and usable?
4. **Error Handling** - Are failures handled gracefully?
5. **Testing** - Are the key scenarios tested?

---

### Bug Fix Review
**Category:** Bug Fix
**Date Added:** ${new Date().toISOString().split('T')[0]}

**Prompt:**
When reviewing this bug fix:

1. **Root Cause** - Does the fix address the actual root cause?
2. **Side Effects** - Could this fix introduce new issues?
3. **Regression** - Are there tests to prevent regression?
4. **Similar Issues** - Are there similar bugs elsewhere?
5. **Documentation** - Is the fix documented for future reference?

---

### Refactoring Review
**Category:** Refactoring
**Date Added:** ${new Date().toISOString().split('T')[0]}

**Prompt:**
For refactoring changes, verify:

1. **Behavioral Consistency** - Does functionality remain unchanged?
2. **Improvement** - Is the code actually improved?
3. **Scope** - Is the refactoring scope appropriate?
4. **Testing** - Are existing tests still passing?
5. **Breaking Changes** - Are there any API changes?

---

### Architecture Review
**Category:** Architecture
**Date Added:** ${new Date().toISOString().split('T')[0]}

**Prompt:**
For architectural changes, consider:

1. **Design Patterns** - Are appropriate patterns used?
2. **Scalability** - Will this scale with growth?
3. **Maintainability** - Is the architecture maintainable?
4. **Dependencies** - Are new dependencies justified?
5. **Future Proof** - Does it accommodate future needs?
6. **Documentation** - Is architecture documented?

---

`;
      await fs.writeFile(this.templateFilePath, defaultContent, 'utf-8');
    }
  }

  /**
   * Read all templates from the file
   */
  async readTemplates(): Promise<string> {
    await this.ensureTemplateFile();
    return await fs.readFile(this.templateFilePath, 'utf-8');
  }

  /**
   * Add a new template to the file
   */
  async addTemplate(template: PRStrategyTemplate): Promise<void> {
    await this.ensureTemplateFile();
    const currentContent = await fs.readFile(this.templateFilePath, 'utf-8');

    const newTemplate = `
### ${template.name}
**Category:** ${template.category}
**Date Added:** ${template.dateAdded}
${template.description ? `\n**Description:** ${template.description}\n` : ''}
**Prompt:**
${template.prompt}

---

`;

    await fs.writeFile(this.templateFilePath, currentContent + newTemplate, 'utf-8');
  }

  /**
   * Update the entire templates file
   */
  async updateTemplates(content: string): Promise<void> {
    await this.ensureTemplateFile();
    await fs.writeFile(this.templateFilePath, content, 'utf-8');
  }

  /**
   * Parse templates from the file content
   */
  parseTemplates(content: string): PRStrategyTemplate[] {
    const templates: PRStrategyTemplate[] = [];
    const sections = content.split('---').filter(s => s.trim());

    for (const section of sections) {
      const nameMatch = section.match(/###\s+(.+)/);
      const categoryMatch = section.match(/\*\*Category:\*\*\s+(.+)/);
      const dateMatch = section.match(/\*\*Date Added:\*\*\s+(.+)/);
      const descMatch = section.match(/\*\*Description:\*\*\s+(.+)/);
      const promptMatch = section.match(/\*\*Prompt:\*\*\s+([\s\S]+?)(?=\n---|\n###|$)/);

      if (nameMatch && categoryMatch && promptMatch) {
        templates.push({
          name: nameMatch[1].trim(),
          category: categoryMatch[1].trim(),
          dateAdded: dateMatch ? dateMatch[1].trim() : '',
          description: descMatch ? descMatch[1].trim() : '',
          prompt: promptMatch[1].trim(),
        });
      }
    }

    return templates;
  }

  /**
   * Get a specific template by name
   */
  async getTemplate(name: string): Promise<PRStrategyTemplate | null> {
    const content = await this.readTemplates();
    const templates = this.parseTemplates(content);
    return templates.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * List all template names and categories
   */
  async listTemplates(): Promise<{ name: string; category: string; description: string }[]> {
    const content = await this.readTemplates();
    const templates = this.parseTemplates(content);
    return templates.map(t => ({
      name: t.name,
      category: t.category,
      description: t.description,
    }));
  }
}
