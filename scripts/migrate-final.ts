/**
 * 最终数据迁移脚本 - 使用service role key绕过RLS
 *
 * 运行方式:
 * npx tsx scripts/migrate-final.ts
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
// 使用service role key绕过RLS
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成用户ID
const USER_ID = randomUUID();

async function migrateData() {
  console.log('🚀 开始数据迁移（使用service role）...\n');
  console.log(`👤 用户ID: ${USER_ID}\n`);

  const now = new Date().toISOString();

  // 准备数据
  const milestones = sampleMilestones.map(m => ({
    user_id: USER_ID,
    date: m.date.toISOString().split('T')[0],
    title: m.title,
    description: m.description,
    category: m.category,
    status: m.status || 'planned',
    created_at: now,
    updated_at: now,
  }));

  const wealthRecords = sampleWealthRecords.map(r => ({
    user_id: USER_ID,
    date: r.date.toISOString().split('T')[0],
    change_amount: r.changeAmount,
    change_reason: r.changeReason,
    breakdown: r.breakdown,
    created_at: now,
    updated_at: now,
  }));

  const lifeGoals = sampleLifeGoals.map(g => ({
    user_id: USER_ID,
    title: g.title,
    description: g.description,
    category: g.category,
    progress: g.progress || 0,
    status: g.status || 'dreaming',
    created_at: now,
    updated_at: now,
  }));

  const projects = sampleProjects.map(p => ({
    user_id: USER_ID,
    name: p.name,
    description: p.description,
    status: p.status || 'planning',
    category: p.category,
    progress: p.progress || 0,
    featured: p.featured || false,
    start_date: now.split('T')[0],
    last_updated: now.split('T')[0],
    created_at: now,
    updated_at: now,
  }));

  // 插入数据
  const tables = [
    { name: 'Milestones', data: milestones },
    { name: 'WealthRecords', data: wealthRecords },
    { name: 'LifeGoals', data: lifeGoals },
    { name: 'Projects', data: projects },
  ];

  let totalInserted = 0;

  for (const table of tables) {
    console.log(`📝 插入 ${table.name}...`);

    const { data, error } = await supabase
      .from(table.name.toLowerCase().replace('records', '_records'))
      .insert(table.data)
      .select();

    if (error) {
      console.log(`   ❌ 失败: ${error.message}`);
    } else {
      console.log(`   ✅ 成功插入 ${data?.length || 0} 条记录`);
      totalInserted += data?.length || 0;
    }
  }

  console.log(`\n🎉 迁移完成！总计 ${totalInserted} 条记录\n`);
  console.log(`📝 用户ID: ${USER_ID}`);
  console.log(`💡 保存此ID，后续需要用到\n`);
}

migrateData();
