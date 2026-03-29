/**
 * 完整数据迁移脚本 - 修复所有必填字段
 *
 * 运行方式:
 * npx tsx scripts/migrate-final-v2.ts
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

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = randomUUID();

async function migrateData() {
  console.log('🚀 开始最终数据迁移...\n');
  console.log(`👤 用户ID: ${USER_ID}\n`);

  const now = new Date().toISOString();

  // 1. 准备 Milestones（添加必填的 asset_class）
  const milestones = sampleMilestones.map(m => ({
    user_id: USER_ID,
    date: m.date.toISOString().split('T')[0],
    title: m.title,
    description: m.description,
    category: m.category,
    asset_class: m.assetClass || 'tangible-shelter',  // 必填
    status: m.status || 'planned',
    capital_deployed: m.capitalDeployed || 0,
    emotional_yield: m.emotionalYield || [],
    created_at: now,
    updated_at: now,
  }));

  // 2. 准备 WealthRecords（计算 total_assets）
  const wealthRecords = sampleWealthRecords.map(r => {
    const total = r.breakdown.liquid + r.breakdown.equities + r.breakdown.realEstate + r.breakdown.other;
    return {
      user_id: USER_ID,
      date: r.date.toISOString().split('T')[0],
      change_amount: r.changeAmount,
      change_reason: r.changeReason,
      breakdown: r.breakdown,
      total_assets: total,  // 必填
      created_at: now,
      updated_at: now,
    };
  });

  // 3. 准备 LifeGoals
  const lifeGoals = sampleLifeGoals.map(g => ({
    user_id: USER_ID,
    title: g.title,
    description: g.description,
    category: g.category,
    target_date: g.targetDate ? g.targetDate.toISOString().split('T')[0] : null,
    progress: g.progress || 0,
    estimated_cost: g.estimatedCost || 0,
    status: g.status || 'dreaming',
    priority: g.priority || null,
    milestones: g.milestones || [],
    created_at: now,
    updated_at: now,
  }));

  // 4. 准备 Projects
  const projects = sampleProjects.map(p => ({
    user_id: USER_ID,
    name: p.name,
    description: p.description,
    long_description: p.longDescription || null,
    status: p.status || 'planning',
    category: p.category,
    tech_stack: p.techStack || [],
    progress: p.progress || 0,
    estimated_hours_invested: p.estimatedHoursInvested || null,
    monthly_cost: p.monthlyCost || null,
    featured: p.featured || false,
    cover_image: p.coverImage || null,
    milestones: p.milestones || [],
    start_date: p.createdAt ? p.createdAt.toISOString().split('T')[0] : now.split('T')[0],
    last_updated: now.split('T')[0],
    created_at: now,
    updated_at: now,
  }));

  // 5. 插入数据（使用正确的表名）
  const tables = [
    { name: 'milestones', data: milestones },
    { name: 'wealth_records', data: wealthRecords },
    { name: 'life_goals', data: lifeGoals },
    { name: 'projects', data: projects },
  ];

  let totalInserted = 0;

  for (const table of tables) {
    console.log(`📝 插入 ${table.name}...`);

    const { data, error } = await supabase
      .from(table.name)
      .insert(table.data)
      .select();

    if (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      console.log(`   详细信息:`, error);
    } else {
      console.log(`   ✅ 成功插入 ${data?.length || 0} 条记录`);
      totalInserted += data?.length || 0;
    }
  }

  console.log(`\n${totalInserted > 0 ? '🎉' : '⚠️'} 迁移${totalInserted > 0 ? '完成！' : '未完成'}总计 ${totalInserted} 条记录\n`);

  if (totalInserted > 0) {
    console.log(`📝 用户ID (保存此ID): ${USER_ID}\n`);
    console.log('💡 下一步: 运行 npm run dev 启动应用\n');
  } else {
    console.log('❌ 所有数据插入失败，请检查错误信息\n');
  }
}

migrateData();
