-- =====================================================
-- Migration: Add Missing Fields to Projects Table
-- =====================================================
-- Version: 1.1.0
-- Date: 2026-03-30
-- Description: Add JSONB fields for milestones, learnings, and emotional_yield
--              These fields are currently defined in frontend types but missing from DB
-- =====================================================

-- Add milestones field (JSONB array of project milestones)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;

-- Add learnings field (JSONB array of learning points)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS learnings JSONB DEFAULT '[]'::jsonb;

-- Add emotional_yield field (JSONB array of emotional yield tags)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS emotional_yield JSONB DEFAULT '[]'::jsonb;

-- Add tech_stack field as JSONB array (for direct storage)
-- Note: We also have project_tech_stack table, but this allows direct array storage
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT '[]'::jsonb;

-- Create index for tech_stack array queries (for contains operator)
CREATE INDEX IF NOT EXISTS idx_projects_tech_stack ON projects USING GIN (tech_stack);

-- Add comments for documentation
COMMENT ON COLUMN projects.milestones IS 'Array of project milestones with dates, titles, and types';
COMMENT ON COLUMN projects.learnings IS 'Array of technical learning points from the project';
COMMENT ON COLUMN projects.emotional_yield IS 'Array of emotional yield tags/achievements';
COMMENT ON COLUMN projects.tech_stack IS 'Array of technology stack tags used in the project';
