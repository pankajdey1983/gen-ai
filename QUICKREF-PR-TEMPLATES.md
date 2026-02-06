# PR Strategy Templates - Quick Reference

## Quick Start

When reviewing a PR, use these commands to get guidance:

```
List all templates:
  list_pr_strategy_templates

Get specific template:
  get_pr_strategy_template with name "Bug Fix Review"
```

## Available Default Templates

1. **Comprehensive Code Review** (General Review)
   - Full checklist for thorough reviews
   - Covers quality, functionality, performance, testing, security, documentation

2. **Quick Feature Review** (Feature Review)
   - Focused review for new features
   - Completeness, integration, UX, error handling, testing

3. **Bug Fix Review** (Bug Fix)
   - Verify root cause is addressed
   - Check for side effects and regression prevention

4. **Refactoring Review** (Refactoring)
   - Ensure behavior is unchanged
   - Verify improvements and no breaking changes

5. **Architecture Review** (Architecture)
   - Validate design patterns and scalability
   - Check maintainability and documentation

## Common Workflows

### For Hosts Reviewing PRs

1. **Check what templates are available:**
   ```
   list_pr_strategy_templates
   ```

2. **Get appropriate template for PR type:**
   ```
   get_pr_strategy_template with name "Feature Review"
   ```

3. **Use the template prompt to guide review:**
   - Follow the checklist in the template
   - Address each point systematically
   - Leave structured feedback

### Adding Custom Templates

```json
{
  "name": "add_pr_strategy_template",
  "arguments": {
    "name": "Database Migration Review",
    "category": "Database",
    "description": "For reviewing database schema changes",
    "prompt": "1. Check migration scripts for rollback\n2. Verify data integrity\n3. Review performance impact\n4. Check for breaking changes"
  }
}
```

## Integration with PR Review

Combine templates with other tools:

```
# Step 1: Get PR changes
get_pr_changes for pullRequestId 12345

# Step 2: Get review template
get_pr_strategy_template with name "Architecture Review"

# Step 3: Read files mentioned in changes
read_file_content for filePath "src/services/auth.ts"

# Step 4: Check against patterns
get_coding_patterns

# Step 5: Leave feedback using template guidance
# (Use template prompts to structure your comments)
```

## Template File Location

- **File:** `.pd/pr-templates.md`
- **Format:** Markdown with structured sections
- **Auto-created:** First time any template tool is used

## Benefits

✓ **Consistency** - Same review quality every time
✓ **Thoroughness** - Don't miss important aspects
✓ **Efficiency** - Structured approach saves time
✓ **Learning** - Templates encode best practices
✓ **Customizable** - Add templates for your needs

## Tips

- Choose the right template for the PR type
- Customize templates to match your team's standards
- Add new templates when patterns emerge
- Update templates as practices evolve
- Keep templates focused and actionable
