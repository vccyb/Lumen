/**
 * 完整数据迁移 - 包含用户创建
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

async function migrateComplete() {
  console.log('🚀 完整数据迁移...\n');
  console.log(`👤 用户ID: ${USER_ID}\n`);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 步骤1: 创建用户（如果users表存在）
  console.log('📝 步骤1: 创建用户记录...');
  const { error: userError } = await supabase
    .from('users')
    .insert({ id: USER_ID });

  if (userError) {
    console.log('   ⚠️', userError.message);
    console.log('   ℹ️  可能users表不存在或已存在该用户\n');
  } else {
    console.log('   ✅ 用户创建成功\n');
  }

  let total = 0;

  // 步骤2: Milestones
  console.log('📅 步骤2: Milestones...');
  const mResult = await supabase.from('milestones').insert(
    sampleMilestones.map(m => ({
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
    console.log('   ✅', mResult.data?.length || 0, '条');
    total += mResult.data?.length || 0;
  }

  // 步骤3: WealthRecords
  console.log('💰 步骤3: WealthRecords...');
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
  } else {
    console.log('   ✅', wResult.data?.length || 0, '条');
    total += wResult.data?.length || 0;
  }

  // 步骤4: LifeGoals
  console.log('🎯 步骤4: LifeGoals...');
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
    console.log('   ✅', gResult.data?.length || 0, '条');
    total += gResult.data?.length || 0;
  }

  // 步骤5: Projects
  console.log('🚀 步骤5: Projects...');
  const pResult = await supabase.from('projects').insert(
    sampleProjects.map(p => ({
      user_id: USER_ID,
      name: p.name,
      description: p.description,
      status: p.status,
      category: p.category,
      progress: p.progress || 0,
      featured: p.featured || false,
      start_date: today,
      last_updated: today,
      created_at: now,
      updated_at: now,
    }))
  ).select();

  if (pResult.error) {
    console.log('   ❌', pResult.error.message);
  } else {
    console.log('   ✅', pResult.data?.length || 0, '条');
    total += pResult.data?.length || 0;
  }

  console.log(`\n${total > 0 ? '🎉' : '⚠️'} 迁移完成！总计: ${total} 条记录\n`);

  if (total > 0) {
    console.log(`✅ 数据已导入到数据库！`);
    console.log(`📝 用户ID: ${USER_ID}\n`);
    console.log('💡 现在可以运行 npm run dev 启动应用了！\n');
  }
}

migrateComplete();
