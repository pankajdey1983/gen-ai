# PR Strategy Templates

The Azure DevOps MCP Server now includes PR strategy templates to help guide code reviews with structured prompts and best practices.

## Overview

PR strategy templates provide helpful review prompts that guide hosts through different types of pull request reviews. Templates are stored in `.pd/pr-templates.md` and can be customized to match your team's review practices.

## Available Tools

### 1. `list_pr_strategy_templates`

List all available templates with their names and categories.

```json
{
  "name": "list_pr_strategy_templates"
}
```

**Example Response:**
```
Available PR Strategy Templates:

- **Comprehensive Code Review** (General Review)
- **Quick Feature Review** (Feature Review)
- **Bug Fix Review** (Bug Fix)
- **Refactoring Review** (Refactoring)
- **Architecture Review** (Architecture)
```

### 2. `get_pr_strategy_template`

Get a specific template by name to use during PR review.

```json
{
  "name": "get_pr_strategy_template",
  "arguments": {
    "name": "Bug Fix Review"
  }
}
```

**Example Response:**
```markdown
# Bug Fix Review

**Category:** Bug Fix

**Prompt:**

When reviewing this bug fix:

1. **Root Cause** - Does the fix address the actual root cause?
2. **Side Effects** - Could this fix introduce new issues?
3. **Regression** - Are there tests to prevent regression?
4. **Similar Issues** - Are there similar bugs elsewhere?
5. **Documentation** - Is the fix documented for future reference?
```

### 3. `get_pr_strategy_templates`

Get all templates in the complete markdown file format.

```json
{
  "name": "get_pr_strategy_templates"
}
```

### 4. `add_pr_strategy_template`

Add a new custom template for your specific review needs.

```json
{
  "name": "add_pr_strategy_template",
  "arguments": {
    "name": "Security Review",
    "category": "Security",
    "description": "Template for reviewing security-sensitive changes",
    "prompt": "When reviewing for security:\n\n1. **Authentication & Authorization** - Are access controls properly implemented?\n2. **Input Validation** - Is all user input validated and sanitized?\n3. **Data Protection** - Is sensitive data encrypted?\n4. **Dependencies** - Are dependencies up to date and secure?\n5. **Logging** - Are security events properly logged?"
  }
}
```

### 5. `update_pr_templates_file`

Replace the entire templates file with new content.

```json
{
  "name": "update_pr_templates_file",
  "arguments": {
    "content": "# PR Review Strategy Templates\n\n..."
  }
}
```

## Default Templates

The system comes with these pre-configured templates:

### Comprehensive Code Review
A thorough checklist covering code quality, functionality, performance, testing, security, and documentation.

### Quick Feature Review
A focused review for new features, covering completeness, integration, UX, error handling, and testing.

### Bug Fix Review
Guidance for reviewing bug fixes, ensuring root cause is addressed and regression is prevented.

### Refactoring Review
Checklist for code refactoring, verifying behavioral consistency and improvement without breaking changes.

### Architecture Review
Strategic review for architectural changes, considering design patterns, scalability, and maintainability.

## Workflow Example

When a host wants to review a PR, they can:

1. **List available templates:**
   ```
   Use tool: list_pr_strategy_templates
   ```

2. **Select appropriate template:**
   ```
   Use tool: get_pr_strategy_template with name "Bug Fix Review"
   ```

3. **Get the template prompt:**
   The system returns a structured prompt to guide the review

4. **Review the PR using the guidance:**
   Use the prompt to systematically review the code changes

5. **Provide feedback:**
   Leave comments addressing each point in the template

## Customization

Teams can customize templates by:

1. **Adding new templates** for specific scenarios (e.g., API changes, database migrations)
2. **Modifying existing templates** to match team standards
3. **Organizing by category** (Security, Performance, Compliance, etc.)

## Benefits

- **Consistency:** Ensures all PRs are reviewed with the same thoroughness
- **Guidance:** Helps reviewers know what to look for
- **Efficiency:** Structured approach saves time
- **Knowledge Sharing:** Encodes team best practices
- **Onboarding:** Helps new team members learn review standards

## Template Structure

Each template includes:

- **Name:** Descriptive title
- **Category:** Type of review
- **Description:** When to use this template (optional)
- **Prompt:** Structured guidance for the review
- **Date Added:** Tracking when added

## Integration with Other Tools

Templates work seamlessly with other MCP tools:

- Use `get_pr_changes` to see what changed
- Use `get_pr_comments` to see existing feedback
- Use `get_coding_patterns` to check against standards
- Use templates to guide your review strategy

## Best Practices

1. **Choose the right template** - Match template to PR type
2. **Customize as needed** - Adjust prompts for your context
3. **Keep templates updated** - Evolve with team practices
4. **Share knowledge** - Add templates when patterns emerge
5. **Be thorough but practical** - Balance depth with efficiency

## File Location

Templates are stored in: `.pd/pr-templates.md`

This file is automatically created on first use with default templates and can be manually edited or updated via the MCP tools.
