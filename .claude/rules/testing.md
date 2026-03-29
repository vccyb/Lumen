# Testing Rules

## 🧪 Testing Requirements

### Current Status
- **Test Framework**: Vitest (configured)
- **Test Command**: `npm run test` or `npm run test:ui`
- **Coverage**: `npm run test:coverage`

---

## 📋 Testing Standards

### 1. Unit Tests
- ✅ Test individual functions and components
- ✅ Mock external dependencies (Supabase, APIs)
- ✅ Test both happy path and error cases
- ✅ Use descriptive test names

### 2. Integration Tests
- ✅ Test API endpoints with real database
- ✅ Test data flow between components
- ✅ Use test database (not production)

### 3. E2E Tests
- ✅ Test critical user workflows
- ✅ Test with browser automation if needed

---

## 🎯 When to Write Tests

### Must Write Tests For
- ✅ All new API endpoints
- ✅ Complex business logic
- ✅ Data transformation functions
- ✅ Utility functions with edge cases

### Can Skip Tests For
- ⚪ Simple UI components (no logic)
- ⚪ Type definitions
- ⚪ Configuration files

---

## 📝 Test Structure

```typescript
// Example test structure
import { describe, it, expect, beforeEach } from 'vitest';
import { MilestoneAPI } from '../lib/api/milestones';

describe('MilestoneAPI', () => {
  let api: MilestoneAPI;

  beforeEach(() => {
    api = new MilestoneAPI();
  });

  describe('getAll', () => {
    it('should return all milestones', async () => {
      const milestones = await api.getAll();
      expect(milestones).toBeDefined();
    });

    it('should filter by category', async () => {
      const milestones = await api.getAll({ category: 'foundation' });
      expect(milestones.every(m => m.category === 'foundation')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error on database failure', async () => {
      // Test error case
    });
  });
});
```

---

## 🧪 Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```typescript
it('should create milestone', async () => {
  // Arrange
  const milestoneData = { title: 'Test', date: '2026-01-01' };

  // Act
  const result = await api.create(milestoneData);

  // Assert
  expect(result.title).toBe('Test');
  expect(result.id).toBeDefined();
});
```

### 2. Mock External Dependencies
```typescript
import { vi } from 'vitest';

vi.mock('../lib/supabase/shared-client', () => ({
  getSharedClient: vi.fn(() => mockClient)
}));
```

### 3. Test Data Management
- ✅ Use test data fixtures
- ✅ Clean up test data after tests
- ✅ Use transactions for database tests
- ✅ Isolate tests from each other

---

## 📊 Coverage Goals

| Component Type | Target Coverage |
|----------------|-----------------|
| API Layer | ≥80% |
| Utilities | ≥90% |
| UI Components | ≥70% |
| Business Logic | ≥85% |

---

## 🚫 Testing Anti-Patterns

### ❌ Don't Do This
- ❌ Test implementation details instead of behavior
- ❌ Test getters and setters
- ❌ Use `any` type in tests
- ❌ Hardcode test data values

### ✅ Do This Instead
- ✅ Test user-facing behavior
- ✅ Test business logic and edge cases
- ✅ Use proper TypeScript types
- ✅ Use test data factories/fixtures

---

## 📚 Related Commands

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- MilestoneAPI
```

---

## 📚 References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
