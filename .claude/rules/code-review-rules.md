# Code Review Rules

## 📋 Mandatory Code Review

**Trigger Conditions** (MUST review):
- ✅ **All architecture changes**
- ✅ **API layer modifications**
- ✅ **Core business logic changes**
- ✅ **New dependencies or libraries**
- ✅ **Performance-sensitive code**
- ✅ **Security-related code**

---

## 🔍 Review Dimensions

### 1. Code Reuse Review
- Check for duplicate code or existing utilities
- Verify no repeated functionality
- Ensure use of shared configurations/constants

### 2. Code Quality Review
- SOLID principles compliance
- DRY (Don't Repeat Yourself) principle
- Testability assessment
- Abstraction leakage check
- Type safety verification

### 3. Efficiency Review
- Unnecessary computations
- Missed concurrency opportunities
- Hot-path bloat
- Memory leaks
- N+1 query patterns

### 4. Architecture Review
- Compliance with project architecture patterns
- Abstraction layer integrity
- Coupling assessment
- Scalability considerations
- Naming conventions

### 5. Security Review
- Exposed sensitive information
- Injection vulnerabilities
- Input validation
- Authentication/authorization issues
- Dependency security

---

## 🚫 Red Lines (Must NOT Violate)

**Forbidden**:
- ❌ Skip architecture change reviews
- ❌ Directly modify code in production
- ❌ Commit code with linting errors
- ❌ Commit code with type errors
- ❌ Introduce unreviewed third-party dependencies
- ❌ Hardcode secrets or sensitive information
- ❌ Violate existing architecture patterns

**Required**:
- ✅ All architecture changes need professional review
- ✅ All API layer modifications need review
- ✅ Use dependency injection, not hard-coded dependencies
- ✅ Shared resources use singleton pattern
- ✅ Error handling doesn't leak implementation details
- ✅ Use type-safe code
- ✅ Write appropriate tests

---

## 📊 Quality Standards

| Dimension | Minimum | Recommended | Excellent |
|-----------|---------|-------------|-----------|
| Code Reuse | ≥3/5 | ≥4/5 | 5/5 |
| Code Quality | ≥3/5 | ≥4/5 | 5/5 |
| Efficiency | ≥3/5 | ≥4/5 | 5/5 |
| Architecture | ≥3/5 | ≥4/5 | 5/5 |
| Security | ≥3/5 | ≥4/5 | 5/5 |

**Passing Standard**: All dimensions ≥ 3/5

---

## 🛠️ Review Process

1. **Code Change** - Make changes in feature branch
2. **Automated Checks** - Run lint, build, tests
3. **Professional Review** - Use `/simplify` for comprehensive review
4. **Architecture Review** - Verify architectural changes are justified
5. **Fix Issues** - Address review findings
6. **Merge** - Merge to main branch

---

## 🎯 Architecture Patterns

### API Layer Pattern
```typescript
// ✅ CORRECT: Use shared client via BaseAPI
import { BaseAPI } from './base';

export class MilestoneAPI extends BaseAPI {
  async getAll() {
    return this.supabase.from('milestones').select('*');
  }
}

// ❌ WRONG: Create own client
export class MilestoneAPI {
  constructor() {
    this.supabase = createClient(url, key);  // Don't do this!
  }
}
```

### Singleton Pattern for Shared Resources
```typescript
// ✅ CORRECT: Shared singleton
let sharedClient = null;
export function getSharedClient() {
  if (!sharedClient) {
    sharedClient = createClient();
  }
  return sharedClient;
}
```

---

## 📚 References

- [Code Review Rules Detail](guides/development/code-review-rules.md)
- [API Architecture Review](guides/supabase/code-review-summary-2026-03-29.md)
- [Refactoring Complete Report](guides/supabase/api-refactoring-complete.md)
