/**
 * 共享的Supabase客户端实例
 *
 * 使用单例模式确保整个应用只创建一个Supabase客户端
 * 这避免了资源浪费和架构问题
 */

import { createClient as createBrowserClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

let sharedClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * 获取共享的Supabase客户端实例
 *
 * @returns Supabase客户端实例
 */
export function getSharedSupabaseClient() {
  if (!sharedClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    sharedClient = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  }

  return sharedClient;
}

/**
 * 重置共享客户端（主要用于测试）
 *
 * ⚠️ 警告：仅在测试环境中使用
 */
export function resetSharedClient() {
  sharedClient = null;
}
