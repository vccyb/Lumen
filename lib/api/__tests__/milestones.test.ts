import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MilestoneAPI } from '../milestones';

// Mock Supabase client
vi.mock('@supabase/supabase-js');

describe('MilestoneAPI - Core Functionality', () => {
  let api: MilestoneAPI;
  let mockSupabase: any;

  beforeEach(() => {
    api = new MilestoneAPI();

    // Create a simple mock that can be customized for each test
    mockSupabase = {
      from: vi.fn(),
    };

    // Inject mock into API instance
    (api as any).supabase = mockSupabase;
  });

  describe('getAll', () => {
    it('should fetch all milestones successfully', async () => {
      // Arrange
      const mockData = [
        { id: '1', title: 'Milestone 1', date: '2026-03-29' },
        { id: '2', title: 'Milestone 2', date: '2026-03-30' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      // Act
      const result = await api.getAll();

      // Assert
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('milestones');
    });

    it('should filter by category when provided', async () => {
      // Arrange
      const mockData = [];

      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => Promise.resolve({ data: mockData, error: null }).then(resolve)),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(mockChain),
        }),
      });

      // Act
      const result = await api.getAll({ category: 'foundation' });

      // Assert
      expect(result).toEqual(mockData);
      expect(mockChain.eq).toHaveBeenCalledWith('category', 'foundation');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Network error');
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(mockError),
          }),
        }),
      });

      // Act & Assert
      await expect(api.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch milestone by id', async () => {
      // Arrange
      const mockData = { id: '1', title: 'Test Milestone' };
      const mockChain = {
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockChain),
      });

      // Act
      const result = await api.getById('1');

      // Assert
      expect(result).toEqual(mockData);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(mockChain.is).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  describe('create', () => {
    it('should create new milestone', async () => {
      // Arrange
      const newMilestone = {
        user_id: 'user-123',
        date: '2026-03-29',
        title: 'New Milestone',
        description: 'Test',
        category: 'foundation' as const,
        asset_class: 'tangible-shelter' as const,
        emotional_yield: ['test'],
        capital_deployed: 10000,
        status: 'planned' as const,
      };

      const createdData = { id: '1', ...newMilestone };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      // Act
      const result = await api.create(newMilestone);

      // Assert
      expect(result).toEqual(createdData);
      expect(mockSupabase.from).toHaveBeenCalledWith('milestones');
    });
  });

  describe('update', () => {
    it('should update milestone', async () => {
      // Arrange
      const updates = { title: 'Updated' };
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

      // Act
      const result = await api.update('1', updates);

      // Assert
      expect(result).toBeDefined();
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('delete', () => {
    it('should soft delete milestone', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Act
      await api.delete('1');

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('milestones');
    });
  });

  describe('search', () => {
    it('should search milestones', async () => {
      // Arrange
      const mockData = [{ id: '1', title: 'Home' }];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          textSearch: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      });

      // Act
      const result = await api.search('home');

      // Assert
      expect(result).toEqual(mockData);
    });
  });

  describe('Singleton', () => {
    it('should export singleton instance', async () => {
      const { milestoneAPI } = await import('../milestones');

      expect(milestoneAPI).toBeInstanceOf(MilestoneAPI);
    });
  });
});
