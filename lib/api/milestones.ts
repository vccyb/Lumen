import { BaseAPI } from './base';
import { Database } from '@/lib/database.types';

type Milestone = Database['public']['Tables']['milestones']['Row'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];

/**
 * Milestone API
 * 提供里程碑的 CRUD 操作
 */
export class MilestoneAPI extends BaseAPI {
  /**
   * 获取所有里程碑
   */
  async getAll(options?: {
    category?: Milestone['category'];
    status?: Milestone['status'];
    limit?: number;
  }): Promise<Milestone[]> {
    let query = this.supabase
      .from('milestones')
      .select('*, milestone_tags(tag)')
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError('milestones', 'fetch', error);
    }

    return data as Milestone[];
  }

  /**
   * 根据 ID 获取单个里程碑
   */
  async getById(id: string): Promise<Milestone> {
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*, milestone_tags(tag)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw this.handleError('milestone', 'fetch', error);
    }

    return data as Milestone;
  }

  /**
   * 创建新里程碑
   */
  async create(milestone: MilestoneInsert): Promise<Milestone> {
    const { data, error } = await this.supabase
      .from('milestones')
      .insert(milestone)
      .select()
      .single();

    if (error) {
      throw this.handleError('milestone', 'create', error);
    }

    return data as Milestone;
  }

  /**
   * 更新里程碑
   */
  async update(id: string, updates: MilestoneUpdate): Promise<Milestone> {
    const { data, error } = await this.supabase
      .from('milestones')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw this.handleError('milestone', 'update', error);
    }

    return data as Milestone;
  }

  /**
   * 删除里程碑（软删除）
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('milestones')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw this.handleError('milestone', 'delete', error);
    }
  }

  /**
   * 搜索里程碑
   */
  async search(query: string): Promise<Milestone[]> {
    const { data, error } = await this.supabase
      .from('milestones')
      .select('*, milestone_tags(tag)')
      .textSearch('title', query)
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (error) {
      throw this.handleError('milestones', 'search', error);
    }

    return data as Milestone[];
  }
}

// 导出单例实例
export const milestoneAPI = new MilestoneAPI();
