#!/usr/bin/env node

/**
 * Lumen API 验证脚本
 * 测试所有CRUD接口是否正常工作
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Supabase配置 - 从环境变量读取
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 缺少Supabase环境变量');
  console.error('请确保 .env.local 文件存在并包含:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`),
};

// 测试结果
const results = {
  passed: [],
  failed: [],
  skipped: [],
};

// 辅助函数
function markResult(testName, passed, details = '') {
  if (passed) {
    results.passed.push({ test: testName, details });
    log.success(`${testName}: ${details || '通过'}`);
  } else {
    results.failed.push({ test: testName, details });
    log.error(`${testName}: ${details || '失败'}`);
  }
}

async function testAPI(name, testFn) {
  try {
    log.info(`正在测试: ${name}...`);
    await testFn();
  } catch (error) {
    markResult(name, false, error.message);
  }
}

// ==================== 用户认证测试 ====================

async function testAuth() {
  log.section('用户认证测试');

  // 测试登录
  log.info('正在测试: 用户登录 (13170906656@163.com / chd1997)...');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: '13170906656@163.com',
      password: 'chd1997',
    });

    if (error) {
      throw new Error(`登录失败: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('登录成功但没有返回用户数据');
    }

    if (!data.session) {
      throw new Error('登录成功但没有返回session');
    }

    log.success(`用户ID: ${data.user.id}`);
    log.success(`Access Token: ${data.session.access_token ? '存在' : '缺失'}`);

    markResult('用户登录', true, `用户 ${data.user.email}`);

    return data.user;
  } catch (error) {
    markResult('用户登录', false, error.message);
    throw error;
  }
}

// ==================== Milestones API 测试 ====================

async function testMilestones(user) {
  log.section('Timeline Milestones API 测试');

  // 获取所有milestones
  await testAPI('GET /milestones - 获取所有里程碑', async () => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*');

    if (error) throw new Error(error.message);
    if (!data) throw new Error('返回数据为空');

    markResult('GET /milestones', true, `找到 ${data.length} 个里程碑`);
  });

  // 获取当前用户的milestones
  await testAPI('GET /milestones?user_id=eq.{user_id} - 用户数据隔离', async () => {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    if (!data) throw new Error('返回数据为空');

    markResult('用户数据隔离', true, `用户有 ${data.length} 个里程碑`);
  });

  // 创建新milestone
  await testAPI('POST /milestones - 创建新里程碑', async () => {
    const newMilestone = {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0], // Use date format, not datetime
      title: 'API测试里程碑',
      description: '这是API测试自动创建的里程碑',
      category: 'foundation',
      capital_deployed: 100000,
      asset_class: 'tangible-shelter',
      status: 'completed',
    };

    const { data, error } = await supabase
      .from('milestones')
      .insert(newMilestone)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('创建失败，没有返回数据');

    markResult('POST /milestones', true, `创建成功: ${data.title} (ID: ${data.id})`);

    return data; // 返回创建的数据用于后续测试
  });
}

// ==================== Wealth Records API 测试 ====================

async function testWealth(user) {
  log.section('Wealth Records API 测试');

  // 获取所有wealth records
  await testAPI('GET /wealth_records - 获取所有财富记录', async () => {
    const { data, error } = await supabase
      .from('wealth_records')
      .select('*');

    if (error) throw new Error(error.message);
    if (!data) throw new Error('返回数据为空');

    markResult('GET /wealth_records', true, `找到 ${data.length} 条记录`);
  });

  // 创建新wealth record
  await testAPI('POST /wealth_records - 创建财富记录', async () => {
    // Use tomorrow's date to avoid unique constraint violation
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newRecord = {
      user_id: user.id,
      date: tomorrow.toISOString().split('T')[0],
      total_assets: 1000000,
      change_amount: 50000,
      change_reason: 'API测试',
      breakdown: {
        liquid: 300000,
        equities: 400000,
        realEstate: 250000,
        other: 50000,
      },
    };

    const { data, error } = await supabase
      .from('wealth_records')
      .insert(newRecord)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('创建失败，没有返回数据');

    markResult('POST /wealth_records', true, `创建成功 (ID: ${data.id})`);
  });
}

// ==================== Life Goals API 测试 ====================

async function testGoals(user) {
  log.section('Life Goals API 测试');

  // 获取所有goals
  await testAPI('GET /life_goals - 获取所有目标', async () => {
    const { data, error } = await supabase
      .from('life_goals')
      .select('*');

    if (error) throw new Error(error.message);
    if (!data) throw new Error('返回数据为空');

    markResult('GET /life_goals', true, `找到 ${data.length} 个目标`);
  });

  // 创建新goal
  await testAPI('POST /life_goals - 创建目标', async () => {
    const newGoal = {
      user_id: user.id,
      title: 'API测试目标',
      description: '测试目标描述',
      category: 'financial',
      target_date: '2025-12-31',
      progress: 50,
      estimated_cost: 100000,
      status: 'in-progress',
      priority: 'high',
    };

    const { data, error } = await supabase
      .from('life_goals')
      .insert(newGoal)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('创建失败，没有返回数据');

    markResult('POST /life_goals', true, `创建成功: ${data.title} (ID: ${data.id})`);
  });
}

// ==================== Projects API 测试 ====================

async function testProjects(user) {
  log.section('Projects API 测试');

  // 获取所有projects
  await testAPI('GET /projects - 获取所有项目', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw new Error(error.message);
    if (!data) throw new Error('返回数据为空');

    markResult('GET /projects', true, `找到 ${data.length} 个项目`);
  });

  // 创建新project
  await testAPI('POST /projects - 创建项目', async () => {
    const newProject = {
      user_id: user.id,
      name: 'API测试项目',
      description: '项目描述',
      long_description: '详细描述',
      status: 'active',
      category: 'web',
      cover_image: null,
      start_date: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
      progress: 50,
      featured: false,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('创建失败，没有返回数据');

    markResult('POST /projects', true, `创建成功: ${data.name} (ID: ${data.id})`);
  });
}

// ==================== 主测试流程 ====================

async function runAllTests() {
  console.log('\n');
  log.section('Lumen API 验证测试');
  log.info('开始时间: ' + new Date().toLocaleString('zh-CN'));
  console.log('');

  try {
    // 1. 测试认证
    const user = await testAuth();

    // 2. 测试Milestones
    await testMilestones(user);

    // 3. 测试Wealth Records
    await testWealth(user);

    // 4. 测试Life Goals
    await testGoals(user);

    // 5. 测试Projects
    await testProjects(user);

    // 打印总结
    console.log('\n');
    log.section('测试总结');
    console.log(`总计: ${results.passed.length + results.failed.length} 个测试`);
    log.success(`通过: ${results.passed.length} 个`);
    if (results.failed.length > 0) {
      log.error(`失败: ${results.failed.length} 个`);
      console.log('\n失败的测试:');
      results.failed.forEach(({ test, details }) => {
        console.log(`  • ${test}`);
        console.log(`    ${details}`);
      });
    }

    // 退出码
    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    log.error(`测试流程出错: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runAllTests();
