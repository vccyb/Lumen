# 🔧 修复Supabase RLS策略 - 完整指南

## 📋 问题诊断

**症状**：
- ✅ GET请求成功（可以读取数据）
- ❌ POST请求401错误（无法插入数据）

**根本原因**：milestones表的Row Level Security (RLS)策略阻止了匿名用户的INSERT操作。

---

## ✅ 解决方案（3个选项，选择一个）

### 选项1：临时禁用RLS（最快，用于测试）

#### 步骤：
1. 访问 https://supabase.com/dashboard
2. 选择你的项目：gmclfzpbyhstyefjymrx
3. 点击左侧菜单 **SQL Editor**
4. 粘贴并执行以下SQL：

```sql
-- 临时禁用milestones表的RLS
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;

-- 同样处理其他表
ALTER TABLE wealth_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE life_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

5. 点击 **Run** 执行

#### ⚠️ 注意：
- 这会禁用所有行级安全，任何人都可以修改数据
- 仅用于开发/测试环境
- 生产环境**不要使用**

---

### 选项2：添加允许匿名插入的策略（推荐）

#### 步骤：
1. 访问 https://supabase.com/dashboard
2. 选择项目 → **SQL Editor**
3. 为每个表执行以下SQL：

#### milestones表：
```sql
-- 允许匿名用户查看所有数据
CREATE POLICY "Allow anonymous select"
  ON milestones
  FOR SELECT
  TO anon
  USING (true);

-- 允许匿名用户插入数据
CREATE POLICY "Allow anonymous insert"
  ON milestones
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 允许匿名用户更新自己的数据
CREATE POLICY "Allow anonymous update"
  ON milestones
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 允许匿名用户删除数据
CREATE POLICY "Allow anonymous delete"
  ON milestones
  FOR DELETE
  TO anon
  USING (true);
```

#### wealth_records表：
```sql
CREATE POLICY "Allow anonymous select" ON wealth_records FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON wealth_records FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON wealth_records FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON wealth_records FOR DELETE TO anon USING (true);
```

#### life_goals表：
```sql
CREATE POLICY "Allow anonymous select" ON life_goals FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON life_goals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON life_goals FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON life_goals FOR DELETE TO anon USING (true);
```

#### projects表：
```sql
CREATE POLICY "Allow anonymous select" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON projects FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON projects FOR DELETE TO anon USING (true);
```

---

### 选项3：为每个用户设置user_id（生产环境推荐）

如果你想要真正的用户认证：

#### 步骤：
1. 实现Supabase Auth
2. 修改RLS策略使用`auth.uid()`：

```sql
-- 只允许用户查看自己的数据
CREATE POLICY "Users can view own milestones"
  ON milestones
  FOR SELECT
  TO anon
  USING (user_id = auth.uid()::text);

-- 只允许用户插入自己的数据
CREATE POLICY "Users can insert own milestones"
  ON milestones
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid()::text);
```

#### 注意：
- 这需要实现用户登录功能
- 前端需要使用`supabase.auth.getUser()`获取用户信息
- 修改API代码传递真实的`user_id`

---

## 🧪 验证修复

修复后，在浏览器中测试：

1. 打开 http://localhost:3000/timeline
2. 点击"新增人生节点"
3. 填写表单并提交
4. 应该成功创建，刷新页面后数据仍在

或者使用命令行测试：

```bash
# 查看网络请求
agent-browser network requests --method POST

# 应该看到：
# POST https://gmclfzpbyhstyefjymrx.supabase.co/rest/v1/milestones (Fetch) 201
```

---

## 📝 当前状态

**环境变量**：✅ 已配置
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

**API连接**：✅ 正常
- GET请求成功
- Supabase URL正确

**问题**：❌ RLS策略阻止写入

**下一步**：
1. 选择上述3个选项之一
2. 在Supabase Dashboard中执行SQL
3. 重启开发服务器
4. 测试CRUD功能

---

**建议**：开发阶段使用**选项1**（禁用RLS），上线前改用**选项2**或**选项3**。
