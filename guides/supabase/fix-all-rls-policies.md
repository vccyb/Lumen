# 修复所有表的RLS UPDATE策略

## 问题
多个表的UPDATE策略缺少`WITH CHECK`子句，导致软删除失败。

## 修复SQL

```sql
-- 修复 milestones 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 修复 wealth_records 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;

CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 修复 life_goals 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can manage own goals" ON life_goals;

CREATE POLICY "Users can manage own goals"
  ON life_goals FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- 修复 projects 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
```

## 验证修复

```sql
-- 检查所有UPDATE策略
SELECT
  tablename,
  policyname,
  CASE
    WHEN with_check IS NOT NULL THEN '✅ OK'
    ELSE '❌ MISSING WITH CHECK'
  END as status
FROM pg_policies
WHERE cmd = 'UPDATE'
  AND tablename IN ('milestones', 'wealth_records', 'life_goals', 'projects');
```

## 应用方法

### 方法1: 使用Supabase Dashboard
1. 访问 https://app.supabase.com/project/[your-project]/sql
2. 复制上面的SQL
3. 点击 "Run"

### 方法2: 使用CLI
```bash
cd /Users/chenyubo/Project/Lumen
psql $DATABASE_URL < fix-all-rls-policies.sql
```
