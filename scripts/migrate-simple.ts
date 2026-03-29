/**
 * 简化版数据迁移 - 直接插入数据（绕过用户外键检查）
 *
 * 运行方式:
 * npx tsx scripts/migrate-simple.ts
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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// 生成临时用户ID（外键可能不会在client模式下强制检查）
const TEMP_USER_ID = randomUUID();

async function migrateData() {
  console.log('🚀 开始数据迁移...\n');
  console.log(`📝 使用临时用户ID: ${TEMP_USER_ID}\n`);

  const now = new Date().toISOString();

  // 准备数据 - 只使用必填字段
  const milestones = sampleMilestones.map(m => ({
    user_id: TEMP_USER_ID,
    date: m.date.toISOString().split('T')[0],
    title: m.title,
    description: m.description,
    category: m.category,
    status: m.status || 'planned',
    created_at: now,
    updated_at: now,
  }));

  const wealthRecords = sampleWealthRecords.map(r => ({
    user_id: TEMP_USER_ID,
    date: r.date.toISOString().split('T')[0],
    change_amount: r.changeAmount,
    change_reason: r.changeReason,
    breakdown: r.breakdown,
    created_at: now,
    updated_at: now,
  }));

  const lifeGoals = sampleLifeGoals.map(g => ({
    user_id: TEMP_USER_ID,
    title: g.title,
    description: g.description,
    category: g.category,
    progress: g.progress || 0,
    status: g.status || 'dreaming',
    created_at: now,
    updated_at: now,
  }));

  const projects = sampleProjects.map(p => ({
    user_id: TEMP_USER_ID,
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

  // 尝试插入数据
  const results = await Promise.allSettled([
    supabase.from('milestones').insert(milestones).select(),
    supabase.from('wealth_records').insert(wealthRecords).select(),
    supabase.from('life_goals').insert(lifeGoals).select(),
    supabase.from('projects').insert(projects).select(),
  ]);

  let successCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    const tables = ['Milestones', 'WealthRecords', 'LifeGoals', 'Projects'];

    if (result.status === 'fulfilled') {
      const { data, error } = result.value;
      if (error) {
        console.log(`❌ ${tables[index]}: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ ${tables[index]}: 插入 ${data?.length || 0} 条记录`);
        successCount++;
      }
    } else {
      console.log(`❌ ${tables[index]}: ${result.reason}`);
      failCount++;
    }
  });

  console.log(`\n📊 迁移完成: ${successCount} 成功, ${failCount} 失败\n`);

  if (successCount > 0) {
    console.log('🎉 数据迁移成功！现在可以在应用中使用这些数据了。\n');
    console.log('💡 提示: 如果需要登录功能，请在Supabase中创建用户，然后更新user_id。\n');
  }
}

migrateData();
