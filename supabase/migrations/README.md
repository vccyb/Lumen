# Supabase 数据库迁移

本目录包含 Supabase 数据库架构的迁移文件。

## 迁移文件

### 001_initial_schema.sql
创建所有核心表：
- `milestones` - 人生节点
- `milestone_tags` - 节点标签
- `wealth_records` - 财富记录
- `life_goals` - 人生目标
- `goal_milestones` - 目标与节点关联
- `projects` - 项目作品
- `project_tech_stack` - 项目技术栈
- `project_links` - 项目链接

## 如何执行迁移

### 方法 1: 使用 Supabase Dashboard
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 SQL Editor
4. 复制 `001_initial_schema.sql` 的内容
5. 粘贴并执行

### 方法 2: 使用 Supabase CLI
```bash
# 安装 Supabase CLI（如果未安装）
npm install -g supabase

# 链接项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

## 迁移后验证

执行迁移后，在 SQL Editor 中运行以下查询验证：

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 检查索引
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 回滚

如需回滚，可以删除所有表：

```sql
-- ⚠️ 警告：此操作不可逆！
DROP TABLE IF EXISTS project_links CASCADE;
DROP TABLE IF EXISTS project_tech_stack CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS goal_milestones CASCADE;
DROP TABLE IF EXISTS life_goals CASCADE;
DROP TABLE IF EXISTS wealth_records CASCADE;
DROP TABLE IF EXISTS milestone_tags CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
```
