# Using PR Strategy Templates - Example Workflow

This document demonstrates practical examples of using PR strategy templates during code review.

## Scenario 1: Reviewing a Bug Fix

### Context
A developer has submitted PR #12345 that fixes a null pointer exception in the authentication service.

### Workflow

**Step 1: Get the appropriate template**
```
Request: Get the Bug Fix Review template

Tool: get_pr_strategy_template
Arguments:
  name: "Bug Fix Review"

Response:
# Bug Fix Review

When reviewing this bug fix:

1. **Root Cause** - Does the fix address the actual root cause?
2. **Side Effects** - Could this fix introduce new issues?
3. **Regression** - Are there tests to prevent regression?
4. **Similar Issues** - Are there similar bugs elsewhere?
5. **Documentation** - Is the fix documented for future reference?
```

**Step 2: Get PR changes**
```
Request: Show me the changes in PR 12345

Tool: get_pr_changes
Arguments:
  pullRequestId: 12345

Response: [Shows file changes with diffs]
```

**Step 3: Review using template guidance**

Following the template checklist:

1. ✅ **Root Cause** - Checked: Fix adds null check before accessing user.profile
2. ⚠️ **Side Effects** - Question: What happens if profile is null in other methods?
3. ❌ **Regression** - Missing: No unit test added for null profile case
4. ⚠️ **Similar Issues** - Need to check: Are there other places accessing user.profile without null check?
5. ✅ **Documentation** - Comment added explaining the edge case

**Step 4: Provide structured feedback**

Based on template review:
- Request: Add unit test for null profile scenario
- Request: Search codebase for similar null access patterns
- Approve: After tests added and similar issues checked

---

## Scenario 2: Reviewing a New Feature

### Context
PR #12346 adds a new dashboard widget for displaying user analytics.

### Workflow

**Step 1: List available templates to choose the right one**
```
Request: List all PR strategy templates

Tool: list_pr_strategy_templates

Response:
- **Comprehensive Code Review** (General Review)
- **Quick Feature Review** (Feature Review) ← This one!
- **Bug Fix Review** (Bug Fix)
- **Refactoring Review** (Refactoring)
- **Architecture Review** (Architecture)
```

**Step 2: Get the Feature Review template**
```
Tool: get_pr_strategy_template
Arguments:
  name: "Quick Feature Review"

Response:
For this feature implementation, focus on:

1. **Feature Completeness** - Does it deliver the requested functionality?
2. **Integration** - How well does it integrate with existing code?
3. **User Experience** - Is the feature intuitive and usable?
4. **Error Handling** - Are failures handled gracefully?
5. **Testing** - Are the key scenarios tested?
```

**Step 3: Review systematically**

1. ✅ **Feature Completeness**
   - Displays user metrics correctly
   - Filtering and date range selection works
   - Export functionality included

2. ✅ **Integration**
   - Uses existing analytics service
   - Follows dashboard widget pattern
   - Compatible with current theme system

3. ⚠️ **User Experience**
   - Looks good but needs loading indicator
   - Empty state message could be clearer

4. ✅ **Error Handling**
   - API failures show user-friendly message
   - Graceful degradation when data unavailable

5. ⚠️ **Testing**
   - Component tests present
   - Missing E2E test for export feature

---

## Scenario 3: Complex Architectural Change

### Context
PR #12347 introduces a new microservice architecture for the notification system.

### Workflow

**Step 1: Get Architecture Review template**
```
Tool: get_pr_strategy_template
Arguments:
  name: "Architecture Review"

Response: [Full architecture review checklist]
```

**Step 2: Combine with patterns**
```
Tool: get_coding_patterns

Response: [Shows established patterns and standards]
```

**Step 3: Deep review with multiple file reads**
```
Tool: read_file_content
Arguments: 
  filePath: "src/services/notification-service.ts"

[Review against template checklist]

Tool: read_file_content
Arguments:
  filePath: "src/config/service-config.ts"

[Continue systematic review]
```

**Step 4: Create custom template for future**

After this review, realize we need a specific template:

```
Tool: add_pr_strategy_template
Arguments:
  name: "Microservice Addition Review"
  category: "Architecture"
  description: "For reviewing new microservice implementations"
  prompt: |
    When reviewing a new microservice:
    
    1. **Service Boundaries** - Is the service scope well-defined?
    2. **API Contract** - Is the API documented and versioned?
    3. **Data Ownership** - Does it own its data store?
    4. **Communication** - Are inter-service calls properly handled?
    5. **Observability** - Logging, metrics, and tracing in place?
    6. **Deployment** - Can it be deployed independently?
    7. **Error Handling** - Circuit breakers and retries configured?
    8. **Testing** - Integration tests with other services?
    9. **Documentation** - Service architecture documented?
    10. **Migration** - Is there a rollout/rollback plan?
```

---

## Scenario 4: Security-Critical Change

### Context
PR #12348 modifies authentication logic and password handling.

### Workflow

**Step 1: Check if security template exists**
```
Tool: list_pr_strategy_templates

Response: [No security-specific template found]
```

**Step 2: Create security review template**
```
Tool: add_pr_strategy_template
Arguments:
  name: "Security Review"
  category: "Security"
  description: "For reviewing security-sensitive code changes"
  prompt: |
    Security-focused review checklist:
    
    1. **Authentication & Authorization**
       - Are credentials properly validated?
       - Is role-based access control correct?
       - No hardcoded credentials or tokens?
    
    2. **Input Validation & Sanitization**
       - All user input validated?
       - SQL injection prevention in place?
       - XSS protection implemented?
    
    3. **Data Protection**
       - Sensitive data encrypted at rest?
       - Secure transmission (HTTPS/TLS)?
       - Proper key management?
    
    4. **Session Management**
       - Secure session handling?
       - Proper timeout configuration?
       - Session fixation prevented?
    
    5. **Error Handling**
       - No sensitive data in error messages?
       - Proper logging without exposing secrets?
    
    6. **Dependencies**
       - No known vulnerabilities in dependencies?
       - Versions up to date?
    
    7. **Code Patterns**
       - Following security best practices?
       - No common security anti-patterns?

Response: Successfully added template
```

**Step 3: Use the new template**
```
Tool: get_pr_strategy_template
Arguments:
  name: "Security Review"

[Perform thorough security review using checklist]
```

---

## Scenario 5: Quick Refactoring Review

### Context
PR #12349 refactors a utility module to improve code organization.

### Workflow

**Step 1: Get Refactoring template**
```
Tool: get_pr_strategy_template
Arguments:
  name: "Refactoring Review"

Response:
For refactoring changes, verify:

1. **Behavioral Consistency** - Does functionality remain unchanged?
2. **Improvement** - Is the code actually improved?
3. **Scope** - Is the refactoring scope appropriate?
4. **Testing** - Are existing tests still passing?
5. **Breaking Changes** - Are there any API changes?
```

**Step 2: Quick verification**

Run through checklist:
- ✅ Run tests - all passing
- ✅ Check API - no breaking changes
- ✅ Review changes - improved readability
- ✅ Scope - reasonable and focused
- ✅ Approve and merge

---

## Key Takeaways

1. **Always start with the right template** - Choose based on PR type
2. **Use templates as checklists** - Don't skip items
3. **Combine with other tools** - Templates + changes + patterns = thorough review
4. **Create custom templates** - When you identify recurring review patterns
5. **Update templates** - Keep them current with team practices
6. **Be systematic** - Templates ensure consistency and completeness

## Template Selection Guide

| PR Type | Recommended Template |
|---------|---------------------|
| New feature | Quick Feature Review |
| Bug fix | Bug Fix Review |
| Refactoring | Refactoring Review |
| Architecture change | Architecture Review |
| General review | Comprehensive Code Review |
| Security change | Security Review (custom) |
| Performance optimization | Create custom template |
| Database migration | Create custom template |
| API changes | Create custom template |

## Pro Tips

💡 **Combine templates** - For complex PRs, use multiple templates

💡 **Save time** - Quick reviews can use simpler templates

💡 **Be thorough** - Critical changes deserve comprehensive templates

💡 **Evolve templates** - Update based on lessons learned

💡 **Share knowledge** - Document team-specific review requirements

💡 **Stay consistent** - Use the same template for similar PR types
