# Timeline CRUD 调试指南

## 📅 文档信息
- **创建时间**: 2026-03-29
- **问题**: Timeline 创建/编辑功能测试失败
- **症状**: 模态框正常，表单提交成功，但数据未在列表中显示

---

## 🔍 问题分析

### 测试流程
1. ✅ 登录成功
2. ✅ 访问 /timeline 页面
3. ✅ 点击"新增人生节点"按钮
4. ✅ 模态框打开
5. ✅ 填写表单字段
6. ✅ 提交表单
7. ✅ 模态框关闭
8. ❌ **数据未在列表中显示**

### 可能原因

#### 1. 数据库 RLS 策略问题 (最可能)
- RLS (Row Level Security) 策略可能阻止了数据插入
- 或者插入成功但读取时被过滤掉

#### 2. API 调用失败
- Supabase API 返回错误但未正确显示
- 网络问题

#### 3. 数据刷新问题
- 创建成功但页面未重新加载数据
- `loadMilestones()` 函数未正确执行

#### 4. 用户 ID 问题
- `user_id` 字段可能未正确设置
- 与认证用户 ID 不匹配

---

## 🛠️ 调试步骤

### 步骤 1: 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 尝试手动创建一个里程碑
4. 查看是否有错误消息

**预期输出**:
```javascript
// 如果成功，应该看到：
// Creating milestone: { date: "2026-03-29", title: "...", ... }
// Created milestone: { id: "...", ... }
// Loading milestones...
// Found X milestones
```

**错误示例**:
```javascript
// 如果失败，可能看到：
// Failed to create milestone: Error: Failed to create milestone
// { message: "...", details: "...", hint: "...", code: "23503" }
```

---

### 步骤 2: 检查网络请求

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 筛选 "fetch" 或 "XHR"
4. 尝试创建里程碑
5. 查找 Supabase API 请求

**关键请求**:
- `POST /rest/v1/milestones` - 创建里程碑
- `GET /rest/v1/milestones?...` - 获取里程碑列表

**检查内容**:
- Request Payload - 发送的数据
- Response - 返回的数据或错误
- Status Code - 200 (成功), 400 (客户端错误), 500 (服务器错误)

---

### 步骤 3: 运行测试脚本

使用提供的测试脚本直接测试 API:

```bash
# 安装依赖（如果需要）
npm install --save-dev dotenv

# 运行测试脚本
node test-api.js
```

**预期输出**:
```
🧪 Testing Milestone CRUD operations...

1️⃣ Reading existing milestones...
✅ Found 4 milestones
Sample: { id: '...', title: '第一处居所', ... }

2️⃣ Creating a test milestone...
✅ Created milestone: { id: '...', title: 'E2E Test Milestone', ... }

3️⃣ Reading milestones after creation...
✅ Found 5 milestones (before: 4)
✅ 1 new milestone(s) added

4️⃣ Checking RLS policies...
❌ Failed to read policies (likely permission issue): permission denied for table pg_policies

✅ Test complete!
```

---

### 步骤 4: 检查 Supabase 日志

1. 登录 Supabase Dashboard
2. 选择你的项目
3. 打开 Database > Logs
4. 筛选 "table editor" 或 "api"
5. 尝试创建里程碑
6. 查看日志中的错误

**常见错误**:
- `INSERT permission denied` - RLS 策略问题
- `foreign key constraint` - 外键约束失败
- `null value in column "user_id"` - 缺少必填字段

---

### 步骤 5: 检查 RLS 策略

在 Supabase Dashboard 中:

1. 打开 Database > Tables
2. 选择 `milestones` 表
3. 切换到 RLS policies 标签
4. 检查策略配置

**需要的策略**:
```sql
-- 允许认证用户插入自己的数据
CREATE POLICY "Users can insert their own milestones"
ON milestones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 允许认证用户查看自己的数据
CREATE POLICY "Users can view their own milestones"
ON milestones
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 允许认证用户更新自己的数据
CREATE POLICY "Users can update their own milestones"
ON milestones
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 允许认证用户删除自己的数据
CREATE POLICY "Users can delete their own milestones"
ON milestones
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### 步骤 6: 验证用户认证

在浏览器控制台中运行:

```javascript
// 检查当前用户
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
console.log('User ID:', user?.id);

// 检查会话
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

**预期输出**:
```javascript
// 应该看到有效的用户对象
Current user: {
  id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  email: "13170906656@163.com",
  ...
}
User ID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
Session: { access_token: "...", ... }
```

---

## 🔧 常见问题和解决方案

### 问题 1: RLS 策略阻止插入

**错误消息**:
```
Failed to create milestone: new row violates row-level security policy
```

**解决方案**:
```sql
-- 在 Supabase SQL Editor 中执行
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- 创建插入策略
CREATE POLICY "Users can insert their own milestones"
ON milestones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

---

### 问题 2: user_id 字段为空

**错误消息**:
```
null value in column "user_id" violates not-null constraint
```

**原因**: 前端未正确传递 `user_id`

**解决方案**:
确保在 `handleAddMilestone` 中正确设置:
```typescript
const milestoneData = {
  user_id: user.id, // 确保这个值存在
  // ... 其他字段
};
```

---

### 问题 3: 创建成功但读取失败

**症状**:
- 创建成功（返回 200）
- 但列表中没有显示

**原因**: 读取时的 RLS 策略过于严格

**解决方案**:
```sql
-- 确保读取策略正确
CREATE POLICY "Users can view their own milestones"
ON milestones
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

### 问题 4: 数据类型不匹配

**错误消息**:
```
column "capital_deployed" is of type integer but expression is of type text
```

**解决方案**:
确保传递正确的数据类型:
```typescript
const milestoneData = {
  capital_deployed: Number(formData.get('capitalDeployed')), // 转换为数字
  // 不是: capital_deployed: formData.get('capitalDeployed')
};
```

---

## 📝 调试检查清单

使用此检查清单系统化地排查问题:

- [ ] 浏览器控制台无错误
- [ ] Network 标签显示 API 请求成功 (200)
- [ ] API 响应包含创建的数据
- [ ] `user_id` 字段已正确设置
- [ ] RLS 策略允许当前用户操作
- [ ] 创建后有重新加载数据 (`loadMilestones()`)
- [ ] 数据格式正确（类型、字段）
- [ ] Supabase 日志无错误

---

## 🚀 快速修复命令

### 重置 RLS 策略
```sql
-- 在 Supabase SQL Editor 中执行
DROP POLICY IF EXISTS "Users can insert their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can update their own milestones" ON milestones;
DROP POLICY IF EXISTS "Users can delete their own milestones" ON milestones;

CREATE POLICY "Users can insert their own milestones"
ON milestones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own milestones"
ON milestones
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
ON milestones
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
ON milestones
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 检查用户权限
```javascript
// 在浏览器控制台运行
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
console.log('Email:', user?.email);
```

### 查看所有里程碑
```javascript
// 在浏览器控制台运行
const { data: milestones, error } = await supabase
  .from('milestones')
  .select('*');
console.log('All milestones:', milestones);
console.log('Error:', error);
```

---

## 📊 预期结果

修复后，应该看到:

1. ✅ 创建里程碑时，控制台显示成功消息
2. ✅ Network 标签显示 200 状态码
3. ✅ API 响应包含新创建的里程碑
4. ✅ 页面自动刷新并显示新里程碑
5. ✅ 测试通过

---

## 🔗 相关文件

- **Timeline 页面**: `/Users/chenyubo/Project/Lumen/app/timeline/page.tsx`
- **Milestones API**: `/Users/chenyubo/Project/Lumen/lib/api/milestones.ts`
- **Base API**: `/Users/chenyubo/Project/Lumen/lib/api/base.ts`
- **测试文件**: `/Users/chenyubo/Project/Lumen/e2e/app.spec.ts`
- **测试脚本**: `/Users/chenyubo/Project/Lumen/test-api.js`

---

## 📞 需要帮助？

如果按照此指南仍然无法解决问题:

1. 收集以下信息:
   - 浏览器控制台截图
   - Network 标签截图
   - Supabase 日志
   - 测试脚本输出

2. 检查相关文档:
   - `/guides/supabase/` 目录
   - Supabase 官方文档

3. 查看完整测试报告:
   - `/guides/testing/e2e-test-report-2026-03-29-v2.md`

---

**最后更新**: 2026-03-29 22:40
