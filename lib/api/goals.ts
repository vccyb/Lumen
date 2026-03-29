import { BaseAPI } from './base';
import { Database } from '@/lib/database.types';

type LifeGoal = Database['public']['Tables']['life_goals']['Row'];
type LifeGoalInsert = Database['public']['Tables']['life_goals']['Insert'];
type LifeGoalUpdate = Database['public']['Tables']['life_goals']['Update'];

/**
 * LifeGoalAPI - 人生目标数据访问层
 *
 * 提供人生目标的 CRUD 操作和特定业务方法
 */
export class LifeGoalAPI extends BaseAPI {
  /**
   * 获取所有人的人生目标
   * @param options - 筛选选项
   * @returns 人生目标数组
   */
  async getAll(options?: {
    category?: LifeGoal['category'];
    status?: LifeGoal['status'];
    priority?: LifeGoal['priority'];
    limit?: number;
  }): Promise<LifeGoal[]> {
    let query = this.supabase
      .from('life_goals')
      .select('*')
      .is('deleted_at', null);

    // Apply filters before ordering
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }

    // Order after all filters
    query = query.order('created_at', { ascending: false });

    // Apply limit last
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError('life goals', 'fetch', error);
    }

    return data as LifeGoal[];
  }

  /**
   * 根据 ID 获取单个目标
   * @param id - 目标 ID
   * @returns 人生目标
   */
  async getById(id: string): Promise<LifeGoal> {
    const { data, error } = await this.supabase
      .from('life_goals')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw this.handleError('life goal', 'fetch', error);
    }

    return data as LifeGoal;
  }

  /**
   * 创建新的人生目标
   * @param goal - 目标数据
   * @returns 创建的人生目标
   */
  async create(goal: LifeGoalInsert): Promise<LifeGoal> {
    const { data, error } = await this.supabase
      .from('life_goals')
      .insert(goal)
      .select()
      .single();

    if (error) {
      throw this.handleError('life goal', 'create', error);
    }

    return data as LifeGoal;
  }

  /**
   * 更新人生目标
   * @param id - 目标 ID
   * @param updates - 更新数据
   * @returns 更新后的人生目标
   */
  async update(id: string, updates: LifeGoalUpdate): Promise<LifeGoal> {
    const { data, error } = await this.supabase
      .from('life_goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw this.handleError('life goal', 'update', error);
    }

    return data as LifeGoal;
  }

  /**
   * 软删除人生目标
   * @param id - 目标 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('life_goals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw this.handleError('life goal', 'delete', error);
    }
  }

  /**
   * 更新目标进度
   * @param id - 目标 ID
   * @param progress - 进度百分比 (0-100)
   * @returns 更新后的目标
   */
  async updateProgress(id: string, progress: number): Promise<LifeGoal> {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    // 如果进度达到100%，自动更新状态为 achieved
    const updates: LifeGoalUpdate = { progress };
    if (progress === 100) {
      updates.status = 'achieved';
    }

    return this.update(id, updates);
  }

  /**
   * 搜索目标（根据标题或描述）
   * @param query - 搜索关键词
   * @returns 匹配的目标
   */
  async search(query: string): Promise<LifeGoal[]> {
    const { data, error } = await this.supabase
      .from('life_goals')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw this.handleError('life goals', 'search', error);
    }

    return data as LifeGoal[];
  }

  /**
   * 获取按优先级排序的目标
   * @param limit - 返回数量限制
   * @returns 按优先级排序的目标数组
   */
  async getByPriority(limit?: number): Promise<LifeGoal[]> {
    // Note: Supabase doesn't support multiple order() calls in the same query
    // We'll order by priority only, and let the application sort by created_at if needed
    let query = this.supabase
      .from('life_goals')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError('goals', 'fetch by priority', error);
    }

    return data as LifeGoal[];
  }

  /**
   * 获取即将到期的目标
   * @param days - 天数范围
   * @returns 即将到期的目标数组
   */
  async getUpcoming(days: number = 30): Promise<LifeGoal[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('life_goals')
      .select('*')
      .is('deleted_at', null)
      .not('target_date', 'is', null)
      .lte('target_date', futureDate.toISOString())
      .in('status', ['dreaming', 'planning', 'in-progress'])
      .order('target_date', { ascending: true });

    if (error) {
      throw this.handleError('upcoming goals', 'fetch', error);
    }

    return data as LifeGoal[];
  }
}

// 导出单例实例
export const lifeGoalAPI = new LifeGoalAPI();
