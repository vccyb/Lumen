/**
 * 获取当前登录用户的ID
 *
 * 使用方式:
 * 1. 在 Supabase Dashboard → Authentication 中创建一个用户
 * 2. 运行此脚本获取用户ID
 * 3. 将用户ID复制到迁移脚本中
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserId() {
  console.log('🔍 获取用户信息...\n');

  // 使用service role列出所有用户
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ 获取用户失败:', error.message);
    console.log('\n💡 提示: 请确保使用了 SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('⚠️  没有找到任何用户');
    console.log('\n💡 请先在 Supabase Dashboard 创建用户:');
    console.log('   1. 打开 https://supabase.com/dashboard');
    console.log('   2. 选择你的项目');
    console.log('   3. 左侧菜单 → Authentication → Users');
    console.log('   4. 点击 "Add user" 创建一个用户');
    console.log('   5. 然后重新运行此脚本\n');
    process.exit(1);
  }

  console.log(`✅ 找到 ${users.length} 个用户:\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString('zh-CN')}`);
    console.log(`   Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
    console.log('');
  });

  console.log('💡 使用第一个用户ID进行数据迁移\n');
  console.log(`USER_ID=${users[0].id}`);
}

getUserId();
