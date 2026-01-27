# Coding Patterns and Standards

This file tracks coding patterns, standards, and best practices identified during code reviews.

---

### Error Handling with Try-Catch

**Category:** Error Handling

**Date Added:** 2026-01-21

**Description:**
Always wrap async operations in try-catch blocks to handle potential errors gracefully. Include meaningful error messages and appropriate error propagation.

**Example:**
```typescript
async function fetchData() {
  try {
    const result = await api.getData();
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}
```

### Consistent Naming Conventions

**Category:** Code Style

**Date Added:** 2026-01-21

**Description:**
Use camelCase for variables and functions, PascalCase for classes and types, and UPPER_CASE for constants. Be descriptive with names to improve code readability.

**Example:**
```typescript
const MAX_RETRY_COUNT = 3;
class UserService {}
function getUserById() {}
const userData = {};
```

