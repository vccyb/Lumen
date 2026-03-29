# Supabase RLS 策略检查

## 问题：POST 请求返回 401

### 可能原因：
1. milestones表的RLS策略阻止了匿名用户INSERT
2. user_id字段不匹配auth.uid()

### 解决方案：

#### 选项1：禁用RLS（仅用于测试）
```sql
ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
```

#### 选项2：添加允许匿名插入的策略
```sql
CREATE POLICY "Allow anonymous insert"
  ON milestones
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

#### 选项3：使用service role key（服务端）
在服务端API路由中使用service role key

