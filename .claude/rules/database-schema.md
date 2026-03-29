# Database Schema Management Rules

## 🎯 Core Principle

**All business table definitions must be stored in SQL migration files. All table structure changes must be implemented by creating new migration files.**

---

## 📋 Specific Rules

### 1. Table Structure Definition

#### ✅ Must Do
- **All table creation, modification, deletion** must be done via SQL files in `supabase/migrations/`
- **Add table**: Create new migration file (e.g., `002_add_projects_table.sql`)
- **Modify table**: Create new migration file (e.g., `003_add_status_column.sql`)
- **Add indexes**: Create new migration file
- **Modify constraints**: Create new migration file
- **Modify RLS policies**: Create new migration file

#### ❌ Must NOT Do
- ❌ Modify production table structure directly in Supabase Dashboard
- ❌ Hardcode table structure in application code
- ❌ Modify table structure without migration file

### 2. TypeScript Type Definition

#### Type Generation Flow
```bash
# 1. Apply migrations to database
supabase db push

# 2. Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts

# 3. Commit both files
git add supabase/migrations/xxx.sql lib/database.types.ts
git commit -m "feat: add new table and update types"
```

#### ⚠️ Important
- **`lib/database.types.ts` is auto-generated**, do not edit manually
- Regenerate type definitions after every table structure change
- If types don't match actual table structure, the types are outdated

### 3. Migration File Naming

#### Naming Format
```
{number}_{description}.sql
```

#### Examples
```
001_initial_schema.sql                  # Initial schema
002_add_projects_table.sql              # Add projects table
003_add_status_column.sql               # Add status column
```

#### Conventions
- Use 3-digit numbers starting from 001
- Use kebab-case for descriptions (lowercase with hyphens)
- Descriptions should clearly explain the change
- Related changes should be in the same migration

### 4. Migration File Structure

#### Standard Template
```sql
-- =====================================================
-- Migration Description
-- =====================================================
-- Version: 1.0.0
-- Date: 2026-03-29
-- Description: Detailed explanation of what this migration does
-- =====================================================

-- Change content here
```

#### Best Practices
- Use comments to separate different operations
- Add `IF EXISTS` or `IF NOT EXISTS` for idempotency
- Add detailed comments explaining the reasoning
- Keep each migration focused on one goal

---

## 🔍 Common Commands

```bash
# View all migrations
supabase migration list

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts

# Reset local database (use with caution!)
supabase db reset

# Inspect current schema
supabase db inspect --local
```

---

## 📚 References

- [Detailed Schema Rules](guides/supabase/database-schema-management-rules.md)
- [Migration Guide](guides/supabase/data-migration-no-foreign-keys.md)
