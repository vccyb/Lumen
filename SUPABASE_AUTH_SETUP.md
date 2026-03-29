# 🔐 Supabase Auth + RLS 完整配置指南

## 📋 概述

本指南将帮助你：
1. ✅ 配置Supabase Auth（已自动配置）
2. ✅ 设置Row Level Security (RLS)策略
3. ✅ 确保每个用户只能访问自己的数据

---

## 🎯 用户隔离策略

**核心原则**: 每个用户只能看到和操作自己的数据

**实现方式**: RLS策略使用 `auth.uid()` 来过滤数据

---

## 📝 在Supabase Dashboard中执行以下步骤

### 步骤1: 确认Auth已启用

1. 访问 https://supabase.com/dashboard
2. 选择你的项目：**gmclfzpbyhstyefjymrx**
3. 左侧菜单 → **Authentication**
4. 确认 **Email Auth** 已启用 ✅

### 步骤2: 为每个表创建RLS策略

打开 **SQL Editor**，依次执行以下SQL：

#### 1. milestones表

```sql
-- 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON milestones;

-- 创建新的RLS策略
CREATE POLICY "Users can view own milestones"
  ON milestones
  FOR SELECT
  TO anon
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own milestones"
  ON milestones
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own milestones"
  ON milestones
  FOR UPDATE
  TO anon
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own milestones"
  ON milestones
  FOR DELETE
  TO anon
  USING (user_id = auth.uid()::text);
```

#### 2. wealth_records表

```sql
DROP POLICY IF EXISTS "Users can view own wealth_records" ON wealth_records;
DROP POLICY IF EXISTS "Users can insert own wealth_records" ON wealth_records;
DROP POLICY IF EXISTS "Users can update own wealth_records" ON wealth_records;
DROP POLICY IF EXISTS "Users can delete own wealth_records" ON wealth_records;

CREATE POLICY "Users can view own wealth_records"
  ON wealth_records
  FOR SELECT
  TO anon
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own wealth_records"
  ON wealth_records
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own wealth_records"
  ON wealth_records
  FOR UPDATE
  TO anon
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own wealth_records"
  ON wealth_records
  FOR DELETE
  TO anon
  USING (user_id = auth.uid()::text);
```

#### 3. life_goals表

```sql
DROP POLICY IF EXISTS "Users can view own life_goals" ON life_goals;
DROP POLICY IF EXISTS "Users can insert own life_goals" ON life_goals;
DROP POLICY IF EXISTS "Users can update own life_goals" ON life_goals;
DROP POLICY IF EXISTS "Users can delete own life_goals" ON life_goals;

CREATE POLICY "Users can view own life_goals"
  ON life_goals
  FOR SELECT
  TO anon
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own life_goals"
  ON life_goals
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own life_goals"
  ON life_goals
  FOR UPDATE
  TO anon
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own life_goals"
  ON life_goals
  FOR DELETE
  TO anon
  USING (user_id = auth.uid()::text);
```

#### 4. projects表

```sql
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO anon
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO anon
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO anon
  USING (user_id = auth.uid()::text);
```

### 步骤3: 验证RLS已启用

在SQL Editor中运行：

```sql
-- 检查RLS状态
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('milestones', 'wealth_records', 'life_goals', 'projects');

-- 应该看到所有表的 rowsecurity = true
```

### 步骤4: 查看已创建的策略

```sql
-- 查看所有策略
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🔄 完整工作流程

### 用户注册和登录流程

```
1. 用户访问 /auth/signup
   ↓
2. 填写邮箱和密码
   ↓
3. Supabase Auth创建用户账户
   ↓
4. 用户收到确认邮件
   ↓
5. 用户点击邮件链接确认
   ↓
6. 用户访问 /auth/login 登录
   ↓
7. Supabase Auth返回 session 和 user.id
   ↓
8. 前端保存session到localStorage
   ↓
9. 所有API请求自动携带session
   ↓
10. RLS策略使用 auth.uid() 过滤数据
   ↓
11. 用户只能看到和操作自己的数据 ✅
```

---

## 🧪 测试步骤

### 1. 注册测试用户

```
1. 访问 http://localhost:3000/auth/signup
2. 输入邮箱: test@example.com
3. 输入密码: password123
4. 点击注册
```

### 2. 在Supabase Dashboard中确认邮箱

```
1. Authentication → Users
2. 找到 test@example.com
3. 点击 "Confirm" 按钮（手动跳过邮件验证）
```

### 3. 登录测试

```
1. 访问 http://localhost:3000/auth/login
2. 输入邮箱和密码
3. 点击登录
4. 应该重定向到 /dashboard
```

### 4. 创建数据测试

```
1. 访问 /timeline
2. 点击"新增人生节点"
3. 填写表单并提交
4. 应该成功创建 ✅
```

### 5. 验证用户隔离

```
1. 打开浏览器无痕窗口
2. 注册另一个账号: test2@example.com
3. 登录后访问 /timeline
4. 应该看不到第一个用户创建的数据 ✅
```

---

## 📊 数据库字段说明

所有表都有 `user_id` 字段：

```sql
-- milestones表
user_id TEXT NOT NULL,
-- 其他字段...

-- wealth_records表
user_id TEXT NOT NULL,
-- 其他字段...

-- life_goals表
user_id TEXT NOT NULL,
-- 其他字段...

-- projects表
user_id TEXT NOT NULL,
-- 其他字段...
```

**重要**: `user_id` 的类型是 `TEXT`，因为 Supabase Auth 的 `auth.uid()` 返回 UUID，需要转换为字符串进行比较。

---

## ⚠️ 常见问题

### Q: 为什么使用 `auth.uid()::text` 而不是 `auth.uid()`?

A: 因为表的 `user_id` 字段是 TEXT 类型，而 `auth.uid()` 返回 UUID 类型，需要类型转换才能比较。

### Q: 登录后还是401错误怎么办?

A: 检查以下几点：
1. 确认RLS策略已正确创建
2. 确认user_id字段值不为NULL
3. 在浏览器Console中查看user.id的值
4. 在Supabase Dashboard中查看实际存储的user_id值

### Q: 如何查看当前用户的ID?

A: 在浏览器Console中运行：

```javascript
window.supabase.auth.getSession().then(({ data }) => {
  console.log('User ID:', data.session?.user?.id);
});
```

或者在代码中：

```typescript
const { user } = useAuth();
console.log('User ID:', user?.id);
```

---

## 🚀 下一步

配置完成后：

1. ✅ 用户可以注册/登录
2. ✅ 用户可以创建自己的数据
3. ✅ 用户只能看到自己的数据（RLS保护）
4. ✅ 数据完全隔离，安全可靠

**生产环境建议**：
- 启用邮箱确认（Email Confirmation）
- 添加更多OAuth提供商（Google, GitHub等）
- 实现密码重置功能
- 添加双因素认证（2FA）

---

**配置完成后，你的应用将具有完整的用户认证和数据隔离功能！** 🎉
