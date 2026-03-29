-- 完整数据迁移SQL脚本
-- 在Supabase SQL Editor中运行此脚本
-- 运行后，所有数据将导入到数据库

-- 步骤1: 创建public.users表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 步骤2: 临时禁用外键约束
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_user_id_fkey;
ALTER TABLE wealth_records DROP CONSTRAINT IF EXISTS wealth_records_user_id_fkey;
ALTER TABLE life_goals DROP CONSTRAINT IF EXISTS life_goals_user_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

-- 步骤3: 创建用户
INSERT INTO public.users (id, email)
VALUES ('26047c65-840d-45b9-a3fd-b7d9660b471d', 'demo@lumen.local')
ON CONFLICT (id) DO NOTHING;

-- 步骤4: 插入Milestones
INSERT INTO milestones (user_id, date, title, description, category, asset_class, status, created_at, updated_at)
VALUES
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2018-10-15', '第一处居所', '在成都购买第一套房产，90平米两室一厅，为生活奠定基础', 'foundation', 'tangible-shelter', 'completed', '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2020-06-01', '加入创业公司', '加入一家AI创业公司，担任技术合伙人，获得股权激励', 'foundation', 'venture-autonomy', 'completed', '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2021-09-10', '投资组合启动', '开始系统化投资，配置股票、基金、保险等多元化资产', 'strategic-asset', 'equities', 'compounding', '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2026-03-29', 'Lumen项目启动', '启动Lumen个人管理系统项目，整合生活与财富管理', 'vision-realized', 'tangible-shelter', 'planned', '2025-03-29 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 步骤5: 插入WealthRecords
INSERT INTO wealth_records (user_id, date, change_amount, change_reason, breakdown, total_assets, created_at, updated_at)
VALUES
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2025-01-15', 500000, '初始资产盘点', '{"liquid": 200000, "equities": 300000, "realEstate": 0, "other": 0}'::jsonb, 500000, '2025-01-15 00:00:00+00', '2025-01-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2025-06-15', 100000, '年中奖发放', '{"liquid": 300000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 700000, '2025-06-15 00:00:00+00', '2025-06-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2025-09-20', -80000, '欧洲旅行支出', '{"liquid": 220000, "equities": 400000, "realEstate": 0, "other": 0}'::jsonb, 620000, '2025-09-20 00:00:00+00', '2025-09-20 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2025-12-31', 200000, '年终奖与投资收益', '{"liquid": 350000, "equities": 550000, "realEstate": 1200000, "other": 50000}'::jsonb, 2150000, '2025-12-31 00:00:00+00', '2025-12-31 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2026-02-15', 150000, '股票投资收益', '{"liquid": 500000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2450000, '2026-02-15 00:00:00+00', '2026-02-15 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '2026-03-01', -20000, '日常生活支出', '{"liquid": 480000, "equities": 700000, "realEstate": 1200000, "other": 50000}'::jsonb, 2430000, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 步骤6: 插入LifeGoals
INSERT INTO life_goals (user_id, title, description, category, progress, status, created_at, updated_at)
VALUES
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '财务自由', '被动收入覆盖生活支出，拥有选择的权利', 'financial', 65, 'in-progress', '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '环游世界', '用一年时间环游世界，体验不同文化', 'experiential', 20, 'dreaming', '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '出版技术书籍', '分享多年技术积累，帮助更多开发者', 'legacy', 40, 'planning', '2025-01-15 00:00:00+00', '2025-03-29 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 步骤7: 插入Projects
INSERT INTO projects (user_id, name, description, status, category, progress, featured, start_date, last_updated, created_at, updated_at)
VALUES
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', 'Lumen', '生活与财富管理系统，整合人生目标、财富记录、项目作品', 'active', 'web', 25, true, '2025-01-15', '2026-03-29', '2025-01-15 00:00:00+00', '2026-03-29 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', 'AI助手', '基于大语言模型的个人智能助手项目', 'planning', 'ai-ml', 10, false, '2025-06-01', '2026-03-20', '2025-06-01 00:00:00+00', '2026-03-20 00:00:00+00'),
  ('26047c65-840d-45b9-a3fd-b7d9660b471d', '智能家居系统', '家庭自动化控制系统，整合灯光、温度、安防', 'archived', 'infrastructure', 80, false, '2024-03-01', '2025-12-15', '2024-03-01 00:00:00+00', '2025-12-15 00:00:00+00')
ON CONFLICT DO NOTHING;

-- 步骤8: 重建外键约束
ALTER TABLE milestones
  ADD CONSTRAINT milestones_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE wealth_records
  ADD CONSTRAINT wealth_records_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE life_goals
  ADD CONSTRAINT life_goals_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE projects
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 步骤9: 验证数据
SELECT 'milestones' as table_name, COUNT(*) as count FROM milestones
UNION ALL
SELECT 'wealth_records', COUNT(*) FROM wealth_records
UNION ALL
SELECT 'life_goals', COUNT(*) FROM life_goals
UNION ALL
SELECT 'projects', COUNT(*) FROM projects;

-- 完成
SELECT '✅ 数据迁移完成！' as status;
