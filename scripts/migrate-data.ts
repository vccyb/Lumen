/**
 * 数据迁移脚本 - 将mock数据导入到Supabase
 *
 * 运行方式:
 * npx tsx scripts/migrate-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';
import {
  sampleMilestones,
  sampleWealthRecords,
  sampleLifeGoals,
  sampleProjects,
} from '../lib/data';

// 加载环境变量
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成真实的UUID作为用户ID
const USER_ID = randomUUID();

/**
 * 转换Milestone数据格式
 */
function transformMilestone(milestone: any) {
  return {
    user_id: USER_ID,
    date: milestone.date.toISOString().split('T')[0],
    title: milestone.title,
    description: milestone.description,
    category: milestone.category,
    asset_class: milestone.assetClass,
    status: milestone.status,
    capital_deployed: milestone.capitalDeployed || 0,
    emotional_yield: milestone.emotionalYield || [],
    impact_radius: milestone.impactRadius,
    recurrence: milestone.recurrence || false,
    image_url: milestone.imageUrl,
    location: milestone.location,
    labels: milestone.labels || [],
    created_at: milestone.createdAt.toISOString(),
    updated_at: milestone.updatedAt.toISOString(),
  };
}

/**
 * 转换WealthRecord数据格式
 */
function transformWealthRecord(record: any) {
  return {
    user_id: USER_ID,
    date: record.date.toISOString().split('T')[0],
    change_amount: record.changeAmount,
    change_reason: record.changeReason,
    breakdown: record.breakdown,
    total_assets: record.breakdown.liquid + record.breakdown.equities + record.breakdown.realEstate + record.breakdown.other,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

/**
 * 转换LifeGoal数据格式
 */
function transformLifeGoal(goal: any) {
  return {
    user_id: USER_ID,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    target_date: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : null,
    progress: goal.progress,
    estimated_cost: goal.estimatedCost || 0,
    status: goal.status,
    priority: goal.priority,
    milestones: goal.milestones || [],
    created_at: goal.createdAt.toISOString(),
    updated_at: goal.updatedAt.toISOString(),
  };
}

/**
 * 转换Project数据格式
 */
function transformProject(project: any) {
  const startDate = project.createdAt.toISOString().split('T')[0];

  return {
    user_id: USER_ID,
    name: project.name,
    description: project.description,
    long_description: project.longDescription,
    status: project.status,
    category: project.category,
    tech_stack: project.techStack || [],
    progress: project.progress || 0,
    estimated_hours_invested: project.estimatedHoursInvested || 0,
    monthly_cost: project.monthlyCost || 0,
    featured: project.featured || false,
    cover_image: project.imageUrl,
    milestones: project.milestones || [],
    start_date: startDate,
    last_updated: project.updatedAt.toISOString().split('T')[0],
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
  };
}

/**
 * 迁移数据到Supabase
 */
async function migrateData() {
  console.log('🚀 开始数据迁移...\n');

  try {
    // 1. 迁移 Milestones
    console.log('📅 迁移 Milestones...');
    const milestones = sampleMilestones.map(transformMilestone);
    const { data: insertedMilestones, error: milestoneError } = await supabase
      .from('milestones')
      .insert(milestones)
      .select();

    if (milestoneError) {
      console.error('❌ Milestones 迁移失败:', milestoneError);
    } else {
      console.log(`✅ 成功插入 ${insertedMilestones?.length || 0} 条 Milestones`);
    }

    // 2. 迁移 WealthRecords
    console.log('\n💰 迁移 WealthRecords...');
    const wealthRecords = sampleWealthRecords.map(transformWealthRecord);
    const { data: insertedWealthRecords, error: wealthError } = await supabase
      .from('wealth_records')
      .insert(wealthRecords)
      .select();

    if (wealthError) {
      console.error('❌ WealthRecords 迁移失败:', wealthError);
    } else {
      console.log(`✅ 成功插入 ${insertedWealthRecords?.length || 0} 条 WealthRecords`);
    }

    // 3. 迁移 LifeGoals
    console.log('\n🎯 迁移 LifeGoals...');
    const lifeGoals = sampleLifeGoals.map(transformLifeGoal);
    const { data: insertedGoals, error: goalError } = await supabase
      .from('life_goals')
      .insert(lifeGoals)
      .select();

    if (goalError) {
      console.error('❌ LifeGoals 迁移失败:', goalError);
    } else {
      console.log(`✅ 成功插入 ${insertedGoals?.length || 0} 条 LifeGoals`);
    }

    // 4. 迁移 Projects
    console.log('\n🚀 迁移 Projects...');
    const projects = sampleProjects.map(transformProject);
    const { data: insertedProjects, error: projectError } = await supabase
      .from('projects')
      .insert(projects)
      .select();

    if (projectError) {
      console.error('❌ Projects 迁移失败:', projectError);
    } else {
      console.log(`✅ 成功插入 ${insertedProjects?.length || 0} 条 Projects`);
    }

    console.log('\n🎉 数据迁移完成！\n');

    // 显示统计信息
    console.log('📊 迁移统计:');
    console.log(`   - Milestones: ${insertedMilestones?.length || 0}`);
    console.log(`   - WealthRecords: ${insertedWealthRecords?.length || 0}`);
    console.log(`   - LifeGoals: ${insertedGoals?.length || 0}`);
    console.log(`   - Projects: ${insertedProjects?.length || 0}`);
    console.log(`   - 总计: ${(insertedMilestones?.length || 0) + (insertedWealthRecords?.length || 0) + (insertedGoals?.length || 0) + (insertedProjects?.length || 0)} 条记录\n`);

  } catch (error) {
    console.error('❌ 迁移过程中出错:', error);
    process.exit(1);
  }
}

// 运行迁移
migrateData();
