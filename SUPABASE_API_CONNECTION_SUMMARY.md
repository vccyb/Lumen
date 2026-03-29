# Supabase API Connection Summary

## 📅 Date: 2026-03-29

## Overview
Connected three additional pages (Wealth, Goals, Projects) to the real Supabase API, following the same pattern as the Timeline page.

## Pages Updated

### 1. `/app/wealth/page.tsx` - Wealth Records Page

**Changes Made:**
- ✅ Added `useEffect` import from React
- ✅ Removed `sampleWealthRecords` import from `lib/data`
- ✅ Added `wealthRecordAPI` import from `@/lib/api/wealth`
- ✅ Added `Loader2` icon import
- ✅ Added `loading` and `error` state variables
- ✅ Added `loadRecords()` function with Supabase API integration
- ✅ Added `useEffect` hook to load data on mount
- ✅ Updated `handleAddMonth()` to call `wealthRecordAPI.create()`
- ✅ Updated `handleAddRecord()` to call `wealthRecordAPI.create()`
- ✅ Updated `handleUpdateRecord()` to call `wealthRecordAPI.update()`
- ✅ Updated `handleDeleteRecord()` to call `wealthRecordAPI.delete()`
- ✅ Added loading spinner UI in hero section
- ✅ Added error message with retry button in hero section

**Field Mappings (camelCase → snake_case):**
```javascript
{
  date: record.date.toISOString(),
  change_amount: record.changeAmount,
  change_reason: record.changeReason,
  breakdown: {
    liquid: record.breakdown.liquid,
    equities: record.breakdown.equities,
    real_estate: record.breakdown.realEstate,
    other: record.breakdown.other,
  },
}
```

---

### 2. `/app/goals/page.tsx` - Life Goals Page

**Changes Made:**
- ✅ Added `useEffect` import from React
- ✅ Removed `sampleLifeGoals` import from `lib/data`
- ✅ Added `lifeGoalAPI` import from `@/lib/api/goals`
- ✅ Added `Loader2` icon import
- ✅ Added `loading` and `error` state variables
- ✅ Added `loadGoals()` function with Supabase API integration
- ✅ Added `useEffect` hook to load data on mount
- ✅ Updated `handleAddGoal()` to call `lifeGoalAPI.create()`
- ✅ Updated `handleUpdateGoal()` to call `lifeGoalAPI.update()`
- ✅ Updated `handleDeleteGoal()` to call `lifeGoalAPI.delete()`
- ✅ Added loading spinner UI in hero section
- ✅ Added error message with retry button in hero section

**Field Mappings (camelCase → snake_case):**
```javascript
{
  title: goal.title,
  description: goal.description,
  category: goal.category,
  target_date: goal.targetDate ? goal.targetDate.toISOString() : null,
  progress: goal.progress,
  estimated_cost: goal.estimatedCost,
  status: goal.status,
  priority: goal.priority || 'medium',
}
```

---

### 3. `/app/projects/page.tsx` - Projects Page

**Changes Made:**
- ✅ Added `useEffect` import from React
- ✅ Removed `sampleProjects` import from `lib/data`
- ✅ Added `projectAPI` import from `@/lib/api/projects`
- ✅ Added `Loader2` icon import
- ✅ Added `loading` and `error` state variables
- ✅ Added `loadProjects()` function with Supabase API integration
- ✅ Added `useEffect` hook to load data on mount
- ✅ Updated `handleAddProject()` to call `projectAPI.create()`
- ✅ Updated `handleUpdateProject()` to call `projectAPI.update()`
- ✅ Updated `handleDeleteProject()` to call `projectAPI.delete()`
- ✅ Added loading spinner UI in hero section
- ✅ Added error message with retry button in hero section

**Field Mappings (camelCase → snake_case):**
```javascript
{
  name: project.name,
  description: project.description,
  long_description: project.longDescription || null,
  status: project.status,
  category: project.category,
  cover_image: project.coverImage || null,
  tech_stack: project.techStack,
  links: project.links,
  start_date: project.startDate.toISOString(),
  last_updated: project.lastUpdated.toISOString(),
  end_date: project.endDate ? project.endDate.toISOString() : null,
  progress: project.progress || null,
  milestones: project.milestones.map(m => ({
    ...m,
    date: m.date.toISOString(),
  })),
  learnings: project.learnings || [],
  emotional_yield: project.emotionalYield || [],
  estimated_hours_invested: project.estimatedHoursInvested || null,
  monthly_cost: project.monthlyCost || null,
  featured: project.featured || false,
}
```

---

## Common Pattern Applied

All three pages now follow this consistent pattern:

### 1. Imports
```typescript
import { useState, useEffect } from 'react';
import { [entity]API } from '@/lib/api/[entity]';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
```

### 2. State Variables
```typescript
const [entities, setEntities] = useState<EntityType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 3. Load Function
```typescript
const loadEntities = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await [entity]API.getAll();

    // Convert date strings to Date objects
    const entitiesWithDates = data.map(item => ({
      ...item,
      // Date conversions
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    })) as EntityType[];

    setEntities(entitiesWithDates);
  } catch (err) {
    console.error('Failed to load entities:', err);
    setError('加载失败，请检查网络连接');
  } finally {
    setLoading(false);
  }
};
```

### 4. useEffect Hook
```typescript
useEffect(() => {
  loadEntities();
}, []);
```

### 5. CRUD Operations
- **Create**: Convert data to snake_case, call `API.create()`, reload data
- **Update**: Convert data to snake_case, call `API.update()`, reload data
- **Delete**: Call `API.delete()`, reload data

### 6. Loading/Error UI
```tsx
{loading && (
  <div className="flex items-center gap-2 text-lumen-text-secondary mt-8">
    <Loader2 className="w-4 h-4 animate-spin" />
    加载中...
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-8">
    {error}
    <Button variant="link" onClick={loadEntities} className="ml-2">
      重试
    </Button>
  </div>
)}
```

---

## Data Transformation

### From Supabase (snake_case) → App State (camelCase)
```typescript
const entitiesWithDates = data.map(item => ({
  ...item,
  date: new Date(item.date),
  targetDate: item.target_date ? new Date(item.target_date) : undefined,
  createdAt: new Date(item.created_at),
  updatedAt: new Date(item.updated_at),
}));
```

### From App State (camelCase) → Supabase (snake_case)
```typescript
const entityData = {
  user_id: 'user-123', // TODO: Get from auth
  date: entity.date.toISOString(),
  change_amount: entity.changeAmount,
  // ... other field mappings
};
```

---

## Utility Functions Preserved

The following utility functions from `lib/data` are still imported and used:
- `formatCurrency()` - Format numbers as CNY currency
- `formatDate()` - Format dates in Chinese locale
- `getWealthRecordWithTotal()` - Calculate total assets from breakdown
- `getProjectStatusLabel()` - Get project status label in Chinese
- `getProjectCategoryLabel()` - Get project category label in Chinese
- `getMilestoneTypeLabel()` - Get milestone type label in Chinese

---

## TODO: Authentication

All pages currently use a hardcoded `user_id: 'user-123'`. This should be replaced with actual authentication:

```typescript
// Current (TODO)
user_id: 'user-123'

// Future implementation
import { useUser } from '@/lib/auth';
const { user } = useUser();
user_id: user.id
```

---

## Verification

All changes have been verified:
- ✅ `useEffect` imported in all three files
- ✅ API modules imported correctly
- ✅ `Loader2` icon imported
- ✅ Load functions present
- ✅ Loading/error UI added
- ✅ CRUD operations updated to use real API
- ✅ Field mappings correctly applied (camelCase ↔ snake_case)
- ✅ Date conversions handled properly

---

## Files Modified

1. `/Users/chenyubo/Project/Lumen/app/wealth/page.tsx`
2. `/Users/chenyubo/Project/Lumen/app/goals/page.tsx`
3. `/Users/chenyubo/Project/Lumen/app/projects/page.tsx`

## Related Files

- `/Users/chenyubo/Project/Lumen/lib/api/wealth.ts` - WealthRecord API
- `/Users/chenyubo/Project/Lumen/lib/api/goals.ts` - LifeGoal API
- `/Users/chenyubo/Project/Lumen/lib/api/projects.ts` - Project API
- `/Users/chenyubo/Project/Lumen/lib/api/base.ts` - Base API class
- `/Users/chenyubo/Project/Lumen/types/index.ts` - TypeScript types
