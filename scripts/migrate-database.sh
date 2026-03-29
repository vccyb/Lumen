#!/bin/bash

# Lumen Database Migration Script
# This script executes the Supabase database migration

set -e

echo "🚀 Starting Supabase Database Migration..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "   Please create .env.local with your Supabase credentials."
    exit 1
fi

# Source environment variables
export $(grep -v '^#' .env.local | xargs)

echo "📋 Migration Details:"
echo "   Project: $NEXT_PUBLIC_SUPABASE_URL"
echo "   Migration File: supabase/migrations/001_initial_schema.sql"
echo ""

# Read the migration file
MIGRATION_FILE="supabase/migrations/001_initial_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file found: $MIGRATION_FILE"
echo "   Lines: $(wc -l < "$MIGRATION_FILE")"
echo ""

echo "⚠️  IMPORTANT: This migration will create the following tables:"
echo "   - milestones (人生节点)"
echo "   - milestone_tags (节点标签)"
echo "   - wealth_records (财富记录)"
echo "   - life_goals (人生目标)"
echo "   - goal_milestones (目标关联)"
echo "   - projects (项目作品)"
echo "   - project_tech_stack (技术栈)"
echo "   - project_links (项目链接)"
echo ""

echo "🔧 Instructions:"
echo "   1. Open Supabase Dashboard: https://supabase.com/dashboard"
echo "   2. Select your project: gmclfzpbyhstyefjymrx"
echo "   3. Go to SQL Editor"
echo "   4. Copy the content of: $MIGRATION_FILE"
echo "   5. Paste and execute in SQL Editor"
echo ""

# Show first 50 lines of migration
echo "📝 Migration Preview (first 50 lines):"
echo "────────────────────────────────────────"
head -50 "$MIGRATION_FILE"
echo "────────────────────────────────────────"
echo ""

echo "✅ Migration file is ready!"
echo ""
echo "📖 For full instructions, see: SUPABASE_SETUP.md"
echo "🔗 Dashboard: https://supabase.com/dashboard/project/gmclfzpbyhstyefjymrx/sql"
echo ""
