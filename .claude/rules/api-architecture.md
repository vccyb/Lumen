# API Architecture Rules

## 🎯 API Layer Architecture

### Mandatory Pattern
**All API classes must extend `BaseAPI` and use the shared Supabase client.**

---

## ✅ Correct Pattern

### API Class Structure
```typescript
// ✅ CORRECT: Extend BaseAPI for shared client
import { BaseAPI } from './base';

export class MilestoneAPI extends BaseAPI {
  async getAll(options?: { ... }): Promise<Milestone[]> {
    // Use inherited this.supabase
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*')
      .is('deleted_at', null);

    if (error) throw this.handleError('milestones', 'fetch', error);
    return data;
  }
}

// Export singleton
export const milestoneAPI = new MilestoneAPI();
```

### Shared Client Pattern
```typescript
// ✅ CORRECT: Use shared singleton
import { getSharedSupabaseClient } from '../supabase/shared-client';

let sharedClient: ReturnType<typeof createClient> | null = null;

export function getSharedClient() {
  if (!sharedClient) {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    sharedClient = createClient(supabaseUrl, supabaseKey);
  }
  return sharedClient;
}
```

### BaseAPI Class
```typescript
// ✅ CORRECT: Abstract base class
export abstract class BaseAPI {
  protected supabase: SupabaseClient;

  constructor() {
    this.supabase = getSharedClient();
  }

  protected handleError(entity: string, operation: string, error: any): never {
    throw new Error(`Failed to ${operation} ${entity}`);
  }
}
```

---

## ❌ Wrong Pattern

### Creating Own Client
```typescript
// ❌ WRONG: Each API creates own client
export class MilestoneAPI {
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
}
```

**Problems**:
- Creates multiple HTTP clients (waste of resources)
- Violates DRY principle (60-70% code duplication)
- Hard to test (cannot mock dependencies)
- Violates dependency inversion principle

---

## 📋 Required Patterns

### 1. API Class Structure
- ✅ Must extend `BaseAPI`
- ✅ No constructor (uses inherited `this.supabase`)
- ✅ Use `this.handleError()` for error handling
- ✅ Export singleton instance

### 2. Error Handling
```typescript
// ✅ Use inherited error handling
if (error) {
  throw this.handleError('milestones', 'fetch', error);
}
```

### 3. Type Safety
- ✅ Use types from `lib/database.types.ts`
- ✅ Use `Database['public']['Tables']['TableName']` types
- ❌ Don't use `as` type assertions excessively

### 4. Query Building
- ✅ Chain query methods
- ✅ Apply filters before ordering
- ✅ Apply limit last
- ✅ Use `.is('deleted_at', null)` for soft delete

---

## 🎯 File Organization

```
lib/
├── api/
│   ├── base.ts              # BaseAPI class
│   ├── milestones.ts         # MilestoneAPI
│   ├── wealth.ts            # WealthRecordAPI
│   ├── goals.ts             # LifeGoalAPI
│   └── projects.ts          # ProjectAPI
├── supabase/
│   └── shared-client.ts     # Shared client singleton
└── database.types.ts        # Auto-generated types
```

---

## 📊 Quality Metrics

After refactoring to use this pattern:
- **Code duplication**: 60-70% → <10%
- **Testability**: 2/10 → 8/10
- **Code quality**: 3.5/10 → 8/10
- **Memory usage**: ~8KB → ~2KB (per 4 API classes)

---

## 📚 References

- [API Refactoring Complete Report](guides/supabase/api-refactoring-complete.md)
- [Code Review Summary](guides/supabase/code-review-summary-2026-03-29.md)
- [Database Schema Rules](./database-schema.md)
