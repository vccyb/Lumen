# Supabase 数据迁移指南（无外键约束版本）

## 📅 文档信息

- **创建时间**: 2026-03-29
- **最后更新**: 2026-03-29
- **解决的问题**: 外键约束导致数据插入失败，数据迁移困难

---

## 🎯 问题描述

### 问题现象
```
ERROR: 23503: insert or update on table "milestones" violates foreign key constraint
DETAIL: Key (user_id)=(xxx) is not present in table "users".
```

### 根本原因
- 数据库表设置了外键约束 `user_id` → `auth.users(id)`
- Supabase的 `auth.users` 是系统表，插入数据受限制
- 外键检查导致每次插入都要验证用户是否存在

### 设计决策
**移除所有外键约束**，原因：
- ✅ 应用层验证足够（RLS策略 + API层）
- ✅ 更灵活，易于测试和迁移
- ✅ 性能更好（无额外查询开销）
- ✅ 符合现代Web应用设计模式

---

## 📋 操作步骤

### 步骤1: 删除所有外键约束

在 Supabase SQL Editor 中运行：

```sql
-- 删除 milestones 表的外键
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_user_id_fkey;

-- 删除 wealth_records 表的外键
ALTER TABLE wealth_records DROP CONSTRAINT IF EXISTS wealth_records_user_id_fkey;

-- 删除 life_goals 表的外键
ALTER TABLE life_goals DROP CONSTRAINT IF EXISTS life_goals_user_id_fkey;

-- 删除 projects 表的外键
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
```

**验证外键已删除**：

```sql
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid::regclass IN ('milestones', 'wealth_records', 'life_goals', 'projects')
  AND contype = 'f';
```

**预期结果**: 无返回行（表示所有外键已删除）

---

### 步骤2: 导入数据

**⚠️ 重要**: 将以下SQL中的 `YOUR_USER_ID` 替换为你的真实Supabase用户ID

获取用户ID方法：
1. 打开 https://supabase.com/dashboard
2. 选择项目 → **Authentication** → **Users**
3. 复制你的用户ID（UUID格式）

#### 2.1 导入 Milestones（4条）

```sql
INSERT INTO milestones (user_id, date, title, description, category, asset_class, status, capital_deployed, emotional_yield, created_at, updated_at)
VALUES
  ('YOUR_USER_ID', '2018-10-15', '第一处居所', '在成都购买第一套房产，90平米两室一厅，为生活奠定基础', 'foundation', 'tangible-shelter', 'completed', 1500000, ARRAY['安全感', '归属感'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('YOUR_USER_ID', '2020-06-01', '加入创业公司', '加入一家AI创业公司，担任技术合伙人，获得股权激励', 'foundation', 'venture-autonomy', 'completed', 0, ARRAY['职业成长', '股权'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('YOUR_USER_ID', '2021-09-10', '投资组合启动', '开始系统化投资，配置股票、基金、保险等多元化资产', 'strategic-asset', 'equities', 'compounding', 100000, ARRAY['财务自由'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('YOUR_USER_ID', '2026-03-29', 'Lumen项目启动', '启动Lumen个人管理系统项目，整合生活与财富管理', 'vision-realized', 'intangible-experiential', 'planned', 0, ARRAY['个人成长', '作品集'], '2025-03-29 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;
```

#### 2.2 导入 WealthRecords（6条）

```sql
INSERT INTO wealth_records (user_id, date, change_amount, change_reason, breakdown, total_assets, created_at, updated_at)
VALUES
  ('YOUR_USER_ID', '2025-01-15', 500000, '初始资产盘点', '{"liquid": 200000, "equities": 300000, "realEstate": 0, "other": 0}'::jsonb, 500000, '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('YOUR_USER_ID', '2025-06-15', 100000, '年中奖发放', '{"liquid": 300000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 700000, '2025-06-15 00:00:00+00', '2025-06-15 00:00:00+00'),
  ('YOUR_USER_ID', '2025-09-20', -80000, '欧洲旅行支出', '{"liquid": 220000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 620000, '2025-09-20 00:00:00+00', '2025-09-20 00:00:00+00'),
  ('YOUR_USER_ID', '2025-12-31', 200000, '年终奖与投资收益', '{"liquid": 350000, "equities": 550000, "realEstate": 1200000, "other": 50000}'::jsonb, 2150000, '2025-12-31 00:00:00+00', '2025-12-31 00:00:00+00'),
  ('YOUR_USER_ID', '2026-02-15', 150000, '股票投资收益', '{"liquid": 500000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2450000, '2026-02-15 00:00:00+00', '2026-02-15 00:00:00+00'),
  ('YOUR_USER_ID', '2026-03-01', -20000, '日常生活支出', '{"liquid": 480000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2430000, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT DO NOTHING;
```

#### 2.3 导入 LifeGoals（3条）

```sql
INSERT INTO life_goals (user_id, title, description, category, progress, status, estimated_cost, created_at, updated_at)
VALUES
  ('YOUR_USER_ID', '财务自由', '被动收入覆盖生活支出，拥有选择的权利', 'financial', 65, 'in-progress', 5000000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('YOUR_USER_ID', '环游世界', '用一年时间环游世界，体验不同文化', 'experiential', 20, 'dreaming', 300000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('YOUR_USER_ID', '出版技术书籍', '分享多年技术积累，帮助更多开发者', 'legacy', 40, 'planning', 50000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;
```

#### 2.4 导入 Projects（3条）

```sql
INSERT INTO projects (user_id, name, description, status, category, progress, featured, start_date, last_updated, created_at, updated_at)
VALUES
  ('YOUR_USER_ID', 'Lumen', '生活与财富管理系统，整合人生目标、财富记录、项目作品', 'active', 'web', 25, true, '2025-01-15', '2026-03-29', '2025-01-15 00:00:00+00', '2026-03-29 00:00:00+00'),
  ('YOUR_USER_ID', 'AI助手', '基于大语言模型的个人智能助手项目', 'planning', 'ai-ml', 10, false, '2025-06-01', '2026-03-20', '2025-06-01 00:00:00+00', '2026-03-20 00:00:00+00'),
  ('YOUR_USER_ID', '智能家居系统', '家庭自动化控制系统，整合灯光、温度、安防', 'archived', 'infrastructure', 80, false, '2024-03-01', '2025-12-15', '2024-03-01 00:00:00+00', '2025-12-15 00:00:00+00')
ON CONFLICT DO NOTHING;
```

---

### 步骤3: 验证数据

```sql
-- 检查各表数据量
SELECT 'milestones' as table_name, COUNT(*) as count FROM milestones
UNION ALL
SELECT 'wealth_records', COUNT(*) FROM wealth_records
UNION ALL
SELECT 'life_goals', COUNT(*) FROM life_goals
UNION ALL
SELECT 'projects', COUNT(*) FROM projects;
```

**预期结果**:

| table_name     | count |
|----------------|-------|
| milestones     | 4     |
| wealth_records | 6     |
| life_goals     | 3     |
| projects       | 3     |

```sql
-- 检查具体数据（示例）
SELECT id, user_id, title, date, status
FROM milestones
ORDER BY date;
```

---

## 🔧 数据完整性保证

移除外键后，数据安全由以下机制保证：

### 1. RLS（Row Level Security）策略

```sql
-- 示例：确保用户只能访问自己的数据
CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. 应用层验证

API层自动注入当前用户ID：

```typescript
// lib/api/milestones.ts
const { data: { user } } = await supabase.auth.getUser();

const milestone = await supabase
  .from('milestones')
  .insert({
    ...data,
    user_id: user.id,  // 自动注入，无需手动指定
  });
```

### 3. 唯一索引（可选）

防止重复数据：

```sql
CREATE UNIQUE INDEX milestones_unique_date ON milestones(user_id, date);
```

---

## 🚨 常见问题

### Q1: 为什么要移除外键？

**A**:
- **灵活性**: 可以随意导入测试数据、清理数据
- **性能**: 每次插入不需要额外查询验证
- **简单**: 减少迁移和测试的复杂度
- **现代设计**: 大型Web应用（如Airbnb、Stripe）都在应用层保证数据完整性

### Q2: 没有外键会不会产生脏数据？

**A**: 不会。RLS策略确保用户只能：
- 查询自己的数据（`auth.uid() = user_id`）
- 插入自己的数据（WITH CHECK）
- 删除自己的数据

应用层验证确保 `user_id` 总是正确的。

### Q3: 如果要重新导入数据怎么办？

**A**: 直接删除并重新插入：

```sql
-- 清空数据
TRUNCATE milestones CASCADE;
TRUNCATE wealth_records CASCADE;
TRUNCATE life_goals CASCADE;
TRUNCATE projects CASCADE;

-- 重新运行步骤2的导入SQL
```

### Q4: 如何确认外键已经全部删除？

**A**: 运行检查SQL：

```sql
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid::regclass IN ('milestones', 'wealth_records', 'life_goals', 'projects')
  AND contype = 'f';
```

如果返回空结果，说明外键已全部删除。

---

## 📚 相关文档

- [Supabase RLS最佳实践](https://supabase.com/docs/guides/auth/row-level-security)
- [应用层验证 vs 数据库约束](https://supabase.com/docs/guides/api/rest/resource-embedding)

---

## ✅ 检查清单

在开始迁移前：
- [ ] 确认Supabase项目已创建
- [ ] 确认已获取用户ID（UUID）

步骤1完成后：
- [ ] 所有外键约束已删除
- [ ] 验证SQL返回空结果

步骤2完成后：
- [ ] 所有数据插入成功（无错误）
- [ ] 数据量验证通过（4+6+3+3=16条）

步骤3完成后：
- [ ] 验证SQL显示正确的数据
- [ ] 可以在Supabase Dashboard的Table Editor中看到数据

---

**文档版本**: v1.0
**适用范围**: Lumen项目数据迁移
**维护者**: Lumen Team
