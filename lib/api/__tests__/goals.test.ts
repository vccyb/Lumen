import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LifeGoalAPI } from '../goals';

// Mock Supabase client
vi.mock('@supabase/supabase-js');

describe('LifeGoalAPI - Core Functionality', () => {
  let api: LifeGoalAPI;
  let mockSupabase: any;

  beforeEach(() => {
    api = new LifeGoalAPI();
    mockSupabase = { from: vi.fn() };
    (api as any).supabase = mockSupabase;
  });

  const createThenable = (data: any) => ({
    limit: vi.fn().mockResolvedValue({ data, error: null }),
    then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
  });

  describe('getAll', () => {
    it('should fetch all life goals successfully', async () => {
      const mockData = [
        { id: '1', title: '目标1', category: 'financial', status: 'planning' },
        { id: '2', title: '目标2', category: 'experiential', status: 'in-progress' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const result = await api.getAll();
      expect(result).toEqual(mockData);
    });

    it('should filter by category when provided', async () => {
      const mockData = [{ id: '1', title: '目标1', category: 'financial' }];

      const chainWithOrder = createThenable(mockData);
      const chainWithEq = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };
      const chainWithIs = {
        eq: vi.fn().mockReturnValue(chainWithEq),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      const result = await api.getAll({ category: 'financial' });
      expect(result).toEqual(mockData);
    });

    it('should filter by status when provided', async () => {
      const mockData = [{ id: '1', title: '目标1', status: 'in-progress' }];

      const chainWithOrder = createThenable(mockData);
      const chainWithEq = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };
      const chainWithIs = {
        eq: vi.fn().mockReturnValue(chainWithEq),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      const result = await api.getAll({ status: 'in-progress' });
      expect(result).toEqual(mockData);
    });
  });

  describe('getById', () => {
    it('should fetch goal by id', async () => {
      const mockData = { id: '1', title: '测试目标', category: 'financial' };
      const result = { data: mockData, error: null };
      const finalResult = Promise.resolve(result);

      const chainWithIs = {
        single: vi.fn().mockReturnValue(finalResult),
      };

      const chainWithEq = {
        is: vi.fn().mockReturnValue(chainWithIs),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(chainWithEq),
        }),
      });

      const actualResult = await api.getById('1');
      expect(actualResult).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create new life goal', async () => {
      const newGoal = {
        user_id: 'user-123',
        title: '新目标',
        description: '测试描述',
        category: 'financial' as const,
        status: 'dreaming' as const,
        progress: 0,
        estimated_cost: 100000,
      };

      const createdData = { id: '1', ...newGoal };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.create(newGoal);
      expect(result).toEqual(createdData);
    });
  });

  describe('update', () => {
    it('should update life goal', async () => {
      const updates = { title: '更新后的标题', progress: 50 };
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', ...updates, updated_at: expect.any(String) },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.update('1', updates);
      expect(result).toBeDefined();
      expect(result.progress).toBe(50);
    });
  });

  describe('delete', () => {
    it('should soft delete life goal', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      await api.delete('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('life_goals');
    });
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', progress: 75 },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.updateProgress('1', 75);
      expect(result.progress).toBe(75);
    });

    it('should auto-update status to achieved when progress is 100', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', progress: 100, status: 'achieved' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.updateProgress('1', 100);
      expect(result.status).toBe('achieved');
    });

    it('should throw error for invalid progress', async () => {
      await expect(api.updateProgress('1', 150)).rejects.toThrow('Progress must be between 0 and 100');
      await expect(api.updateProgress('1', -10)).rejects.toThrow('Progress must be between 0 and 100');
    });
  });

  describe('search', () => {
    it('should search goals by title or description', async () => {
      const mockData = [{ id: '1', title: '财务自由计划', description: '实现财务自由的详细规划' }];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const result = await api.search('财务');
      expect(result).toEqual(mockData);
    });
  });

  describe('getByPriority', () => {
    it('should fetch goals ordered by priority', async () => {
      const mockData = [
        { id: '1', title: '高优先级', priority: 'high' },
        { id: '2', title: '中优先级', priority: 'medium' },
      ];

      const mockChain = {
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => Promise.resolve({ data: mockData, error: null }).then(resolve)),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(mockChain),
        }),
      });

      const result = await api.getByPriority();
      expect(result).toEqual(mockData);
      expect(mockChain.order).toHaveBeenCalledWith('priority', { ascending: false });
    });

    it('should limit results when limit is provided', async () => {
      const mockData = [{ id: '1', title: '高优先级', priority: 'high' }];
      const chainWithLimit = createThenable(mockData);
      const chainWithOrder = {
        limit: vi.fn().mockReturnValue(chainWithLimit),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };

      const chainWithIs = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...chainWithOrder,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      const result = await api.getByPriority(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getUpcoming', () => {
    it('should fetch upcoming goals within date range', async () => {
      const mockData = [
        { id: '1', title: '即将到期', target_date: '2026-04-15', status: 'in-progress' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await api.getUpcoming(30);
      expect(result).toEqual(mockData);
    });
  });

  describe('Singleton', () => {
    it('should export singleton instance', async () => {
      const { lifeGoalAPI } = await import('../goals');
      expect(lifeGoalAPI).toBeInstanceOf(LifeGoalAPI);
    });
  });
});
