import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectAPI } from '../projects';

// Mock Supabase client
vi.mock('@supabase/supabase-js');

describe('ProjectAPI - Core Functionality', () => {
  let api: ProjectAPI;
  let mockSupabase: any;

  beforeEach(() => {
    api = new ProjectAPI();
    mockSupabase = { from: vi.fn() };
    (api as any).supabase = mockSupabase;
  });

  const createThenable = (data: any) => ({
    limit: vi.fn().mockResolvedValue({ data, error: null }),
    then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
  });

  describe('getAll', () => {
    it('should fetch all projects successfully', async () => {
      const mockData = [
        { id: '1', name: 'Project A', category: 'web', status: 'active' },
        { id: '2', name: 'Project B', category: 'mobile', status: 'planning' },
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
      const mockData = [{ id: '1', name: 'Project A', category: 'web' }];

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

      const result = await api.getAll({ category: 'web' });
      expect(result).toEqual(mockData);
    });

    it('should filter by status when provided', async () => {
      const mockData = [{ id: '1', name: 'Project A', status: 'active' }];

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

      const result = await api.getAll({ status: 'active' });
      expect(result).toEqual(mockData);
    });

    it('should filter by featured when provided', async () => {
      const mockData = [{ id: '1', name: 'Featured Project', featured: true }];

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

      const result = await api.getAll({ featured: true });
      expect(result).toEqual(mockData);
    });
  });

  describe('getById', () => {
    it('should fetch project by id', async () => {
      const mockData = { id: '1', name: 'Test Project', category: 'web' };
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
    it('should create new project', async () => {
      const newProject = {
        user_id: 'user-123',
        name: 'New Project',
        description: 'Test description',
        category: 'web' as const,
        status: 'planning' as const,
        tech_stack: ['React', 'TypeScript'],
        featured: false,
      };

      const createdData = { id: '1', ...newProject };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.create(newProject);
      expect(result).toEqual(createdData);
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      const updates = { name: 'Updated Name', progress: 50 };
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
    it('should soft delete project', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      await api.delete('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
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

    it('should auto-update status to completed when progress is 100', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', progress: 100, status: 'completed' },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.updateProgress('1', 100);
      expect(result.status).toBe('completed');
    });

    it('should throw error for invalid progress', async () => {
      await expect(api.updateProgress('1', 150)).rejects.toThrow('Progress must be between 0 and 100');
      await expect(api.updateProgress('1', -10)).rejects.toThrow('Progress must be between 0 and 100');
    });
  });

  describe('search', () => {
    it('should search projects by name using full-text search', async () => {
      const mockData = [{ id: '1', name: 'Lumen Project', description: 'Personal management app' }];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const result = await api.search('Lumen');
      expect(result).toEqual(mockData);
    });

    it('should fallback to ilike search if full-text search fails', async () => {
      const mockData = [{ id: '1', name: 'Lumen Project' }];
      const mockError = { message: 'Full-text search failed' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
            }),
          }),
          or: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const result = await api.search('Lumen');
      expect(result).toEqual(mockData);
    });
  });

  describe('getFeatured', () => {
    it('should fetch featured projects', async () => {
      const mockData = [
        { id: '1', name: 'Featured Project 1', featured: true },
        { id: '2', name: 'Featured Project 2', featured: true },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const result = await api.getFeatured();
      expect(result).toEqual(mockData);
      expect(result.every(p => p.featured)).toBe(true);
    });
  });

  describe('toggleFeatured', () => {
    it('should toggle featured status', async () => {
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: '1', featured: true },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue(mockChain),
      });

      const result = await api.toggleFeatured('1', true);
      expect(result.featured).toBe(true);
    });
  });

  describe('getByTechnology', () => {
    it('should fetch projects using specific technology', async () => {
      const mockData = [
        { id: '1', name: 'React App', tech_stack: ['React', 'TypeScript'] },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      const result = await api.getByTechnology('React');
      expect(result).toEqual(mockData);
    });
  });

  describe('getActive', () => {
    it('should fetch active projects', async () => {
      const mockData = [
        { id: '1', name: 'Active Project 1', status: 'active' },
        { id: '2', name: 'Active Project 2', status: 'in-progress' },
      ];

      const chainWithOrder = createThenable(mockData);
      const chainWithIs = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      const chainWithIn = {
        is: vi.fn().mockReturnValue(chainWithIs),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue(chainWithIn),
        }),
      });

      const result = await api.getActive();
      expect(result).toEqual(mockData);
      expect(result.every(p => p.status === 'active' || p.status === 'in-progress')).toBe(true);
    });
  });

  describe('Singleton', () => {
    it('should export singleton instance', async () => {
      const { projectAPI } = await import('../projects');
      expect(projectAPI).toBeInstanceOf(ProjectAPI);
    });
  });
});
