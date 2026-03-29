/**
 * 数据迁移脚本 v2 - 将mock数据导入到Supabase
 *
 * 运行方式:
 * npx tsx scripts/migrate-data-v2.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
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
  console.error('❌ 缺少环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 获取或创建用户ID
 */
async function getOrCreateUserId(): Promise<string> {
  console.log('👤 检查用户...\n');

  // 尝试从auth.users获取第一个用户
  try {
    // 注意：这需要service role key
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (users && users.length > 0) {
      const userId = users[0].id;
      console.log(`✅ 找到现有用户: ${userId}`);
      return userId;
    }

    console.log('⚠️  没有找到现有用户，创建测试用户...');
  } catch (e) {
    console.log('⚠️  无法列出用户（可能没有service role key）');
  }

  // 创建一个测试用户
  const { data, error } = await supabase.auth.signUp({
    email: 'test-user@lumen-demo.com',
    password: 'Test123456!',
  });

  if (error) {
    console.error('❌ 创建用户失败:', error.message);
    throw error;
  }

  if (data.user) {
    console.log(`✅ 创建新用户: ${data.user.id}`);
    return data.user.id;
  }

  throw new Error('无法获取用户ID');
}

/**
 * 安全的数据插入（忽略列名错误）
 */
async function safeInsert(tableName: string, data: any[]) {
  console.log(`\n📝 插入 ${tableName}...`);

  if (data.length === 0) {
    console.log(`   ℹ️  没有数据需要插入`);
    return { data: [], error: null };
  }

  // 移除可能不存在的列
  const cleanData = data.map(item => {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(item)) {
      // 保留基本字段
      if (['user_id', 'id', 'created_at', 'updated_at', 'deleted_at',
           'title', 'name', 'description', 'status', 'category',
           'progress', 'date', 'start_date', 'last_updated'].includes(key)) {
        cleaned[key] = value;
      }
      // 保留其他非null、非undefined的值
      else if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  });

  const { data: result, error } = await supabase
    .from(tableName)
    .insert(cleanData)
    .select();

  if (error) {
    console.log(`   ⚠️  部分字段可能不匹配，但尝试继续...`);
    console.log(`   错误: ${error.message}`);

    // 尝试只插入最基本的字段
    const minimalData = cleanData.map(item => {
      const minimal: any = {
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      // 根据不同表添加必要字段
      if (tableName === 'milestones') {
        minimal.date = item.date || new Date().toISOString().split('T')[0];
        minimal.title = item.title || 'Untitled';
        minimal.description = item.description || '';
      } else if (tableName === 'wealth_records') {
        minimal.date = item.date || new Date().toISOString().split('T')[0];
        minimal.change_amount = item.change_amount || 0;
        minimal.change_reason = item.change_reason || '';
      } else if (tableName === 'life_goals') {
        minimal.title = item.title || 'Untitled';
        minimal.description = item.description || '';
      } else if (tableName === 'projects') {
        minimal.name = item.name || 'Untitled';
        minimal.description = item.description || '';
        minimal.start_date = item.start_date || new Date().toISOString().split('T')[0];
        minimal.last_updated = item.last_updated || new Date().toISOString().split('T')[0];
      }

      return minimal;
    });

    const { data: retryResult, error: retryError } = await supabase
      .from(tableName)
      .insert(minimalData)
      .select();

    if (retryError) {
      console.error(`   ❌ 插入失败: ${retryError.message}`);
      return { data: null, error: retryError };
    }

    console.log(`   ✅ 成功插入 ${retryResult?.length || 0} 条记录（使用最小字段集）`);
    return { data: retryResult, error: null };
  }

  console.log(`   ✅ 成功插入 ${result?.length || 0} 条记录`);
  return { data: result, error: null };
}

/**
 * 迁移数据到Supabase
 */
async function migrateData() {
  console.log('🚀 开始数据迁移...\n');

  try {
    // 1. 获取用户ID
    const userId = await getOrCreateUserId();
    console.log(`\n📝 使用用户ID: ${userId}\n`);

    // 2. 准备数据（只保留基本字段）
    const now = new Date().toISOString();

    const milestones = sampleMilestones.map(m => ({
      user_id: userId,
      date: m.date.toISOString().split('T')[0],
      title: m.title,
      description: m.description,
      category: m.category,
      status: m.status,
      created_at: m.createdAt.toISOString(),
      updated_at: m.updatedAt.toISOString(),
    }));

    const wealthRecords = sampleWealthRecords.map(r => ({
      user_id: userId,
      date: r.date.toISOString().split('T')[0],
      change_amount: r.changeAmount,
      change_reason: r.changeReason,
      breakdown: r.breakdown,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    }));

    const lifeGoals = sampleLifeGoals.map(g => ({
      user_id: userId,
      title: g.title,
      description: g.description,
      category: g.category,
      progress: g.progress,
      status: g.status,
      created_at: g.createdAt.toISOString(),
      updated_at: g.updatedAt.toISOString(),
    }));

    const projects = sampleProjects.map(p => ({
      user_id: userId,
      name: p.name,
      description: p.description,
      status: p.status,
      category: p.category,
      progress: p.progress || 0,
      featured: p.featured || false,
      start_date: p.createdAt.toISOString().split('T')[0],
      last_updated: p.updatedAt.toISOString().split('T')[0],
      created_at: p.createdAt.toISOString(),
      updated_at: p.updatedAt.toISOString(),
    }));

    // 3. 插入数据
    const [mResult, wResult, gResult, pResult] = await Promise.all([
      safeInsert('milestones', milestones),
      safeInsert('wealth_records', wealthRecords),
      safeInsert('life_goals', lifeGoals),
      safeInsert('projects', projects),
    ]);

    console.log('\n\n🎉 数据迁移完成！\n');

    // 显示统计信息
    console.log('📊 迁移统计:');
    console.log(`   - Milestones: ${mResult.data?.length || 0}`);
    console.log(`   - WealthRecords: ${wResult.data?.length || 0}`);
    console.log(`   - LifeGoals: ${gResult.data?.length || 0}`);
    console.log(`   - Projects: ${pResult.data?.length || 0}`);
    console.log(`   - 总计: ${(mResult.data?.length || 0) + (wResult.data?.length || 0) + (gResult.data?.length || 0) + (pResult.data?.length || 0)} 条记录\n`);

  } catch (error: any) {
    console.error('\n❌ 迁移过程中出错:', error.message);
    process.exit(1);
  }
}

// 运行迁移
migrateData();
