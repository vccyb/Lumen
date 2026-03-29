# 🎯 Supabase 数据库迁移指南

## ✅ 连接测试成功

您的 Supabase 配置已验证成功：
- **项目 URL**: https://gmclfzpbyhstyefjymrx.supabase.co
- **状态**: 活跃且可访问
- **认证**: API key 有效

## 📋 数据库迁移步骤

### 方法 1：通过 Supabase Dashboard（推荐，5分钟）

1. **打开 SQL Editor**
   - 访问：https://supabase.com/dashboard/project/gmclfzpbyhstyefjymrx/sql
   - 或者：Dashboard → SQL Editor

2. **执行迁移**
   - 点击 "New query"
   - 打开文件：`supabase/migrations/001_initial_schema.sql`
   - 复制全部内容（311 行）
   - 粘贴到 SQL Editor
   - 点击 "Run" ▶️

3. **验证迁移**
   在 SQL Editor 中运行：
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE';
   ```

   应该看到以下表：
   - goal_milestones
   - life_goals
   - milestone_tags
   - milestones
   - project_links
   - project_tech_stack
   - projects
   - wealth_records

### 方法 2：使用 Supabase CLI（高级用户）

```bash
# 安装 Supabase CLI（如果未安装）
npm install -g supabase

# 链接项目
supabase link --project-ref gmclfzpbyhstyefjymrx

# 执行迁移
supabase db push
```

## 📊 迁移内容

迁移将创建 **8 个核心表**：

| 表名 | 用途 | 记录数限制 |
|------|------|-----------|
| `milestones` | 人生节点 | 无限制 |
| `milestone_tags` | 节点标签 | 无限制 |
| `wealth_records` | 财富记录 | 无限制 |
| `life_goals` | 人生目标 | 无限制 |
| `goal_milestones` | 目标关联 | 无限制 |
| `projects` | 项目作品 | 无限制 |
| `project_tech_stack` | 技术栈 | 无限制 |
| `project_links` | 项目链接 | 无限制 |

**特性**：
- ✅ Row Level Security (RLS) - 用户数据隔离
- ✅ 自动时间戳 (created_at, updated_at)
- ✅ 软删除 (deleted_at)
- ✅ 全文搜索支持
- ✅ 性能优化索引
- ✅ 数据完整性约束

## ⚠️ 注意事项

1. **RLS 策略** - 迁移后需要配置用户 ID，否则查询返回空
2. **用户认证** - 目前 RLS 使用 `auth.uid()`，需要实现登录功能
3. **数据迁移** - 表创建后，可以导入 mock 数据

## 🔄 迁移后的下一步

迁移成功后，请告诉我，我将：

1. ✅ 生成 TypeScript 类型
2. ✅ 创建数据访问层
3. ✅ 迁移第一个页面（测试连接）
4. ✅ 导入现有 mock 数据

---

**准备好执行迁移了吗？完成后请告诉我结果！** 🚀
