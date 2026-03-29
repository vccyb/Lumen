# RLS 策略问题 - 快速修复指南

## 🚨 问题
Timeline 页面删除报错: `new row violates row-level security policy for table "milestones"`

## 🎯 根本原因
**wealth_records 表的 UPDATE 策略缺少 `WITH CHECK` 子句**

## ✅ 一键修复

### 方法 1: 使用 Supabase CLI（推荐）
```bash
cd /Users/chenyubo/Project/Lumen
supabase db push
```

### 方法 2: 直接执行 SQL
```bash
# 在 Supabase Dashboard SQL Editor 中执行
# 或使用 psql
psql $DATABASE_URL -f supabase/migrations/20260329_fix_rls_update_policies.sql
```

### 方法 3: 手动执行 SQL
```sql
-- 复制到 Supabase Dashboard SQL Editor 执行
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;

CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## ✅ 验证修复
```sql
-- 检查策略状态
SELECT
  tablename,
  policyname,
  CASE
    WHEN with_check IS NOT NULL THEN '✅ OK'
    ELSE '❌ MISSING'
  END as status
FROM pg_policies
WHERE tablename = 'wealth_records' AND cmd = 'UPDATE';
```

**预期结果**: `status = ✅ OK`

## 🧪 测试
1. 打开 Timeline 页面
2. 删除一个里程碑
3. 应该成功，不再报错

## 📄 详细文档
查看完整文档: `/guides/supabase/rls-policy-fix-soft-delete.md`

## 🔍 当前状态
| 表名 | UPDATE 策略状态 | 需要修复 |
|------|----------------|---------|
| milestones | ✅ OK | 否 |
| wealth_records | ❌ MISSING | **是** |
| life_goals | ✅ OK (ALL) | 否 |
| projects | ✅ OK (ALL) | 否 |
