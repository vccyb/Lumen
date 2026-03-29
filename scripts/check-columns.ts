/**
 * 检查数据库实际列名
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🔍 检查数据库实际列名...\n');

  // 查询information_schema获取列信息
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'milestones' });

  if (error) {
    console.log('无法使用RPC，尝试直接查询...');

    // 尝试插入一条测试数据来推断列名
    const testId = 'test-id-123';
    const testData = {
      id: testId,
      user_id: '00000000-0000-0000-0000-000000000000',
      date: '2026-01-01',
      title: 'Test',
      description: 'Test',
      category: 'foundation',
      status: 'planned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('milestones')
      .insert(testData);

    if (insertError) {
      console.log('Milestones表错误:', insertError.message);
      console.log('\n💡 这告诉我们实际的列要求');

      // 清理可能失败的插入
      await supabase.from('milestones').delete().eq('id', testId);
    }
  } else {
    console.log('Milestones列:', data);
  }

  // 检查users表
  console.log('\n👤 检查users表...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (usersError) {
    console.log('users表不存在或无权限');
    console.log('💡 需要先创建users表的记录');
  } else {
    console.log('users表存在，有', users?.length || 0, '条记录');
  }
}

checkColumns();
