# Supabase RLS 策略修复指南 - 软删除功能

## 📅 文档信息
- **创建时间**: 2026-03-29
- **最后更新**: 2026-03-29
- **解决的问题**: Timeline 页面删除功能报错 "new row violates row-level security policy"
- **影响范围**: milestones, wealth_records 表的软删除操作

---

## 📋 问题描述

### 用户报告的错误
```
Error: new row violates row-level security policy for table "milestones"
```

### 问题现象
- Timeline 页面删除里程碑失败
- Wealth 页面删除财富记录失败
- 错误发生在执行软删除操作时

---

## 🔍 根本原因分析

### 1. 软删除的实现方式
所有 API 的 `delete()` 方法实际执行的是 **UPDATE 操作**：

```typescript
// lib/api/milestones.ts
async delete(id: string): Promise<void> {
  const { error } = await this.supabase
    .from('milestones')
    .update({ deleted_at: new Date().toISOString() })  // UPDATE 操作
    .eq('id', id);
}
```

### 2. RLS 策略的工作机制

**UPDATE 策略有两个检查点**：

| 子句 | 检查时机 | 作用 |
|------|---------|------|
| **USING** | UPDATE **前** | 检查哪些现有行可以被更新 |
| **WITH CHECK** | UPDATE **后** | 检查更新后的行是否满足策略 |

### 3. 问题所在

#### ❌ wealth_records 表（有问题）
```sql
CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id);  -- 只有 USING，缺少 WITH CHECK
```

**执行流程**：
1. ✅ `USING (auth.uid() = user_id)` 通过 - 可以更新这个用户的记录
2. ❌ `WITH CHECK` 默认为 `false` - 更新后的行不满足策略
3. 💥 **策略拒绝更新，抛出错误**

#### ✓ milestones 表（正确）
```sql
CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);  -- 有 WITH CHECK
```

#### ✓ life_goals 和 projects 表（使用 ALL 策略）
```sql
CREATE POLICY "Users can manage own goals"
  ON life_goals FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);  -- 正确
```

---

## 📊 当前 RLS 策略状态

### 检查结果（2026-03-29）

| 表名 | 策略类型 | 策略名称 | WITH CHECK 状态 | 备注 |
|------|---------|---------|----------------|------|
| milestones | UPDATE | Users can update own milestones | ✅ OK | 有 WITH CHECK |
| milestones | DELETE | Users can delete own milestones | ⚠️ N/A | DELETE 不需要 WITH CHECK |
| wealth_records | UPDATE | Users can update own wealth records | ❌ **MISSING** | **需要修复** |
| wealth_records | DELETE | Users can delete own wealth records | ⚠️ N/A | DELETE 不需要 WITH CHECK |
| life_goals | ALL | Users can manage own goals | ✅ OK | 使用 ALL 策略 |
| projects | ALL | Users can manage own projects | ✅ OK | 使用 ALL 策略 |

### 验证 SQL

```sql
-- 检查所有表的 UPDATE/DELETE 策略
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN with_check IS NULL THEN 'MISSING'
    ELSE 'OK'
  END as with_check_status,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename IN ('milestones', 'projects', 'wealth_records', 'life_goals')
  AND cmd IN ('UPDATE', 'DELETE')
ORDER BY tablename, cmd;
```

---

## 🔧 修复方案

### 方案 1：修改 UPDATE 策略（推荐）

#### 对于 wealth_records 表

```sql
-- 1. 删除旧的策略
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;

-- 2. 重新创建策略，添加 WITH CHECK
CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### 对于 milestones 表（如果需要验证）

```sql
-- milestones 应该已经有 WITH CHECK，但如果没有则添加
DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 方案 2：使用 ALL 策略（更简单，推荐用于未来表）

```sql
-- 删除所有单独的策略
DROP POLICY IF EXISTS "Users can view own wealth records" ON wealth_records;
DROP POLICY IF EXISTS "Users can insert own wealth records" ON wealth_records;
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;
DROP POLICY IF EXISTS "Users can delete own wealth records" ON wealth_records;

-- 创建统一的 ALL 策略
CREATE POLICY "Users can manage own wealth records"
  ON wealth_records FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
```

**优点**：
- 代码更简洁
- 与 life_goals 和 projects 表一致
- 未来维护更容易

---

## ✅ 实施步骤

### 步骤 1：创建迁移文件

在 `supabase/migrations/` 目录创建新文件：

```bash
# 文件名格式：YYYYMMDD_description.sql
touch supabase/migrations/20260329_fix_rls_update_policies.sql
```

### 步骤 2：添加修复 SQL

```sql
-- =====================================================
-- 修复 RLS UPDATE 策略 - 添加 WITH CHECK 子句
-- =====================================================
-- 版本: 1.0.0
-- 日期: 2026-03-29
-- 说明: 修复软删除功能的 RLS 策略问题
-- =====================================================

-- 修复 wealth_records 表
DROP POLICY IF EXISTS "Users can update own wealth records" ON wealth_records;

CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 验证 milestones 表（应该已经有 WITH CHECK）
-- 如果没有，则添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'milestones'
    AND policyname = 'Users can update own milestones'
    AND with_check IS NOT NULL
  ) THEN
    DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;

    CREATE POLICY "Users can update own milestones"
      ON milestones FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
```

### 步骤 3：应用迁移

**方法 A：使用 Supabase CLI（推荐）**
```bash
# 本地开发环境
supabase db push

# 或者应用到远程
supabase db push --remote
```

**方法 B：使用 Supabase Dashboard**
1. 访问 https://app.supabase.com/project/[your-project]/database/migrations
2. 点击 "New Migration"
3. 粘贴上面的 SQL
4. 点击 "Apply"

**方法 C：直接执行 SQL（仅用于紧急修复）**
```bash
# 使用 psql
psql $DATABASE_URL -f supabase/migrations/20260329_fix_rls_update_policies.sql
```

### 步骤 4：验证修复

#### 4.1 检查策略是否正确

```sql
-- 验证 UPDATE 策略有 WITH CHECK
SELECT
  tablename,
  policyname,
  cmd,
  with_check IS NOT NULL as has_with_check,
  with_check
FROM pg_policies
WHERE tablename = 'wealth_records'
  AND cmd = 'UPDATE';
```

**预期结果**：
```
tablename      | policyname                        | cmd   | has_with_check | with_check
---------------|-----------------------------------|-------|----------------|--------------------
wealth_records | Users can update own wealth records | UPDATE | true         | (auth.uid() = user_id)
```

#### 4.2 测试软删除功能

在浏览器中测试：
1. 打开 Timeline 页面 (`/timeline`)
2. 点击删除一个里程碑
3. 应该成功删除，不再报错

或使用 Supabase Client 测试：

```typescript
// 测试代码
const { data, error } = await supabase
  .from('milestones')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', 'some-milestone-id');

if (error) {
  console.error('删除失败:', error);
} else {
  console.log('删除成功');
}
```

---

## 🧪 测试清单

### 功能测试

- [ ] Timeline 页面 - 删除里程碑成功
- [ ] Wealth 页面 - 删除财富记录成功
- [ ] Goals 页面 - 删除目标成功（使用 ALL 策略，应该已正常）
- [ ] Projects 页面 - 删除项目成功（使用 ALL 策略，应该已正常）

### 安全测试

- [ ] 用户 A 无法删除用户 B 的记录
- [ ] 用户 A 无法更新用户 B 的记录
- [ ] 未登录用户无法执行任何操作

### 边缘情况

- [ ] 删除后记录不再出现在列表中（软删除）
- [ ] 可以通过 API 恢复已删除的记录（设置 deleted_at = null）
- [ ] 批量删除操作正常工作

---

## 📚 参考资料

### RLS 策略最佳实践

1. **UPDATE 策略必须包含 WITH CHECK**
   ```sql
   -- ✅ 正确
   CREATE POLICY ... ON table FOR UPDATE
   USING (condition)
   WITH CHECK (condition);

   -- ❌ 错误
   CREATE POLICY ... ON table FOR UPDATE
   USING (condition);  -- 缺少 WITH CHECK
   ```

2. **优先使用 ALL 策略**
   ```sql
   -- ✅ 推荐 - 简洁清晰
   CREATE POLICY "Users can manage own data"
   ON table FOR ALL
   USING (auth.uid() = user_id AND deleted_at IS NULL)
   WITH CHECK (auth.uid() = user_id);
   ```

3. **软删除模式**
   - 使用 `deleted_at` 字段而非物理删除
   - 在 `USING` 子句中检查 `deleted_at IS NULL`
   - 在 `WITH CHECK` 子句中**不**检查 `deleted_at`（允许设置为非 null）

### Supabase 文档

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Policy Functions](https://supabase.com/docs/guides/auth/policy-functions)
- [Managing Migrations](https://supabase.com/docs/guides/database/managing-migrations)

---

## 🔍 故障排查

### 问题 1：应用迁移后仍然报错

**可能原因**：
- 缓存问题 - 浏览器或 Supabase 客户端缓存了旧的策略

**解决方案**：
```bash
# 清除 Supabase 客户端缓存
# 在应用中添加
await supabase.auth.refreshSession();

# 或重新登录
await supabase.auth.signOut();
await supabase.auth.signInWithPassword({...});
```

### 问题 2：其他表的删除功能也失败

**检查步骤**：
```sql
-- 检查所有表的 UPDATE 策略
SELECT
  tablename,
  policyname,
  CASE
    WHEN with_check IS NULL THEN '❌ MISSING'
    ELSE '✅ OK'
  END as status
FROM pg_policies
WHERE cmd = 'UPDATE'
ORDER BY tablename;
```

### 问题 3：迁移执行失败

**常见错误**：
- `ERROR: policy "xxx" does not exist` - 使用 `IF EXISTS` 忽略
- `ERROR: must be owner of table xxx` - 需要数据库所有者权限

**解决方案**：
```sql
-- 添加 IF EXISTS 避免错误
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

---

## 📝 变更历史

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
| 2026-03-29 | 1.0.0 | 初始版本 - 诊断 RLS 策略问题 | Claude Code |

---

## ✅ 完成确认

- [x] 诊断问题根本原因
- [x] 提供修复方案
- [x] 创建迁移文件模板
- [x] 提供验证步骤
- [x] 添加故障排查指南
- [ ] 应用迁移到生产环境（待执行）
- [ ] 验证生产环境功能正常（待验证）

---

## 🎯 下一步行动

1. **立即执行**：应用修复迁移（使用步骤 3 中的任一方法）
2. **验证**：按照测试清单验证所有删除功能
3. **监控**：观察生产环境是否还有相关错误
4. **文档**：更新 `001_initial_schema.sql` 确保未来表使用正确的策略
5. **预防**：在 PR review 流程中添加 RLS 策略检查项
