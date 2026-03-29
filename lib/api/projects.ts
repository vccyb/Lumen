import { BaseAPI } from './base';
import { Database } from '@/lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * ProjectAPI - 项目作品数据访问层
 *
 * 提供项目作品的 CRUD 操作和特定业务方法
 */
export class ProjectAPI extends BaseAPI {
  /**
   * 获取所有项目
   * @param options - 筛选选项
   * @returns 项目数组
   */
  async getAll(options?: {
    category?: Project['category'];
    status?: Project['status'];
    featured?: boolean;
    limit?: number;
  }): Promise<Project[]> {
    let query = this.supabase
      .from('projects')
      .select('*')
      .is('deleted_at', null);

    // Apply filters before ordering
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    // Order after all filters
    query = query.order('created_at', { ascending: false });

    // Apply limit last
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError('projects', 'fetch', error);
    }

    return data as Project[];
  }

  /**
   * 根据 ID 获取单个项目
   * @param id - 项目 ID
   * @returns 项目
   */
  async getById(id: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw this.handleError('project', 'fetch', error);
    }

    return data as Project;
  }

  /**
   * 创建新项目
   * @param project - 项目数据
   * @returns 创建的项目
   */
  async create(project: ProjectInsert): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      throw this.handleError('project', 'create', error);
    }

    return data as Project;
  }

  /**
   * 更新项目
   * @param id - 项目 ID
   * @param updates - 更新数据
   * @returns 更新后的项目
   */
  async update(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw this.handleError('project', 'update', error);
    }

    return data as Project;
  }

  /**
   * 软删除项目
   * @param id - 项目 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw this.handleError('project', 'delete', error);
    }
  }

  /**
   * 更新项目进度
   * @param id - 项目 ID
   * @param progress - 进度百分比 (0-100)
   * @returns 更新后的项目
   */
  async updateProgress(id: string, progress: number): Promise<Project> {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    // 如果进度达到100%，自动更新状态为 completed
    const updates: ProjectUpdate = { progress };
    if (progress === 100) {
      updates.status = 'completed';
    }

    return this.update(id, updates);
  }

  /**
   * 搜索项目（根据名称或描述）
   * @param query - 搜索关键词
   * @returns 匹配的项目
   */
  async search(query: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .textSearch('name', query)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to ilike search if full-text search fails
      const fallbackResult = await this.supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,long_description.ilike.%${query}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (fallbackResult.error) {
        throw this.handleError('projects', 'search', fallbackResult.error);
      }

      return fallbackResult.data as Project[];
    }

    return data as Project[];
  }

  /**
   * 获取精选项目
   * @returns 精选项目数组
   */
  async getFeatured(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw this.handleError('featured projects', 'fetch', error);
    }

    return data as Project[];
  }

  /**
   * 切换项目的精选状态
   * @param id - 项目 ID
   * @param featured - 是否精选
   * @returns 更新后的项目
   */
  async toggleFeatured(id: string, featured: boolean): Promise<Project> {
    return this.update(id, { featured });
  }

  /**
   * 获取按技术栈筛选的项目
   * @param tech - 技术栈名称
   * @returns 使用该技术的项目
   */
  async getByTechnology(tech: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .contains('tech_stack', [tech])
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw this.handleError('projects', 'fetch by technology', error);
    }

    return data as Project[];
  }

  /**
   * 获取活跃项目（正在开发或维护中）
   * @returns 活跃项目数组
   */
  async getActive(): Promise<Project[]> {
    let query = this.supabase
      .from('projects')
      .select('*')
      .in('status', ['active', 'in-progress'])
      .is('deleted_at', null);

    // Order by updated_at to show most recently updated active projects
    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw this.handleError('active projects', 'fetch', error);
    }

    return data as Project[];
  }
}

// 导出单例实例
export const projectAPI = new ProjectAPI();
