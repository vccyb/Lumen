import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WealthRecordAPI } from '../wealth';

// Mock Supabase client
vi.mock('@supabase/supabase-js');

describe('WealthRecordAPI - Core Functionality', () => {
  let api: WealthRecordAPI;
  let mockSupabase: any;

  beforeEach(() => {
    api = new WealthRecordAPI();

    // Create a simple mock that can be customized for each test
    mockSupabase = {
      from: vi.fn(),
    };

    // Inject mock into API instance
    (api as any).supabase = mockSupabase;
  });

  describe('getAll', () => {
    it('should fetch all wealth records successfully', async () => {
      // Arrange
      const mockData = [
        {
          id: '1',
          date: '2026-01-15',
          change_amount: 50000,
          change_reason: '年终奖',
          breakdown: { liquid: 100000, equities: 200000, real_estate: 1500000, other: 50000 },
        },
        {
          id: '2',
          date: '2026-02-15',
          change_amount: -10000,
          change_reason: '旅行支出',
          breakdown: { liquid: 90000, equities: 200000, real_estate: 1500000, other: 50000 },
        },
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
      expect(mockSupabase.from).toHaveBeenCalledWith('wealth_records');
    });

    it('should filter by date range when provided', async () => {
      // Arrange
      const mockData = [
        { id: '1', date: '2026-01-15', change_amount: 50000 },
        { id: '2', date: '2026-02-15', change_amount: -10000 },
      ];

      // Make the query objects thenable by adding a .then() method
      const chainWithOrder = {
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };

      const chainWithLte = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };

      const chainWithGte = {
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };

      const chainWithIs = {
        gte: vi.fn().mockReturnValue(chainWithGte),
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (resolve: any) => Promise.resolve({ data: mockData, error: null }).then(resolve),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      // Act
      const result = await api.getAll({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      // Assert
      expect(result).toEqual(mockData);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');

      const chainWithOrder = {
        limit: vi.fn(),
        then: (resolve: any, reject: any) => Promise.reject(mockError).catch(reject),
      };

      const chainWithIs = {
        gte: vi.fn().mockReturnValue(chainWithOrder),
        lte: vi.fn().mockReturnValue(chainWithOrder),
        order: vi.fn().mockReturnValue(chainWithOrder),
        limit: vi.fn(),
        then: (resolve: any, reject: any) => Promise.reject(mockError).catch(reject),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      // Act & Assert
      await expect(api.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch wealth record by id', async () => {
      // Arrange
      const mockData = {
        id: '1',
        date: '2026-01-15',
        change_amount: 50000,
        change_reason: '年终奖',
      };

      const result = { data: mockData, error: null };
      const finalResult = Promise.resolve(result);

      // getById does: select().eq().is().single()
      // So chain is: select -> eq -> is -> single
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

      // Act
      const actualResult = await api.getById('1');

      // Assert
      expect(actualResult).toEqual(mockData);
    });

    it('should throw error when record not found', async () => {
      // Arrange
      const mockError = { message: 'Record not found' };
      const result = { data: null, error: mockError };
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

      // Act & Assert
      await expect(api.getById('999')).rejects.toThrow('Failed to fetch wealth record');
    });
  });

  describe('getLatest', () => {
    it('should fetch the latest wealth record', async () => {
      // Arrange
      const mockData = {
        id: '2',
        date: '2026-02-15',
        change_amount: -10000,
        change_reason: '旅行支出',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await api.getLatest();

      // Assert
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('wealth_records');
    });

    it('should return null when no records exist', async () => {
      // Arrange
      const mockError = { code: 'PGRST116', message: 'No rows found' };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await api.getLatest();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new wealth record', async () => {
      // Arrange
      const newRecord = {
        user_id: 'user-123',
        date: '2026-03-15',
        change_amount: 20000,
        change_reason: '股票收益',
        breakdown: {
          liquid: 110000,
          equities: 220000,
          real_estate: 1500000,
          other: 50000,
        },
      };

      const createdData = { id: '3', ...newRecord };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdData, error: null }),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      // Act
      const result = await api.create(newRecord);

      // Assert
      expect(result).toEqual(createdData);
      expect(mockSupabase.from).toHaveBeenCalledWith('wealth_records');
    });

    it('should throw error on invalid data', async () => {
      // Arrange
      const invalidRecord = {
        user_id: 'user-123',
        date: 'invalid-date',
      };
      const mockError = { message: 'Invalid date format' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(mockChain),
      });

      // Act & Assert
      await expect(api.create(invalidRecord)).rejects.toThrow(
        'Failed to create wealth record'
      );
    });
  });

  describe('update', () => {
    it('should update wealth record', async () => {
      // Arrange
      const updates = {
        change_amount: 25000,
        change_reason: '调整后的股票收益',
      };
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
      expect(result.change_amount).toBe(25000);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('delete', () => {
    it('should soft delete wealth record', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      // Act
      await api.delete('1');

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('wealth_records');
    });

    it('should throw error on delete failure', async () => {
      // Arrange
      const mockError = { message: 'Record locked' };
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError }),
        }),
      });

      // Act & Assert
      await expect(api.delete('1')).rejects.toThrow('Failed to delete wealth record');
    });
  });

  describe('calculateTotalChange', () => {
    it('should calculate total change for date range', async () => {
      // Arrange
      const mockData = [
        { change_amount: 50000 },
        { change_amount: -10000 },
        { change_amount: 20000 },
      ];

      const createThenable = (data: any[]) => ({
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
      });

      const chainWithOrder = createThenable(mockData);
      const chainWithLte = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithGte = {
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithIs = {
        gte: vi.fn().mockReturnValue(chainWithGte),
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      // Act
      const total = await api.calculateTotalChange('2026-01-01', '2026-12-31');

      // Assert
      expect(total).toBe(60000); // 50000 - 10000 + 20000
    });

    it('should return 0 for no records', async () => {
      // Arrange
      const mockData: any[] = [];

      const createThenable = (data: any[]) => ({
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
      });

      const chainWithOrder = createThenable(mockData);
      const chainWithLte = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithGte = {
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithIs = {
        gte: vi.fn().mockReturnValue(chainWithGte),
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      // Act
      const total = await api.calculateTotalChange('2026-01-01', '2026-12-31');

      // Assert
      expect(total).toBe(0);
    });
  });

  describe('getByMonth', () => {
    it('should group records by month', async () => {
      // Arrange
      const mockData = [
        { date: '2026-01-15' },
        { date: '2026-01-20' },
        { date: '2026-02-10' },
      ];

      const createThenable = (data: any[]) => ({
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve),
      });

      const chainWithOrder = createThenable(mockData);
      const chainWithLte = {
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithGte = {
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };
      const chainWithIs = {
        gte: vi.fn().mockReturnValue(chainWithGte),
        lte: vi.fn().mockReturnValue(chainWithLte),
        order: vi.fn().mockReturnValue(chainWithOrder),
        ...createThenable(mockData),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue(chainWithIs),
        }),
      });

      // Act
      const monthlyData = await api.getByMonth(2026);

      // Assert
      expect(monthlyData.size).toBeGreaterThan(0);
      expect(monthlyData.get(0)).toHaveLength(2); // January has 2 records
      expect(monthlyData.get(1)).toHaveLength(1); // February has 1 record
    });
  });

  describe('search', () => {
    it('should search wealth records by reason', async () => {
      // Arrange
      const mockData = [
        {
          id: '1',
          change_reason: '股票投资收益',
          change_amount: 50000,
        },
      ];

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
      const result = await api.search('股票');

      // Assert
      expect(result).toEqual(mockData);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Singleton', () => {
    it('should export singleton instance', async () => {
      const { wealthRecordAPI } = await import('../wealth');

      expect(wealthRecordAPI).toBeInstanceOf(WealthRecordAPI);
    });
  });
});
