-- =====================================================
-- Lumen 项目数据库架构 - 初始迁移
-- =====================================================
-- 版本: 1.0.0
-- 日期: 2026-03-29
-- 说明: 创建所有核心表、索引、RLS 策略和触发器
-- =====================================================

-- =====================================================
-- 1. MILESTONES 表（人生节点）
-- =====================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'experience', 'strategic-asset', 'vision-realized', 'life-chapter')),
  asset_class TEXT NOT NULL CHECK (asset_class IN ('tangible-shelter', 'tangible-vehicle', 'intangible-experiential', 'venture-autonomy', 'venture-investment', 'equities', 'real-estate')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('compounding', 'completed', 'planned')),
  capital_deployed DECIMAL(12, 2) NOT NULL DEFAULT 0,
  impact_radius INTEGER CHECK (impact_radius BETWEEN 1 AND 10),
  recurrence BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  location VARCHAR(500),
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_milestones_user_id ON milestones(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_milestones_date ON milestones(date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_milestones_category ON milestones(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_milestones_search ON milestones USING GIN(search_vector) WHERE deleted_at IS NULL;

-- 全文搜索触发器
CREATE OR REPLACE FUNCTION milestones_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestones_search_vector_trigger
  BEFORE INSERT OR UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION milestones_search_vector_update();

-- RLS 策略
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. MILESTONE_TAGS 表（节点标签）
-- =====================================================

CREATE TABLE milestone_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestone_tags_milestone_id ON milestone_tags(milestone_id);

ALTER TABLE milestone_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags of own milestones"
  ON milestone_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM milestones WHERE milestones.id = milestone_tags.milestone_id AND milestones.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tags for own milestones"
  ON milestone_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM milestones WHERE milestones.id = milestone_tags.milestone_id AND milestones.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags of own milestones"
  ON milestone_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM milestones WHERE milestones.id = milestone_tags.milestone_id AND milestones.user_id = auth.uid()
  ));

-- =====================================================
-- 3. WEALTH_RECORDS 表（财富记录）
-- =====================================================

CREATE TABLE wealth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_assets DECIMAL(12, 2) NOT NULL CHECK (total_assets >= 0),
  change_amount DECIMAL(12, 2) NOT NULL,
  change_reason TEXT NOT NULL,
  breakdown JSONB NOT NULL CHECK (
    (breakdown->>'liquid')::DECIMAL >= 0 AND
    (breakdown->>'equities')::DECIMAL >= 0 AND
    (breakdown->>'realEstate')::DECIMAL >= 0 AND
    (breakdown->>'other')::DECIMAL >= 0
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_wealth_records_user_date ON wealth_records(user_id, date DESC) WHERE deleted_at IS NULL;

ALTER TABLE wealth_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wealth records"
  ON wealth_records FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own wealth records"
  ON wealth_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wealth records"
  ON wealth_records FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. LIFE_GOALS 表（人生目标）
-- =====================================================

CREATE TABLE life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('financial', 'experiential', 'personal-growth', 'relationship', 'legacy')),
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  estimated_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'dreaming' CHECK (status IN ('dreaming', 'planning', 'in-progress', 'achieved')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_life_goals_user_id ON life_goals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_life_goals_status ON life_goals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_life_goals_priority ON life_goals(priority) WHERE deleted_at IS NULL AND priority IS NOT NULL;

ALTER TABLE life_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON life_goals FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. GOAL_MILESTONES 表（目标与节点关联）
-- =====================================================

CREATE TABLE goal_milestones (
  goal_id UUID NOT NULL REFERENCES life_goals(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (goal_id, milestone_id)
);

CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_milestones_milestone_id ON goal_milestones(milestone_id);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goal milestones"
  ON goal_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM life_goals WHERE life_goals.id = goal_milestones.goal_id AND life_goals.user_id = auth.uid()
  ));

-- =====================================================
-- 6. PROJECTS 表（项目作品）
-- =====================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
  description TEXT NOT NULL,
  long_description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'in-progress', 'completed', 'archived', 'planning')),
  category TEXT NOT NULL CHECK (category IN ('web', 'mobile', 'desktop', 'ai-ml', 'infrastructure', 'other')),
  cover_image TEXT,
  start_date DATE NOT NULL,
  last_updated DATE NOT NULL,
  progress INTEGER CHECK (progress BETWEEN 0 AND 100),
  estimated_hours_invested DECIMAL(10, 2),
  monthly_cost DECIMAL(10, 2),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_projects_user_id ON projects(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_featured ON projects(featured DESC) WHERE deleted_at IS NULL AND featured = true;
CREATE INDEX idx_projects_category ON projects(category) WHERE deleted_at IS NULL;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. PROJECT_TECH_STACK 表（项目技术栈）
-- =====================================================

CREATE TABLE project_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_tech_stack_project_id ON project_tech_stack(project_id);

ALTER TABLE project_tech_stack ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tech stack of own projects"
  ON project_tech_stack FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_tech_stack.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage tech stack of own projects"
  ON project_tech_stack FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_tech_stack.project_id AND projects.user_id = auth.uid()
  ));

-- =====================================================
-- 8. PROJECT_LINKS 表（项目链接）
-- =====================================================

CREATE TABLE project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('github', 'demo', 'docs', 'other')),
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_links_project_id ON project_links(project_id);
CREATE INDEX idx_project_links_type ON project_links(link_type);

ALTER TABLE project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage links of own projects"
  ON project_links FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = project_links.project_id AND projects.user_id = auth.uid()
  ));

-- =====================================================
-- 9. 通用触发器：自动更新 updated_at 字段
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wealth_records_updated_at
  BEFORE UPDATE ON wealth_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_goals_updated_at
  BEFORE UPDATE ON life_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 迁移完成
-- =====================================================
