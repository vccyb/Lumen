/**
 * API基类
 *
 * 提供所有API类的共享功能，包括：
 * - 共享的Supabase客户端实例
 * - 通用的CRUD操作（可选）
 * - 统一的错误处理（可选）
 */

import { getSharedSupabaseClient } from '../supabase/shared-client';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * API基类
 *
 * 所有API类都应该继承这个基类，以使用共享的Supabase客户端
 */
export abstract class BaseAPI {
  /**
   * 共享的Supabase客户端实例
   *
   * 所有子类都使用这个实例，避免了重复创建客户端的问题
   */
  protected supabase: SupabaseClient;

  constructor() {
    this.supabase = getSharedSupabaseClient();
  }

  /**
   * 通用的错误处理方法
   *
   * @param entity - 实体名称（用于错误消息）
   * @param operation - 操作类型（如 'fetch', 'create', 'update', 'delete'）
   * @param error - 原始错误对象
   * @throws 标准化的错误
   */
  protected handleError(entity: string, operation: string, error: any): never {
    const message = `Failed to ${operation} ${entity}`;
    console.error(`${message}:`, error);
    throw new Error(`${message}: ${error?.message || 'Unknown error'}`);
  }
}
