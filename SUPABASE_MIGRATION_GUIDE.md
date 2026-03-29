# 📊 Supabase 数据迁移指南 (方案B: auth.users)

## 🎯 概述

本文档提供了将Lumen项目的mock数据导入到Supabase数据库的完整步骤。

**方案B说明**：直接使用Supabase Auth的 `auth.users` 表，不需要创建额外的 `public.users` 表。
- ✅ 更简单，无需维护额外表
- ✅ 适合个人/家庭应用
- ✅ 未来需要可以再扩展

---

## 📋 操作步骤

### 步骤1: 在Supabase创建用户

1. 打开 https://supabase.com/dashboard
2. 选择你的项目
3. 左侧菜单 → **Authentication** → **Users**
4. 点击 **"Add user"** → **"Create new user"**
5. 填写信息：
   - **Email**: 你的邮箱地址
   - **Password**: 设置密码
   - **Auto Confirm User**: ✅ 勾选
6. 点击 **"Create user"**

7. **重要**: 复制创建的用户ID（UUID格式，例如：`a200df13-39ba-4778-9477-af53e035094a`）

---

### 步骤2: 修改外键约束

打开Supabase **SQL Editor**，运行以下SQL：

```sql
-- ============================================
-- 步骤1: 删除旧的外键约束（如果存在）
-- ============================================
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_user_id_fkey;
ALTER TABLE wealth_records DROP CONSTRAINT IF EXISTS wealth_records_user_id_fkey;
ALTER TABLE life_goals DROP CONSTRAINT IF EXISTS life_goals_user_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- ============================================
-- 步骤2: 重建外键，指向 auth.users
-- ============================================
ALTER TABLE milestones
  ADD CONSTRAINT milestones_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE wealth_records
  ADD CONSTRAINT wealth_records_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE life_goals
  ADD CONSTRAINT life_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE projects
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**✅ 验证外键约束（重要）**:

```sql
-- 检查外键是否指向 auth.users
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid::regclass IN ('auth.users', 'public.users')
ORDER BY conrelid::regclass::text;
```

**预期结果**: 所有行的 `referenced_table` 应该是 `auth.users`

---

### 步骤3: 导入Mock数据

**⚠️ 重要**: 将以下SQL中的所有 `a200df13-39ba-4778-9477-af53e035094a` 替换为你创建的真实用户ID！

在Supabase **SQL Editor** 中运行：

```sql
-- ============================================
-- 步骤3: 导入数据
-- ============================================

-- 插入 Milestones (4条)
INSERT INTO milestones (user_id, date, title, description, category, asset_class, status, capital_deployed, emotional_yield, created_at, updated_at)
VALUES
  ('a200df13-39ba-4778-9477-af53e035094a', '2018-10-15', '第一处居所', '在成都购买第一套房产，90平米两室一厅，为生活奠定基础', 'foundation', 'tangible-shelter', 'completed', 1500000, ARRAY['安全感', '归属感'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2020-06-01', '加入创业公司', '加入一家AI创业公司，担任技术合伙人，获得股权激励', 'foundation', 'venture-autonomy', 'completed', 0, ARRAY['职业成长', '股权'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2021-09-10', '投资组合启动', '开始系统化投资，配置股票、基金、保险等多元化资产', 'strategic-asset', 'equities', 'compounding', 100000, ARRAY['财务自由'], '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2026-03-29', 'Lumen项目启动', '启动Lumen个人管理系统项目，整合生活与财富管理', 'vision-realized', 'intangible-experiential', 'planned', 0, ARRAY['个人成长', '作品集'], '2025-03-29 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 插入 WealthRecords (6条)
INSERT INTO wealth_records (user_id, date, change_amount, change_reason, breakdown, total_assets, created_at, updated_at)
VALUES
  ('a200df13-39ba-4778-9477-af53e035094a', '2025-01-15', 500000, '初始资产盘点', '{"liquid": 200000, "equities": 300000, "realEstate": 0, "other": 0}'::jsonb, 500000, '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2025-06-15', 100000, '年中奖发放', '{"liquid": 300000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 700000, '2025-06-15 00:00:00+00', '2025-06-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2025-09-20', -80000, '欧洲旅行支出', '{"liquid": 220000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 620000, '2025-09-20 00:00:00+00', '2025-09-20 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2025-12-31', 200000, '年终奖与投资收益', '{"liquid": 350000, "equities": 550000, "realEstate": 1200000, "other": 50000}'::jsonb, 2150000, '2025-12-31 00:00:00+00', '2025-12-31 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2026-02-15', 150000, '股票投资收益', '{"liquid": 500000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2450000, '2026-02-15 00:00:00+00', '2026-02-15 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '2026-03-01', -20000, '日常生活支出', '{"liquid": 480000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2430000, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 插入 LifeGoals (3条)
INSERT INTO life_goals (user_id, title, description, category, progress, status, estimated_cost, created_at, updated_at)
VALUES
  ('a200df13-39ba-4778-9477-af53e035094a', '财务自由', '被动收入覆盖生活支出，拥有选择的权利', 'financial', 65, 'in-progress', 5000000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '环游世界', '用一年时间环游世界，体验不同文化', 'experiential', 20, 'dreaming', 300000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '出版技术书籍', '分享多年技术积累，帮助更多开发者', 'legacy', 40, 'planning', 50000, '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 插入 Projects (3条)
INSERT INTO projects (user_id, name, description, status, category, progress, featured, start_date, last_updated, created_at, updated_at)
VALUES
  ('a200df13-39ba-4778-9477-af53e035094a', 'Lumen', '生活与财富管理系统，整合人生目标、财富记录、项目作品', 'active', 'web', 25, true, '2025-01-15', '2026-03-29', '2025-01-15 00:00:00+00', '2026-03-29 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', 'AI助手', '基于大语言模型的个人智能助手项目', 'planning', 'ai-ml', 10, false, '2025-06-01', '2026-03-20', '2025-06-01 00:00:00+00', '2026-03-20 00:00:00+00'),
  ('a200df13-39ba-4778-9477-af53e035094a', '智能家居系统', '家庭自动化控制系统，整合灯光、温度、安防', 'archived', 'infrastructure', 80, false, '2024-03-01', '2025-12-15', '2024-03-01 00:00:00+00', '2025-12-15 00:00:00+00')
ON CONFLICT DO NOTHING;

-- ============================================
-- 步骤4: 验证数据
-- ============================================
SELECT '✅ 数据导入完成！' as status;

SELECT 'milestones' as table_name, COUNT(*) as count FROM milestones
UNION ALL
SELECT 'wealth_records', COUNT(*) FROM wealth_records
UNION ALL
SELECT 'life_goals', COUNT(*) FROM life_goals
UNION ALL
SELECT 'projects', COUNT(*) FROM projects;
```

---

## ✅ 预期结果

运行验证SQL后，应该看到：

```
status
✅ 数据导入完成！

table_name     | count
---------------|-------
milestones     | 4
wealth_records | 6
life_goals     | 3
projects       | 3
```

---

## 🎯 下一步

数据迁移完成后，就可以让前端页面调用Supabase API获取真实数据了！

### API类已创建：
- ✅ `lib/api/milestones.ts` - MilestoneAPI
- ✅ `lib/api/wealth.ts` - WealthRecordAPI
- ✅ `lib/api/goals.ts` - LifeGoalAPI
- ✅ `lib/api/projects.ts` - ProjectAPI

### 准备迁移的页面：
1. **Timeline页面** (最简单) - 使用 `milestoneAPI.getAll()`
2. **Dashboard页面** - 需要多个API
3. **Wealth页面** - 使用 `wealthRecordAPI.getAll()`
4. **Goals页面** - 使用 `lifeGoalAPI.getAll()`
5. **Projects页面** - 使用 `projectAPI.getAll()`

---

## 💡 提示

- **用户ID格式**: UUID，例如 `a200df13-39ba-4778-9477-af53e035094a`
- **外键约束**: 确保所有表的外键都指向 `auth.users(id)`
- **ON CONFLICT DO NOTHING**: 避免重复插入报错
- **数据验证**: 使用验证SQL确认数据正确导入

---

## 🔧 故障排除

### 问题1: 外键约束错误

**错误信息**:
```
ERROR: 23503: insert or update on table "milestones" violates foreign key constraint "milestones_user_id_fkey"
DETAIL: Key (user_id)=(xxx) is not present in table "users".
```

**原因**: 外键约束指向了错误的表（`public.users`）或者用户ID不正确

**解决方法**:
1. 确认已在 **Authentication → Users** 中创建了用户
2. 确认已运行**步骤2**修改外键约束
3. 确认SQL中的用户ID与Dashboard中显示的完全一致

### 问题2: 使用了旧的迁移脚本

**错误**: 脚本中包含 `CREATE TABLE public.users` 或使用UUID `26047c65-840d-45b9-a3fd-b7d9660b471d`

**解决方法**: 请使用本指南中的SQL，不要使用 `scripts/migrate-all.sql` 等旧脚本

### 问题3: 列不存在

**错误**: `column "xxx" of relation "milestones" does not exist`

**解决方法**: 检查数据库schema，确保表结构与SQL插入语句匹配

### 检查外键约束指向哪里

运行以下SQL检查：

```sql
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid::regclass IN ('auth.users', 'public.users')
ORDER BY conrelid::regclass::text;
```

**正确结果**应该显示 `referenced_table` 为 `auth.users`

---

## 🔄 如果需要重新迁移

如果需要清空数据重新导入：

```sql
-- 清空数据（保留表结构）
TRUNCATE milestones CASCADE;
TRUNCATE wealth_records CASCADE;
TRUNCATE life_goals CASCADE;
TRUNCATE projects CASCADE;

-- 然后重新运行步骤3的插入SQL
```

---

## ✅ 完整迁移检查清单

在开始迁移前，确认：
- [ ] Supabase项目已创建
- [ ] 在Authentication中创建了用户
- [ ] 复制了正确的用户ID（UUID格式）

步骤1完成后：
- [ ] 用户已创建在 `auth.users` 表中
- [ ] 用户ID已复制

步骤2完成后：
- [ ] 外键约束已重建，指向 `auth.users(id)`
- [ ] 运行检查SQL确认外键指向正确

步骤3完成后：
- [ ] 所有数据插入成功（无错误）
- [ ] 验证结果显示：milestones(4), wealth_records(6), life_goals(3), projects(3)

---

**文档版本**: v1.1
**最后更新**: 2026-03-29
**维护者**: Lumen Team
