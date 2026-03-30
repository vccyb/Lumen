import { BaseAPI } from './base';
import { Database } from '@/lib/database.types';

type WealthRecord = Database['public']['Tables']['wealth_records']['Row'];
type WealthRecordInsert = Database['public']['Tables']['wealth_records']['Insert'];
type WealthRecordUpdate = Database['public']['Tables']['wealth_records']['Update'];

/**
 * WealthRecordAPI - 财富记录数据访问层
 *
 * 提供财富记录的 CRUD 操作和特定业务方法
 */
export class WealthRecordAPI extends BaseAPI {
  /**
   * 获取所有财富记录
   * @param options - 筛选选项
   * @returns 财富记录数组
   */
  async getAll(options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<WealthRecord[]> {
    let query = this.supabase
      .from('wealth_records')
      .select('*')
      .is('deleted_at', null);

    // Apply filters before ordering
    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }

    // Order after all filters
    query = query.order('date', { ascending: true });

    // Apply limit last
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw this.handleError('wealth records', 'fetch', error);
    }

    return data as WealthRecord[];
  }

  /**
   * 根据 ID 获取单个财富记录
   * @param id - 记录 ID
   * @returns 财富记录
   */
  async getById(id: string): Promise<WealthRecord> {
    const { data, error } = await this.supabase
      .from('wealth_records')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      throw this.handleError('wealth record', 'fetch', error);
    }

    return data as WealthRecord;
  }

  /**
   * 获取最新的一条财富记录
   * @returns 最新的财富记录或 null
   */
  async getLatest(): Promise<WealthRecord | null> {
    const { data, error } = await this.supabase
      .from('wealth_records')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No records found
        return null;
      }
      throw this.handleError('latest wealth record', 'fetch', error);
    }

    return data as WealthRecord;
  }

  /**
   * 创建新的财富记录
   * @param record - 财富记录数据
   * @returns 创建的财富记录
   */
  async create(record: WealthRecordInsert): Promise<WealthRecord> {
    // 验证 user_id 存在
    if (!record.user_id) {
      throw new Error('用户ID不能为空，请先登录');
    }

    // 验证 user_id 格式（UUID）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(record.user_id)) {
      throw new Error('用户ID格式无效，请重新登录');
    }

    // 清理该月的软删除记录（作为额外保护）
    await this.supabase
      .from('wealth_records')
      .delete()
      .eq('user_id', record.user_id)
      .eq('date', record.date)
      .not('deleted_at', 'is', null);

    const { data, error } = await this.supabase
      .from('wealth_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      throw this.handleError('wealth record', 'create', error);
    }

    return data as WealthRecord;
  }

  /**
   * 更新财富记录
   * @param id - 记录 ID
   * @param updates - 更新数据
   * @returns 更新后的财富记录
   */
  async update(id: string, updates: WealthRecordUpdate): Promise<WealthRecord> {
    const { data, error } = await this.supabase
      .from('wealth_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw this.handleError('wealth record', 'update', error);
    }

    return data as WealthRecord;
  }

  /**
   * 软删除财富记录
   * @param id - 记录 ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('wealth_records')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw this.handleError('wealth record', 'delete', error);
    }
  }

  /**
   * 计算指定日期范围内的资产变化
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 总变化金额
   */
  async calculateTotalChange(startDate: string, endDate: string): Promise<number> {
    const records = await this.getAll({ startDate, endDate });

    return records.reduce((total, record) => {
      return total + (record.change_amount || 0);
    }, 0);
  }

  /**
   * 按月分组获取财富记录
   * @param year - 年份
   * @returns 按月份分组的财富记录
   */
  async getByMonth(year: number): Promise<Map<number, WealthRecord[]>> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const records = await this.getAll({ startDate, endDate });

    const monthlyRecords = new Map<number, WealthRecord[]>();

    for (const record of records) {
      const month = new Date(record.date).getMonth();
      if (!monthlyRecords.has(month)) {
        monthlyRecords.set(month, []);
      }
      monthlyRecords.get(month)!.push(record);
    }

    return monthlyRecords;
  }

  /**
   * 搜索财富记录（根据原因）
   * @param query - 搜索关键词
   * @returns 匹配的财富记录
   */
  async search(query: string): Promise<WealthRecord[]> {
    const { data, error } = await this.supabase
      .from('wealth_records')
      .select('*')
      .textSearch('change_reason', query)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (error) {
      throw this.handleError('wealth records', 'search', error);
    }

    return data as WealthRecord[];
  }
}

// 导出单例实例
export const wealthRecordAPI = new WealthRecordAPI();
