# Supabase 后端集成 - 快速开始指南

## ✅ 已完成的设置

1. **Supabase 官方 Skills** - 已安装 `supabase-postgres-best-practices` skill
2. **NPM 依赖** - 已安装 `@supabase/supabase-js` 和 `@supabase/ssr`
3. **客户端实例** - 已创建 `lib/supabase/client.ts` 和 `lib/supabase/server.ts`
4. **数据库迁移** - 已创建 `supabase/migrations/001_initial_schema.sql`

## 🚀 接下来的步骤

### 步骤 1: 创建 Supabase 项目（5 分钟）

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织（或创建新组织）
4. 填写项目信息：
   - **Name**: `lumen`（或你喜欢的名称）
   - **Database Password**: 生成强密码并妥善保存
   - **Region**: 选择距离最近的区域（推荐 Singapore 或 Tokyo）
5. 点击 "Create new project" 并等待几分钟（通常 2-3 分钟）

### 步骤 2: 获取 API 密钥（2 分钟）

项目创建完成后：

1. 在左侧菜单点击 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**（类似 `https://xxxxx.supabase.co`）
   - **anon public** key（以 `eyJ...` 开头）
   - **service_role** key（⚠️ 仅用于服务端，切勿泄露）

### 步骤 3: 配置环境变量（1 分钟）

在项目根目录创建 `.env.local` 文件：

```bash
# 复制模板
cp .env.local.example .env.local
```

然后编辑 `.env.local`，填入你的 API 密钥：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 步骤 4: 执行数据库迁移（3 分钟）

**方法 A: 使用 Supabase Dashboard（推荐）**

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 "New query"
3. 打开 `supabase/migrations/001_initial_schema.sql` 文件
4. 复制全部内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 按钮
7. 等待执行完成（应该看到 "Success" 提示）

**方法 B: 使用 Supabase CLI**

```bash
# 安装 CLI（如果未安装）
npm install -g supabase

# 链接项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

### 步骤 5: 验证设置（2 分钟）

在 SQL Editor 中运行以下验证查询：

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- 期望看到以下表：
-- - milestones
-- - milestone_tags
-- - wealth_records
-- - life_goals
-- - goal_milestones
-- - projects
-- - project_tech_stack
-- - project_links
```

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 期望所有表的 rowsecurity 都为 true
```

### 步骤 6: 测试连接（1 分钟）

重启开发服务器：

```bash
npm run dev
```

如果一切正常，应该能够看到应用正常运行，没有 Supabase 连接错误。

## 📝 下一步

数据库设置完成后，接下来的实施步骤：

1. **阶段 2**: 测试简单的数据库查询（读取现有 mock 数据）
2. **阶段 3**: 实现 CRUD 操作（创建、更新、删除）
3. **阶段 4**: 逐个迁移页面（从简单到复杂）
4. **阶段 5**: 添加用户认证
5. **阶段 6**: 迁移现有数据

## 🐛 故障排除

### 问题：环境变量未加载

**解决方案**：
1. 确保 `.env.local` 文件在项目根目录
2. 重启开发服务器：`npm run dev`
3. 检查 `.gitignore` 确保 `.env.local` 不会被提交

### 问题：SQL 迁移失败

**解决方案**：
1. 检查 Supabase 项目状态是否为 "Active"
2. 确认你有足够的权限
3. 逐段执行 SQL，定位错误位置

### 问题：RLS 策略阻止查询

**解决方案**：
1. 在 SQL Editor 中运行：`SELECT auth.uid();` 检查当前用户
2. 临时禁用 RLS 测试：`ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;`
3. 生产环境务必重新启用 RLS

### 问题：TypeScript 类型错误

**解决方案**：
```bash
# 生成数据库类型
supabase gen types typescript --local > lib/database.types.ts

# 如果还没有链接项目
supabase link --project-ref your-project-ref
```

## 🔗 有用的链接

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Next.js 指南](https://supabase.com/docs/guides/getting-started/nextjs)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [项目迁移文件](./supabase/migrations/001_initial_schema.sql)

## 💡 提示

- 在开发过程中，可以使用 Supabase Dashboard 的 **Table Editor** 查看和编辑数据
- 使用 **Logs** 功能调试 SQL 查询
- 定期备份数据库（Database → Backups）
- 生产环境记得启用 [Database Webhooks](https://supabase.com/docs/guides/database/webhooks) 实现实时更新
