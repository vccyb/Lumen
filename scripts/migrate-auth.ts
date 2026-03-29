/**
 * 简化版数据迁移 - 使用 auth.users
 *
 * 使用方式：
 * 1. 在 Supabase Dashboard 创建用户
 * 2. 复制用户ID，替换下面的 YOUR_USER_ID
 * 3. 运行: npx tsx scripts/migrate-auth.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import {
  sampleMilestones,
  sampleWealthRecords,
  sampleLifeGoals,
  sampleProjects,
} from '../lib/data';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ 替换为你在Supabase创建的真实用户ID
const USER_ID = 'YOUR_USER_ID_HERE';

if (USER_ID === 'YOUR_USER_ID_HERE') {
  console.error('❌ 请先替换脚本中的 YOUR_USER_ID 为你的真实用户ID！');
  console.log('\n获取用户ID步骤：');
  console.log('1. 打开 https://supabase.com/dashboard');
  console.log('2. 选择项目 → Authentication → Users');
  console.log('3. 查看你创建的用户ID（UUID格式）');
  console.log('4. 复制并替换此脚本中的 YOUR_USER_ID_HERE\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateWithAuthUser() {
  console.log('🚀 开始数据迁移（使用auth.users）...\n');
  console.log(`👤 用户ID: ${USER_ID}\n`);

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 1. Milestones
  console.log('📅 插入 Milestones...');
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
  }

  // 2. WealthRecords
  console.log('💰 插入 WealthRecords...');
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
  }

  // 3. LifeGoals
  console.log('🎯 插入 LifeGoals...');
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
  }

  // 4. Projects
  console.log('🚀 插入 Projects...');
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
  }

  // 验证
  console.log('\n📊 验证数据...');
  const [mCount, wCount, gCount, pCount] = await Promise.all([
    supabase.from('milestones').select('*', { count: 'exact', head: true }),
    supabase.from('wealth_records').select('*', { count: 'exact', head: true }),
    supabase.from('life_goals').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
  ]);

  const total = (mCount.count || 0) + (wCount.count || 0) + (gCount.count || 0) + (pCount.count || 0);

  console.log(`   - Milestones: ${mCount.count || 0}`);
  console.log(`   - WealthRecords: ${wCount.count || 0}`);
  console.log(`   - LifeGoals: ${gCount.count || 0}`);
  console.log(`   - Projects: ${pCount.count || 0}`);
  console.log(`   - 总计: ${total} 条\n`);

  if (total > 0) {
    console.log('🎉 数据迁移成功！\n');
    console.log('下一步：让前端页面调用真实API');
    console.log('运行: npm run dev\n');
  }
}

migrateWithAuthUser();
