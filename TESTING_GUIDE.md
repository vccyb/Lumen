# 🧪 Lumen 完整测试指南

## ✅ 当前状态

### Supabase配置
- ✅ RLS策略已完整配置（所有表的CRUD）
- ✅ 所有表的 `user_id` 字段都是 UUID 类型
- ✅ 现有用户: `13170906656@163.com` (已确认)

### 代码实现
- ✅ AuthContext完整实现
- ✅ 登录/注册页面完成
- ✅ Sidebar显示用户信息
- ✅ Timeline页面使用真实user_id

---

## 📋 测试步骤

### 方法1: 使用现有用户登录

如果你知道 `13170906656@163.com` 的密码：

1. 访问 http://localhost:3000/auth/login
2. 输入邮箱: `13170906656@163.com`
3. 输入密码
4. 点击登录
5. 应该跳转到dashboard

### 方法2: 注册新用户并手动确认

#### 步骤1: 在应用中注册

1. 访问 http://localhost:3000/auth/signup
2. 输入邮箱: `test@example.com`
3. 输入密码: `testpass123`
4. 点击注册
5. 看到"注册成功"提示

#### 步骤2: 在Supabase Dashboard手动确认

1. 访问 https://supabase.com/dashboard
2. 选择项目 → **Authentication** → **Users**
3. 找到 `test@example.com` 用户
4. 点击 **...** → **Confirm email**
5. 或者点击 **Auto Confirm** 按钮

#### 步骤3: 登录测试

1. 访问 http://localhost:3000/auth/login
2. 输入: `test@example.com`
3. 输入: `testpass123`
4. 点击登录

#### 步骤4: 测试CRUD

登录成功后：
1. 访问 /timeline
2. 点击"新增人生节点"
3. 填写表单并提交
4. ✅ 应该成功创建
5. 刷新页面，数据依然存在 ✅

### 方法3: 使用MCP直接创建测试用户

在终端运行以下命令（使用已有的MCP工具）：

```bash
# 创建测试用户（需要通过Supabase Dashboard）
```

**更简单的方法**：直接在Supabase Dashboard中操作：

1. 访问 https://supabase.com/dashboard
2. 项目 → **Authentication** → **Users**
3. 点击 **Add user** 按钮
4. 输入：
   - Email: `test@test.com`
   - Password: `test123456`
   - ✅ 勾选 **Auto Confirm User**
5. 点击 **Create user**

然后使用这个账号登录应用。

---

## 🧪 完整测试流程（推荐）

### 步骤1: 创建测试用户

在Supabase Dashboard中：

1. **Authentication** → **Users**
2. 点击 **Add user**
3. 填写：
   ```
   Email: demo@lumen.test
   Password: demo123456
   ✅ Auto Confirm User (勾选)
   ```
4. 点击 **Create user**

### 步骤2: 测试登录

在浏览器中：

```
1. 访问: http://localhost:3000/auth/login
2. Email: demo@lumen.test
3. Password: demo123456
4. 点击"登录"
5. 应该重定向到 /dashboard ✅
```

### 步骤3: 测试Timeline创建

```
1. 点击左侧"人生叙事"菜单
2. 点击"+ 新增人生节点"
3. 填写表单：
   - 标题: 测试里程碑
   - 描述: 这是一个自动化测试创建的里程碑
   - 类别: 基础建设
   - 资产类别: 有形-住房
   - 资本配置: 100000
   - 情感回报: 测试、验证
4. 点击"添加"
5. ✅ 应该成功创建
6. 刷新页面，数据依然存在 ✅
```

### 步骤4: 测试用户隔离

```
1. 打开无痕/隐私浏览器窗口
2. 访问 http://localhost:3000/auth/signup
3. 注册另一个用户: demo2@lumen.test
4. 登录后访问"人生叙事"
5. ✅ 应该看不到第一个用户创建的数据 ✅
```

---

## 🔍 调试技巧

### 检查用户登录状态

在浏览器Console中运行：

```javascript
// 查看当前用户
window.supabase.auth.getSession().then(({ data }) => {
  console.log('User:', data.session?.user);
  console.log('User ID:', data.session?.user?.id);
});

// 或者使用我们的Hook
const { user } = useAuth();
console.log('User:', user);
```

### 检查RLS策略

在Supabase SQL Editor中：

```sql
-- 查看milestones表的数据和对应的user_id
SELECT
  id,
  user_id,
  title,
  created_at
FROM milestones
ORDER BY created_at DESC;
```

### 检查网络请求

在浏览器中：
1. 打开 **开发者工具** (F12)
2. 切换到 **Network** 标签
3. 筛选 **Fetch/XHR**
4. 查看Supabase请求的返回码

预期看到：
- ✅ GET /milestones → 200 OK
- ✅ POST /milestones → 201 Created (不是401!)

---

## ⚠️ 常见问题

### Q: 登录后显示401错误

A: 检查：
1. 用户邮箱是否已确认
2. RLS策略是否正确创建
3. user_id字段是否正确传递

### Q: 创建数据后刷新就消失

A: 可能原因：
1. user_id未正确保存（检查Supabase数据）
2. RLS策略阻止了读取
3. 前端过滤了其他用户的数据

### Q: 看不到"登录"按钮

A: 检查：
1. AuthProvider是否正确包裹在layout.tsx中
2. 浏览器Console是否有错误
3. 刷新页面

---

## 📊 测试检查清单

- [ ] 能够成功注册新用户
- [ ] 能够成功登录
- [ ] 登录后Sidebar显示用户信息
- [ ] 能够创建里程碑
- [ ] 创建的数据刷新后依然存在
- [ ] 能够编辑自己的数据
- [ ] 能够删除自己的数据
- [ ] 不同用户看不到彼此的数据（隔离测试）

---

## 🚀 快速开始（最快测试方法）

**在Supabase Dashboard中：**

1. Authentication → Users → Add user
   - Email: `a@b.com`
   - Password: `123456`
   - ✅ Auto Confirm

**在浏览器中：**

2. 访问 http://localhost:3000/auth/login
3. 登录: `a@b.com` / `123456`
4. 点击"人生叙事"
5. 创建一个里程碑
6. ✅ 完成！

---

**所有代码和配置已完成，现在就可以测试真实的用户认证和数据隔离功能了！** 🎉
