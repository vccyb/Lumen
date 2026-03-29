# 数据库 Schema 管理规则

## 📅 文档信息
- **创建时间**: 2026-03-29
- **最后更新**: 2026-03-29
- **解决的问题**: 建立数据库schema变更的标准流程，确保表结构定义的单一来源和可追溯性

---

## 🎯 规则概述

### 核心原则
**所有业务表的定义必须存储在 SQL 迁移文件中，所有涉及表结构的改动都必须通过创建新的迁移文件来实现。**

### 为什么需要这个规则？
1. **单一来源**: 表结构定义只在一个地方（迁移文件）维护
2. **版本控制**: 所有schema变更都有历史记录，可追溯、可回滚
3. **环境一致性**: 开发、测试、生产环境的表结构完全一致
4. **团队协作**: 避免不同开发者对表结构有不同的理解
5. **类型安全**: 确保TypeScript类型定义与数据库表结构同步

---

## 📋 具体规则

### 1. 表结构定义规则

#### ✅ 必须做的
- **所有表的创建、修改、删除**都必须通过`supabase/migrations/`目录下的SQL文件完成
- **新增表**: 创建新的迁移文件（如`002_add_projects_table.sql`）
- **修改表**: 创建新的迁移文件（如`003_add_status_column_to_milestones.sql`）
- **删除表**: 创建新的迁移文件（如`004_remove_temp_table.sql`）
- **添加索引**: 创建新的迁移文件
- **修改约束**: 创建新的迁移文件
- **修改RLS策略**: 创建新的迁移文件

#### ❌ 禁止做的
- 禁止直接在Supabase Dashboard中修改生产环境的表结构
- 禁止在应用代码中硬编码表结构
- 禁止在没有迁移文件的情况下修改表结构

### 2. TypeScript类型定义规则

#### 类型生成流程
```bash
# 1. 确保迁移已应用到数据库
supabase db push

# 2. 生成最新的TypeScript类型定义
supabase gen types typescript --local > lib/database.types.ts

# 3. 提交两个文件
git add supabase/migrations/xxx.sql lib/database.types.ts
git commit -m "feat: add new table and update types"
```

#### ⚠️ 重要提醒
- **`lib/database.types.ts`是自动生成的**，不应该手动编辑
- 每次修改表结构后，必须重新生成类型定义
- 如果发现类型定义与实际表结构不符，说明类型定义过期了

### 3. 迁移文件命名规则

#### 命名格式
```
{序号}_{描述}.sql
```

#### 示例
```
001_initial_schema.sql                    # 初始schema
002_add_projects_table.sql                # 新增projects表
003_add_status_column_to_milestones.sql   # 给milestones表添加status字段
004_remove_temp_column.sql                # 删除临时字段
005_add_rls_policies.sql                  # 添加RLS策略
```

#### 命名约定
- 序号使用3位数字，从001开始递增
- 描述使用kebab-case（小写，用连字符分隔）
- 描述应该清晰说明变更内容
- 同一个迁移文件中包含的变更应该是逻辑上相关的

### 4. 迁移文件内容规范

#### 标准结构
```sql
-- =====================================================
-- 迁移描述
-- =====================================================
-- 版本: 1.0.0
-- 日期: 2026-03-29
-- 说明: 详细说明这个迁移做了什么
-- =====================================================

-- 1. 变更内容（按逻辑分组）
-- =====================================================

-- 2. 如果是修改，先回滚之前的更改（如果需要）
-- DROP INDEX IF EXISTS idx_example;

-- 3. 执行新的变更
-- CREATE INDEX idx_example ON table_name(column);

-- 4. 添加适当的注释
-- COMMENT ON COLUMN table_name.column IS '说明';

-- =====================================================
-- 迁移完成
-- =====================================================
```

#### 最佳实践
- 使用注释清晰地分隔不同的操作
- 添加`IF EXISTS`或`IF NOT EXISTS`来保证幂等性
- 对于复杂的变更，添加详细的注释说明原因
- 保持每个迁移文件的变更聚焦在一个目标上

### 5. 开发工作流程

#### 新开发功能的完整流程
```bash
# 1. 创建新的迁移文件
# supabase/migrations/006_add_new_feature.sql

# 2. 在迁移文件中编写SQL
# 定义表结构、索引、约束、RLS策略等

# 3. 应用迁移到本地数据库
supabase db push

# 4. 生成TypeScript类型
supabase gen types typescript --local > lib/database.types.ts

# 5. 编写应用代码，使用生成的类型
# 在lib/api/中实现业务逻辑

# 6. 测试功能
npm run dev

# 7. 提交代码
git add .
git commit -m "feat: add new feature"

# 8. 推送到远程后，应用到生产环境
# 在CI/CD中或手动执行：
supabase db push --linked
```

---

## 🔍 验证检查清单

### 应用迁移前检查
- [ ] 迁移文件已按照命名规范创建
- [ ] 迁移文件内容清晰，有适当的注释
- [ ] 在本地测试过迁移（使用`supabase db push`）
- [ ] 迁移是幂等的（可重复执行）
- [ ] 考虑了回滚方案

### 应用迁移后检查
- [ ] 表结构符合预期
- [ ] 已生成最新的TypeScript类型定义
- [ ] 相关的API代码已更新并测试通过
- [ ] RLS策略正常工作
- [ ] 索引正常创建（检查性能）

### 代码提交前检查
- [ ] 迁移文件已提交
- [ ] `lib/database.types.ts`已更新
- [ ] 应用代码已同步更新
- [ ] 提交信息清晰描述了变更内容

---

## 🛠️ 常用命令

```bash
# 查看所有迁移历史
supabase migration list

# 应用本地迁移到数据库
supabase db push

# 生成TypeScript类型定义
supabase gen types typescript --local > lib/database.types.ts

# 生成ESLint配置
supabase gen types eslint --local > .eslintrc

# 创建新的迁移文件
# 手动创建 supabase/migrations/xxx.sql

# 重置本地数据库（慎用！）
supabase db reset

# 查看当前数据库schema
supabase db inspect --local
```

---

## ❓ 常见问题

### Q: 我可以手动在Supabase Dashboard中修改表结构吗？
**A:** 不可以！所有表结构变更都必须通过迁移文件完成。Dashboard中的修改应该在迁移文件中体现，然后应用迁移。

### Q: 如果我在本地修改了表结构，但是忘了创建迁移文件怎么办？
**A:**
1. 使用`supabase db inspect --local`查看当前表结构
2. 创建新的迁移文件来记录这些变更
3. 如果是测试数据，可以使用`supabase db reset`重置

### Q: TypeScript类型定义和实际表结构不一致怎么办？
**A:**
1. 确保所有迁移都已应用：`supabase migration list`
2. 重新生成类型定义：`supabase gen types typescript --local > lib/database.types.ts`
3. 如果还不一致，检查是否有未记录的schema变更

### Q: 如何回滚一个迁移？
**A:**
1. 创建一个新的迁移文件
2. 在新迁移中编写回滚SQL（DROP、ALTER等）
3. 应用新迁移
4. 重新生成类型定义

**注意**: Supabase的迁移系统不支持自动回滚，需要手动编写回滚SQL。

### Q: 开发团队如何协作？
**A:**
1. 每个开发者在自己的分支上创建迁移
2. 合并PR时注意迁移文件的序号冲突
3. 使用`supabase db reset`定期清理本地开发环境
4. 生成类型定义后提交到仓库

---

## 📚 相关文档

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [CLAUDE.md - 文档规则](../../CLAUDE.md#external-system-integration-guidelines)
- [data-migration-no-foreign-keys.md](./data-migration-no-foreign-keys.md)

---

**最后更新**: 2026-03-29
