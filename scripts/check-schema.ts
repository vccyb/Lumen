/**
 * 检查Supabase数据库实际schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 检查数据库schema...\n');

  // 检查各个表是否存在
  const tables = ['milestones', 'wealth_records', 'life_goals', 'projects'];

  for (const table of tables) {
    console.log(`\n📋 检查表: ${table}`);

    try {
      // 尝试查询表结构（PostgreSQL方式）
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: table })
        .select();

      if (error) {
        // 如果RPC不存在，尝试直接查询来推断列
        console.log(`   ⚠️  无法直接获取表结构，尝试查询...`);
        const { data: testData, error: testError } = await supabase
          .from(table)
          .select('*')
          .limit(0);

        if (testError) {
          console.log(`   ❌ 表不存在或无权限: ${testError.message}`);
        } else {
          console.log(`   ✅ 表存在`);
        }
      } else {
        console.log(`   ✅ 列: ${data?.map((d: any) => d.column_name).join(', ')}`);
      }
    } catch (e: any) {
      console.log(`   ❌ 错误: ${e.message}`);
    }
  }

  // 检查是否有users表
  console.log('\n\n👤 检查users表...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ℹ️  users表不存在或无权限（可能使用auth.users）`);
    } else {
      console.log(`   ✅ users表存在，有 ${data.length} 条记录`);
    }
  } catch (e: any) {
    console.log(`   ℹ️  ${e.message}`);
  }
}

checkSchema();
