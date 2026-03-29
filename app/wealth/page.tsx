'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getWealthRecordWithTotal } from '@/lib/data';
import { WealthRecord } from '@/types';
import { wealthRecordAPI } from '@/lib/api/wealth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const calculateTotalAssets = (breakdown: WealthRecord['breakdown']): number => (
  breakdown.liquid + breakdown.equities + breakdown.realEstate + breakdown.other
);

export default function WealthPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<WealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChartPanel, setShowChartPanel] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WealthRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Load wealth records from API
  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wealthRecordAPI.getAll();

      const records = data
        .map((record) => {
          const breakdown = (record.breakdown ?? {}) as Record<string, unknown>;
          return {
            id: record.id,
            date: new Date(record.date),
            changeAmount: toNumber(record.change_amount),
            changeReason: record.change_reason,
            breakdown: {
              liquid: toNumber(breakdown.liquid),
              equities: toNumber(breakdown.equities),
              realEstate: toNumber(breakdown.realEstate ?? breakdown.real_estate),
              other: toNumber(breakdown.other),
            },
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at),
          } as WealthRecord;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setRecords(records);
    } catch (err) {
      console.error('Failed to load wealth records:', err);
      setError('加载财富记录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // 计算当前总资产
  const recordsWithTotal = records.map(getWealthRecordWithTotal);
  const currentTotal = recordsWithTotal.length > 0 ? recordsWithTotal[recordsWithTotal.length - 1].totalAssets : 0;

  // 准备图表数据
  const chartData = recordsWithTotal.map(record => ({
    month: new Date(record.date).toLocaleDateString('zh-CN', { month: 'short' }),
    date: record.date,
    总资产: record.totalAssets,
    变化额: record.changeAmount,
    流动资金: record.breakdown.liquid,
    股票: record.breakdown.equities,
    房地产: record.breakdown.realEstate,
  }));

  // 筛选记录
  const filteredRecords = records
    .filter(record => {
      if (filterCategory === 'all') return true;
      if (filterCategory === 'positive') return record.changeAmount > 0;
      if (filterCategory === 'negative') return record.changeAmount < 0;
      return true;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // 添加月份记录
  const handleAddMonth = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    const lastRecord = records[records.length - 1];
    if (!lastRecord) return;

    const newDate = new Date(lastRecord.date);
    newDate.setMonth(newDate.getMonth() + 1);

    const newRecordData = {
      user_id: user.id,
      date: newDate.toISOString().split('T')[0],
      change_amount: 30000,
      change_reason: '月度记录 - 待编辑',
      breakdown: {
        liquid: lastRecord.breakdown.liquid + 5000,
        equities: lastRecord.breakdown.equities + 15000,
        realEstate: lastRecord.breakdown.realEstate + 10000,
        other: lastRecord.breakdown.other + 0,
      },
      total_assets: calculateTotalAssets({
        liquid: lastRecord.breakdown.liquid + 5000,
        equities: lastRecord.breakdown.equities + 15000,
        realEstate: lastRecord.breakdown.realEstate + 10000,
        other: lastRecord.breakdown.other + 0,
      }),
    };

    try {
      const created = await wealthRecordAPI.create(newRecordData);
      await loadRecords();
      const breakdown = (created.breakdown ?? {}) as Record<string, unknown>;
      const newRecord = {
        id: created.id,
        date: new Date(created.date),
        changeAmount: toNumber(created.change_amount),
        changeReason: created.change_reason,
        breakdown: {
          liquid: toNumber(breakdown.liquid),
          equities: toNumber(breakdown.equities),
          realEstate: toNumber(breakdown.realEstate ?? breakdown.real_estate),
          other: toNumber(breakdown.other),
        },
        createdAt: new Date(created.created_at),
        updatedAt: new Date(created.updated_at),
      } as WealthRecord;
      setEditingRecord(newRecord);
      setShowAddModal(true);
    } catch (err) {
      console.error('Failed to create wealth record:', err);
      alert('创建失败，请重试');
    }
  };

  // 添加记录
  const handleAddRecord = async (newRecord: Omit<WealthRecord, 'id'>) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const recordData = {
        user_id: user.id,
        date: newRecord.date.toISOString().split('T')[0],
        change_amount: newRecord.changeAmount,
        change_reason: newRecord.changeReason,
        total_assets: calculateTotalAssets(newRecord.breakdown),
        breakdown: {
          liquid: newRecord.breakdown.liquid,
          equities: newRecord.breakdown.equities,
          realEstate: newRecord.breakdown.realEstate,
          other: newRecord.breakdown.other,
        },
      };

      await wealthRecordAPI.create(recordData);
      await loadRecords();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create wealth record:', err);
      alert('创建失败，请重试');
    }
  };

  // 更新记录
  const handleUpdateRecord = async (updatedRecord: WealthRecord) => {
    try {
      const recordData = {
        date: updatedRecord.date.toISOString().split('T')[0],
        change_amount: updatedRecord.changeAmount,
        change_reason: updatedRecord.changeReason,
        total_assets: calculateTotalAssets(updatedRecord.breakdown),
        breakdown: {
          liquid: updatedRecord.breakdown.liquid,
          equities: updatedRecord.breakdown.equities,
          realEstate: updatedRecord.breakdown.realEstate,
          other: updatedRecord.breakdown.other,
        },
      };

      await wealthRecordAPI.update(updatedRecord.id, recordData);
      await loadRecords();
      setEditingRecord(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to update wealth record:', err);
      alert('更新失败，请重试');
    }
  };

  // 删除记录
  const handleDeleteRecord = async (id: string) => {
    if (confirm('确定要删除这条财富记录吗？')) {
      try {
        await wealthRecordAPI.delete(id);
        await loadRecords();
      } catch (err) {
        console.error('Failed to delete wealth record:', err);
        alert('删除失败，请重试');
      }
    }
  };

  // 计算变化率
  const calculateChangeRate = (record: WealthRecord) => {
    const index = records.findIndex(r => r.id === record.id);
    if (index === 0) return 0;
    const prevRecord = records[index - 1];
    const prevRecordWithTotal = getWealthRecordWithTotal(prevRecord);
    const recordWithTotal = getWealthRecordWithTotal(record);
    return ((recordWithTotal.totalAssets - prevRecordWithTotal.totalAssets) / prevRecordWithTotal.totalAssets) * 100;
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className={`flex-1 overflow-y-auto ${showChartPanel ? 'grid grid-cols-2 gap-8' : ''}`}>
        {/* 左侧：记录列表 */}
        <div className={showChartPanel ? 'overflow-y-auto' : ''}>
          {/* Header */}
          <section className="p-24 max-w-[1100px] mx-auto relative">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                财富记录
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowChartPanel(!showChartPanel)}
                >
                  {showChartPanel ? '隐藏图表' : '显示图表'}
                </Button>
                <Button
                  variant="warm"
                  onClick={handleAddMonth}
                >
                  + 新增月份
                </Button>
              </div>
            </div>

            <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
              财富的<span className="text-lumen-text-secondary font-normal italic">足迹</span>
            </h1>
            <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
              记录每月的财富变化，追踪增长趋势，理解每一笔变化背后的原因。让数据讲述你的财富故事。
            </p>

            {loading && (
              <div className="mt-10 flex items-center justify-center gap-2 rounded-xl border border-lumen-border-subtle bg-lumen-bg-system/60 py-6 text-lumen-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                加载中...
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-8">
                {error}
                <Button variant="link" onClick={loadRecords} className="ml-2">
                  重试
                </Button>
              </div>
            )}
          </section>

          {/* Summary Card */}
          <section className="px-24 pb-12 max-w-[1100px] mx-auto">
            <Card className="p-8 shadow-glow">
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                    当前总资产
                  </div>
                  <div className="text-3xl font-bold text-lumen-text-primary">
                    {formatCurrency(currentTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                    记录数量
                  </div>
                  <div className="text-3xl font-bold text-lumen-text-primary">
                    {records.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                    最大增幅
                  </div>
                  <div className="text-3xl font-bold text-green-500">
                    {records.length > 1 ? `+${Math.max(...records.slice(1).map(calculateChangeRate)).toFixed(1)}%` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                    资产跨度
                  </div>
                  <div className="text-3xl font-bold text-lumen-text-primary">
                    {records.length > 0 ? `${records.length} 个月` : '-'}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Filter Bar */}
          <section className="px-24 pb-8 max-w-[1100px] mx-auto">
            <Tabs value={filterCategory} onValueChange={setFilterCategory}>
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="positive">增长</TabsTrigger>
                <TabsTrigger value="negative">下降</TabsTrigger>
              </TabsList>
            </Tabs>
          </section>

          {/* Records List */}
          <section className="px-24 pb-40 max-w-[1100px] mx-auto">
            <div className="space-y-6">
              {filteredRecords.map((record) => {
                const changeRate = calculateChangeRate(record);
                const isPositive = changeRate >= 0;
                const historicalIndex = records.findIndex(r => r.id === record.id);
                const hasHistoricalRecord = historicalIndex > 0;

                return (
                  <Card key={record.id} className="hover:shadow-elevated transition-all relative group">
                    {/* Edit/Delete Buttons */}
                    <div className="absolute top-6 right-6 z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingRecord(record);
                          setShowAddModal(true);
                        }}
                        className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <CardContent className="p-8">

                    <div className="flex items-start justify-between mb-6 pr-16">
                      <div className="flex items-center gap-6">
                        {/* Date Badge */}
                        <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold px-3 py-1.5 bg-lumen-bg-system rounded-lg">
                          {formatDate(record.date)}
                        </div>

                        {/* Change Badge */}
                        {hasHistoricalRecord && (
                          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            isPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{changeRate.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left: Financial Summary */}
                      <div>
                        <h3 className="text-2xl font-semibold text-lumen-text-primary mb-4">
                          {formatCurrency(getWealthRecordWithTotal(record).totalAssets)}
                        </h3>
                        <div className="flex items-center gap-2 text-lumen-text-secondary mb-4">
                          <span className="text-sm">{record.changeReason}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                            变化额
                          </div>
                          <div className={`text-base font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(record.changeAmount || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Asset Breakdown */}
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                          资产配置
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-lumen-text-secondary">流动资金</span>
                            <span className="text-sm font-medium text-lumen-text-primary">
                              {formatCurrency(record.breakdown.liquid)}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-lumen-text-secondary">股票与指数</span>
                            <span className="text-sm font-medium text-lumen-text-primary">
                              {formatCurrency(record.breakdown.equities)}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-lumen-text-secondary">房地产</span>
                            <span className="text-sm font-medium text-lumen-text-primary">
                              {formatCurrency(record.breakdown.realEstate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-lumen-text-secondary">其他资产</span>
                            <span className="text-sm font-medium text-lumen-text-primary">
                              {formatCurrency(record.breakdown.other)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* 右侧：图表分析面板 */}
        {showChartPanel && (
          <div className="border-l border-lumen-border-subtle bg-lumen-surface overflow-y-auto">
            <div className="p-8 sticky top-0">
              {/* Chart Type Selector */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-lumen-text-primary">图表分析</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      chartType === 'line'
                        ? 'bg-lumen-accent-gold text-white'
                        : 'bg-lumen-bg-system text-lumen-text-secondary hover:bg-lumen-border-subtle'
                    }`}
                  >
                    折线图
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      chartType === 'area'
                        ? 'bg-lumen-accent-gold text-white'
                        : 'bg-lumen-bg-system text-lumen-text-secondary hover:bg-lumen-border-subtle'
                    }`}
                  >
                    面积图
                  </button>
                </div>
              </div>

              {/* 总资产趋势图 */}
              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-4">
                  总资产趋势
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis
                          dataKey="month"
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #EAEAEA',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: any) => value ? formatCurrency(Number(value)) : ''}
                        />
                        <Line
                          type="monotone"
                          dataKey="总资产"
                          stroke="#F0A07A"
                          strokeWidth={3}
                          dot={{ fill: '#F0A07A', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis
                          dataKey="month"
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #EAEAEA',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: any) => value ? formatCurrency(Number(value)) : ''}
                        />
                        <Area
                          type="monotone"
                          dataKey="总资产"
                          stroke="#F0A07A"
                          strokeWidth={3}
                          fill="url(#colorTotalAssets)"
                        />
                        <defs>
                          <linearGradient id="colorTotalAssets" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F0A07A" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F0A07A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 变化额趋势图 */}
              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-4">
                  月度变化
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                      <XAxis
                        dataKey="month"
                        stroke="#666666"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#666666"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #EAEAEA',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        formatter={(value: any) => value ? formatCurrency(Number(value)) : ''}
                      />
                      <Bar
                        dataKey="变化额"
                        fill="#D5546C"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 资产配置对比 */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-4">
                  资产配置变化
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis
                          dataKey="month"
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #EAEAEA',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: any) => value ? formatCurrency(Number(value)) : ''}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="流动资金"
                          stroke="#007AFF"
                          strokeWidth={2}
                          dot={{ fill: '#007AFF', r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="股票"
                          stroke="#111111"
                          strokeWidth={2}
                          dot={{ fill: '#111111', r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="房地产"
                          stroke="#D5546C"
                          strokeWidth={2}
                          dot={{ fill: '#D5546C', r: 3 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" />
                        <XAxis
                          dataKey="month"
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666666"
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #EAEAEA',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value: any) => value ? formatCurrency(Number(value)) : ''}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="流动资金"
                          stroke="#007AFF"
                          strokeWidth={2}
                          fill="url(#colorLiquid)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="股票"
                          stroke="#111111"
                          strokeWidth={2}
                          fill="url(#colorEquities)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="房地产"
                          stroke="#D5546C"
                          strokeWidth={2}
                          fill="url(#colorRealEstate)"
                          fillOpacity={0.6}
                        />
                        <defs>
                          <linearGradient id="colorLiquid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEquities" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#111111" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#111111" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRealEstate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D5546C" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#D5546C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 统计摘要 */}
              <div className="mt-8 p-4 bg-lumen-bg-system rounded-lg">
                <h3 className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                  统计摘要
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-lumen-text-secondary">总增长</span>
                    <span className="font-medium text-lumen-text-primary">
                      {formatCurrency(recordsWithTotal[recordsWithTotal.length - 1].totalAssets - recordsWithTotal[0].totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lumen-text-secondary">平均月增长</span>
                    <span className="font-medium text-lumen-text-primary">
                      {formatCurrency((recordsWithTotal[recordsWithTotal.length - 1].totalAssets - recordsWithTotal[0].totalAssets) / (recordsWithTotal.length - 1))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lumen-text-secondary">增长月份</span>
                    <span className="font-medium text-green-500">
                      {records.filter(r => r.changeAmount > 0).length} 个月
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lumen-text-secondary">下降月份</span>
                    <span className="font-medium text-red-500">
                      {records.filter(r => r.changeAmount < 0).length} 个月
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? '编辑记录' : '添加财富记录'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newRecord: Omit<WealthRecord, 'id'> = {
                date: new Date(formData.get('date') as string),
                changeAmount: Number(formData.get('changeAmount')),
                changeReason: formData.get('changeReason') as string,
                breakdown: {
                  liquid: Number(formData.get('liquid')),
                  equities: Number(formData.get('equities')),
                  realEstate: Number(formData.get('realEstate')),
                  other: Number(formData.get('other')),
                },
                createdAt: editingRecord?.createdAt || new Date(),
                updatedAt: new Date(),
              };

              if (editingRecord) {
                handleUpdateRecord({ ...newRecord, id: editingRecord.id });
              } else {
                handleAddRecord(newRecord);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                name="date"
                defaultValue={editingRecord ? editingRecord.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeAmount">变化金额</Label>
              <Input
                id="changeAmount"
                type="number"
                name="changeAmount"
                defaultValue={editingRecord?.changeAmount}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeReason">变化原因</Label>
              <Input
                id="changeReason"
                type="text"
                name="changeReason"
                defaultValue={editingRecord?.changeReason}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="liquid">流动资金</Label>
                <Input
                  id="liquid"
                  type="number"
                  name="liquid"
                  defaultValue={editingRecord?.breakdown.liquid}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equities">股票与指数</Label>
                <Input
                  id="equities"
                  type="number"
                  name="equities"
                  defaultValue={editingRecord?.breakdown.equities}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="realEstate">房地产</Label>
                <Input
                  id="realEstate"
                  type="number"
                  name="realEstate"
                  defaultValue={editingRecord?.breakdown.realEstate}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other">其他资产</Label>
                <Input
                  id="other"
                  type="number"
                  name="other"
                  defaultValue={editingRecord?.breakdown.other}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="warm" className="flex-1">
                {editingRecord ? '保存' : '添加'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
