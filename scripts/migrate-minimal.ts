/**
 * 最极简数据迁移 - 只用必填字段
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

async function migrateMinimal() {
  console.log('🚀 最极简数据迁移...\n');

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  let total = 0;

  // 1. Milestones - 最基本字段
  console.log('📅 Milestones...');
  const mResult = await supabase.from('milestones').insert(
    sampleMilestones.map((m, i) => ({
      user_id: USER_ID,
      date: m.date.toISOString().split('T')[0],
      title: m.title,
      description: m.description,
      category: m.category,
      asset_class: m.assetClass,
      status: m.status,
      created_at: now,
      updated_at: now,
    }))
  ).select();

  if (mResult.error) {
    console.log('   ❌', mResult.error.message);
  } else {
    console.log('   ✅', mResult.data?.length || 0);
    total += mResult.data?.length || 0;
  }

  // 2. WealthRecords
  console.log('💰 WealthRecords...');
  const wResult = await supabase.from('wealth_records').insert(
    sampleWealthRecords.map(r => ({
      user_id: USER_ID,
      date: r.date.toISOString().split('T')[0],
      change_amount: r.changeAmount,
      change_reason: r.changeReason,
      breakdown: r.breakdown,
      total_assets: r.breakdown.liquid + r.breakdown.equities + r.breakdown.realEstate + r.breakdown.other,
      created_at: now,
      updated_at: now,
    }))
  ).select();

  if (wResult.error) {
    console.log('   ❌', wResult.error.message);
    // 如果是外键错误，尝试直接用已有的用户ID
    if (wResult.error.code === '23503') {
      console.log('   💡 外键约束错误，需要先创建用户\n');
      console.log('请在Supabase SQL Editor中运行:');
      console.log(`INSERT INTO users (id) VALUES ('${USER_ID}');\n`);
    }
  } else {
    console.log('   ✅', wResult.data?.length || 0);
    total += wResult.data?.length || 0;
  }

  // 3. LifeGoals - 去掉milestones字段
  console.log('🎯 LifeGoals...');
  const gResult = await supabase.from('life_goals').insert(
    sampleLifeGoals.map(g => ({
      user_id: USER_ID,
      title: g.title,
      description: g.description,
      category: g.category,
      progress: g.progress,
      status: g.status,
      created_at: now,
      updated_at: now,
    }))
  ).select();

  if (gResult.error) {
    console.log('   ❌', gResult.error.message);
  } else {
    console.log('   ✅', gResult.data?.length || 0);
    total += gResult.data?.length || 0;
  }

  // 4. Projects - 去掉milestones字段
  console.log('🚀 Projects...');
  const pResult = await supabase.from('projects').insert(
    sampleProjects.map(p => ({
      user_id: USER_ID,
      name: p.name,
      description: p.description,
      status: p.status,
      category: p.category,
      progress: p.progress,
      featured: p.featured,
      start_date: today,
      last_updated: today,
      created_at: now,
      updated_at: now,
    }))
  ).select();

  if (pResult.error) {
    console.log('   ❌', pResult.error.message);
  } else {
    console.log('   ✅', pResult.data?.length || 0);
    total += pResult.data?.length || 0;
  }

  console.log(`\n${total > 0 ? '🎉' : '⚠️'} 总计: ${total} 条记录`);
  if (total > 0) {
    console.log(`📝 用户ID: ${USER_ID}\n`);
  }
}

migrateMinimal();
