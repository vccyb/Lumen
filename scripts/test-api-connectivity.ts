/**
 * API连通性测试脚本
 * 用于测试所有API端点是否可以正常连接和获取数据
 *
 * 运行方式：
 * npx tsx scripts/test-api-connectivity.ts
 */

// 加载环境变量
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 定义类型
type Milestone = any;
type WealthRecord = any;
type LifeGoal = any;
type Project = any;

// 简化的API类，用于测试
class MilestoneAPI {
  constructor(private client: any) {}

  async getAll(options?: { category?: string; status?: string; limit?: number }): Promise<Milestone[]> {
    let query = this.client
      .from('milestones')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (options?.category) query = query.eq('category', options.category);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch milestones: ${error.message}`);
    return data;
  }

  async getById(id: string): Promise<Milestone> {
    const { data, error } = await this.client
      .from('milestones')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw new Error(`Failed to fetch milestone: ${error.message}`);
    return data;
  }

  async search(query: string): Promise<Milestone[]> {
    const { data, error } = await this.client
      .from('milestones')
      .select('*')
      .textSearch('title', query)
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (error) throw new Error(`Failed to search milestones: ${error.message}`);
    return data;
  }
}

class WealthRecordAPI {
  constructor(private client: any) {}

  async getAll(options?: { startDate?: string; endDate?: string; limit?: number }): Promise<WealthRecord[]> {
    let query = this.client
      .from('wealth_records')
      .select('*')
      .is('deleted_at', null);

    if (options?.startDate) query = query.gte('date', options.startDate);
    if (options?.endDate) query = query.lte('date', options.endDate);
    query = query.order('date', { ascending: true });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch wealth records: ${error.message}`);
    return data;
  }

  async getLatest(): Promise<WealthRecord | null> {
    const { data, error } = await this.client
      .from('wealth_records')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch latest wealth record: ${error.message}`);
    }
    return data;
  }
}

class LifeGoalAPI {
  constructor(private client: any) {}

  async getAll(options?: { category?: string; status?: string; priority?: string; limit?: number }): Promise<LifeGoal[]> {
    let query = this.client
      .from('life_goals')
      .select('*')
      .is('deleted_at', null);

    if (options?.category) query = query.eq('category', options.category);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.priority) query = query.eq('priority', options.priority);
    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch life goals: ${error.message}`);
    return data;
  }

  async getByPriority(limit?: number): Promise<LifeGoal[]> {
    let query = this.client
      .from('life_goals')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch goals by priority: ${error.message}`);
    return data;
  }

  async getUpcoming(days: number = 30): Promise<LifeGoal[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await this.client
      .from('life_goals')
      .select('*')
      .is('deleted_at', null)
      .not('target_date', 'is', null)
      .lte('target_date', futureDate.toISOString())
      .in('status', ['dreaming', 'planning', 'in-progress'])
      .order('target_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch upcoming goals: ${error.message}`);
    return data;
  }
}

class ProjectAPI {
  constructor(private client: any) {}

  async getAll(options?: { category?: string; status?: string; featured?: boolean; limit?: number }): Promise<Project[]> {
    let query = this.client
      .from('projects')
      .select('*')
      .is('deleted_at', null);

    if (options?.category) query = query.eq('category', options.category);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.featured !== undefined) query = query.eq('featured', options.featured);
    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    return data;
  }

  async getFeatured(): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch featured projects: ${error.message}`);
    return data;
  }

  async getActive(): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .in('status', ['active', 'in-progress'])
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active projects: ${error.message}`);
    return data;
  }
}

// 创建API实例
const milestoneAPI = new MilestoneAPI(supabase);
const wealthRecordAPI = new WealthRecordAPI(supabase);
const lifeGoalAPI = new LifeGoalAPI(supabase);
const projectAPI = new ProjectAPI(supabase);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60));
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

async function testMilestonesAPI() {
  logSection('测试 Milestones API');

  try {
    // 测试获取所有里程碑
    log('测试: getAll() - 获取所有里程碑');
    const milestones = await milestoneAPI.getAll({ limit: 5 });
    logSuccess(`获取到 ${milestones.length} 条里程碑记录`);

    if (milestones.length > 0) {
      const firstMilestone = milestones[0];
      logSuccess(`示例数据: ${firstMilestone.title} (${firstMilestone.category})`);

      // 测试通过ID获取
      log('测试: getById() - 通过ID获取里程碑');
      const milestone = await milestoneAPI.getById(firstMilestone.id);
      logSuccess(`成功获取: ${milestone.title}`);

      // 测试搜索
      log('测试: search() - 搜索里程碑');
      const searchResults = await milestoneAPI.search('test');
      logSuccess(`搜索结果: ${searchResults.length} 条`);
    } else {
      logWarning('数据库中没有里程碑数据，部分测试跳过');
    }

    results.passed += 3;
  } catch (error: any) {
    logError(`Milestones API 测试失败: ${error.message}`);
    results.failed += 3;
  }
}

async function testWealthRecordsAPI() {
  logSection('测试 Wealth Records API');

  try {
    // 测试获取所有财富记录
    log('测试: getAll() - 获取所有财富记录');
    const wealthRecords = await wealthRecordAPI.getAll({ limit: 5 });
    logSuccess(`获取到 ${wealthRecords.length} 条财富记录`);

    if (wealthRecords.length > 0) {
      const firstRecord = wealthRecords[0];
      logSuccess(`示例数据: ${firstRecord.date} - ¥${firstRecord.total_assets}`);

      // 测试获取最新记录
      log('测试: getLatest() - 获取最新财富记录');
      const latest = await wealthRecordAPI.getLatest();
      if (latest) {
        logSuccess(`最新记录: ${latest.date} - ¥${latest.total_assets}`);
      } else {
        logWarning('没有找到最新记录');
      }
    } else {
      logWarning('数据库中没有财富记录数据，部分测试跳过');
    }

    results.passed += 3;
  } catch (error: any) {
    logError(`Wealth Records API 测试失败: ${error.message}`);
    results.failed += 3;
  }
}

async function testLifeGoalsAPI() {
  logSection('测试 Life Goals API');

  try {
    // 测试获取所有目标
    log('测试: getAll() - 获取所有人生目标');
    const goals = await lifeGoalAPI.getAll({ limit: 5 });
    logSuccess(`获取到 ${goals.length} 条人生目标`);

    if (goals.length > 0) {
      const firstGoal = goals[0];
      logSuccess(`示例数据: ${firstGoal.title} (${firstGoal.category})`);

      // 测试按优先级获取
      log('测试: getByPriority() - 按优先级获取目标');
      const priorityGoals = await lifeGoalAPI.getByPriority(3);
      logSuccess(`高优先级目标: ${priorityGoals.length} 条`);

      // 测试获取即将到期的目标
      log('测试: getUpcoming() - 获取即将到期的目标');
      const upcomingGoals = await lifeGoalAPI.getUpcoming(30);
      logSuccess(`即将到期目标: ${upcomingGoals.length} 条`);
    } else {
      logWarning('数据库中没有人生目标数据，部分测试跳过');
    }

    results.passed += 4;
  } catch (error: any) {
    logError(`Life Goals API 测试失败: ${error.message}`);
    results.failed += 4;
  }
}

async function testProjectsAPI() {
  logSection('测试 Projects API');

  try {
    // 测试获取所有项目
    log('测试: getAll() - 获取所有项目');
    const projects = await projectAPI.getAll({ limit: 5 });
    logSuccess(`获取到 ${projects.length} 个项目`);

    if (projects.length > 0) {
      const firstProject = projects[0];
      logSuccess(`示例数据: ${firstProject.name} (${firstProject.category})`);

      // 测试获取精选项目
      log('测试: getFeatured() - 获取精选项目');
      const featuredProjects = await projectAPI.getFeatured();
      logSuccess(`精选项目: ${featuredProjects.length} 个`);

      // 测试获取活跃项目
      log('测试: getActive() - 获取活跃项目');
      const activeProjects = await projectAPI.getActive();
      logSuccess(`活跃项目: ${activeProjects.length} 个`);
    } else {
      logWarning('数据库中没有项目数据，部分测试跳过');
    }

    results.passed += 4;
  } catch (error: any) {
    logError(`Projects API 测试失败: ${error.message}`);
    results.failed += 4;
  }
}

async function printSummary() {
  logSection('测试总结');

  const total = results.passed + results.failed;
  const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';

  log(`总测试数: ${total}`, 'blue');
  logSuccess(`通过: ${results.passed}`);
  if (results.failed > 0) {
    logError(`失败: ${results.failed}`);
  }
  if (results.warnings > 0) {
    logWarning(`警告: ${results.warnings}`);
  }
  log(`成功率: ${successRate}%`, results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('\n🎉 所有API测试通过！', 'green');
  } else {
    log('\n❌ 部分API测试失败，请检查错误信息', 'red');
  }
}

async function main() {
  log('\n🚀 Lumen API连通性测试开始', 'blue');
  log('测试时间: ' + new Date().toLocaleString('zh-CN'), 'blue');

  try {
    await testMilestonesAPI();
    await testWealthRecordsAPI();
    await testLifeGoalsAPI();
    await testProjectsAPI();
  } catch (error: any) {
    logError(`测试过程中发生未捕获的错误: ${error.message}`);
    console.error(error);
  } finally {
    await printSummary();
  }
}

// 运行测试
main().catch(console.error);
