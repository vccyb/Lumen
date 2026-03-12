'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { sampleWealthRecords, formatCurrency, formatDate } from '@/lib/data';
import { WealthRecord } from '@/types';
import Modal from '@/components/ui/Modal';
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

export default function WealthPage() {
  const [records, setRecords] = useState<WealthRecord[]>(sampleWealthRecords);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChartPanel, setShowChartPanel] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WealthRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // 计算当前总资产
  const currentTotal = records.length > 0 ? records[records.length - 1].totalAssets : 0;

  // 准备图表数据
  const chartData = records.map(record => ({
    month: new Date(record.date).toLocaleDateString('zh-CN', { month: 'short' }),
    date: record.date,
    总资产: record.totalAssets,
    变化额: record.changeAmount,
    流动资金: record.breakdown.liquidCapital,
    股票: record.breakdown.equities,
    房地产: record.breakdown.realEstate,
  }));

  // 筛选记录
  const filteredRecords = records.filter(record => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'positive') return record.changeAmount > 0;
    if (filterCategory === 'negative') return record.changeAmount < 0;
    return true;
  });

  // 添加月份记录
  const handleAddMonth = () => {
    const lastRecord = records[records.length - 1];
    const newDate = new Date(lastRecord.date);
    newDate.setMonth(newDate.getMonth() + 1);

    const newRecord: WealthRecord = {
      id: Date.now().toString(),
      date: newDate,
      totalAssets: lastRecord.totalAssets + 30000,
      changeAmount: 30000,
      changeReason: '月度记录 - 待编辑',
      breakdown: {
        liquidCapital: lastRecord.breakdown.liquidCapital + 5000,
        equities: lastRecord.breakdown.equities + 15000,
        realEstate: lastRecord.breakdown.realEstate + 10000,
        other: lastRecord.breakdown.other + 0,
      },
    };

    setRecords([...records, newRecord]);
    setEditingRecord(newRecord);
    setShowAddModal(true);
  };

  // 添加记录
  const handleAddRecord = (newRecord: Omit<WealthRecord, 'id'>) => {
    const record: WealthRecord = {
      ...newRecord,
      id: Date.now().toString(),
    };
    setRecords([...records, record].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setShowAddModal(false);
  };

  // 更新记录
  const handleUpdateRecord = (updatedRecord: WealthRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingRecord(null);
    setShowAddModal(false);
  };

  // 删除记录
  const handleDeleteRecord = (id: string) => {
    if (confirm('确定要删除这条财富记录吗？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // 计算变化率
  const calculateChangeRate = (record: WealthRecord) => {
    const index = records.findIndex(r => r.id === record.id);
    if (index === 0) return 0;
    const prevRecord = records[index - 1];
    return ((record.totalAssets - prevRecord.totalAssets) / prevRecord.totalAssets) * 100;
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
                <button
                  onClick={() => setShowChartPanel(!showChartPanel)}
                  className={`btn-secondary ${showChartPanel ? 'btn-primary' : ''}`}
                >
                  {showChartPanel ? '隐藏图表' : '显示图表'}
                </button>
                <button
                  onClick={handleAddMonth}
                  className="btn-primary"
                >
                  + 新增月份
                </button>
              </div>
            </div>

            <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
              财富的<span className="text-lumen-text-secondary font-normal italic">足迹</span>
            </h1>
            <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
              记录每月的财富变化，追踪增长趋势，理解每一笔变化背后的原因。让数据讲述你的财富故事。
            </p>
          </section>

          {/* Summary Card */}
          <section className="px-24 pb-12 max-w-[1100px] mx-auto">
            <div className="bg-lumen-surface rounded-2xl p-8 shadow-glow border border-lumen-border-subtle">
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
            </div>
          </section>

          {/* Filter Bar */}
          <section className="px-24 pb-8 max-w-[1100px] mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-xs text-lumen-text-tertiary uppercase tracking-widest font-semibold">
                筛选:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === 'all'
                      ? 'bg-lumen-text-primary text-white'
                      : 'bg-lumen-surface text-lumen-text-secondary hover:bg-lumen-bg-system'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterCategory('positive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === 'positive'
                      ? 'bg-green-500 text-white'
                      : 'bg-lumen-surface text-lumen-text-secondary hover:bg-lumen-bg-system'
                  }`}
                >
                  增长
                </button>
                <button
                  onClick={() => setFilterCategory('negative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === 'negative'
                      ? 'bg-red-500 text-white'
                      : 'bg-lumen-surface text-lumen-text-secondary hover:bg-lumen-bg-system'
                  }`}
                >
                  下降
                </button>
              </div>
            </div>
          </section>

          {/* Records List */}
          <section className="px-24 pb-40 max-w-[1100px] mx-auto">
            <div className="space-y-6">
              {filteredRecords.map((record, index) => {
                const changeRate = calculateChangeRate(record);
                const isPositive = changeRate >= 0;

                return (
                  <article
                    key={record.id}
                    className="bg-lumen-surface rounded-2xl p-8 shadow-subtle border border-lumen-border-subtle hover:shadow-elevated transition-all relative group"
                  >
                    {/* Edit/Delete Buttons */}
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingRecord(record);
                          setShowAddModal(true);
                        }}
                        className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-white text-lumen-text-secondary hover:text-lumen-text-primary transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-red-50 text-lumen-text-secondary hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-start justify-between mb-6 pr-16">
                      <div className="flex items-center gap-6">
                        {/* Date Badge */}
                        <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold px-3 py-1.5 bg-lumen-bg-system rounded-lg">
                          {formatDate(record.date)}
                        </div>

                        {/* Change Badge */}
                        {index > 0 && (
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
                          {formatCurrency(record.totalAssets)}
                        </h3>
                        <div className="flex items-center gap-2 text-lumen-text-secondary mb-4">
                          <span className="text-sm">{record.changeReason}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                            变化额
                          </div>
                          <div className={`text-base font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(record.changeAmount)}
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
                              {formatCurrency(record.breakdown.liquidCapital)}
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
                  </article>
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
                      {formatCurrency(records[records.length - 1].totalAssets - records[0].totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lumen-text-secondary">平均月增长</span>
                    <span className="font-medium text-lumen-text-primary">
                      {formatCurrency((records[records.length - 1].totalAssets - records[0].totalAssets) / (records.length - 1))}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingRecord ? '编辑记录' : '添加财富记录'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newRecord: Omit<WealthRecord, 'id'> = {
              date: new Date(formData.get('date') as string),
              totalAssets: Number(formData.get('totalAssets')),
              changeAmount: Number(formData.get('changeAmount')),
              changeReason: formData.get('changeReason') as string,
              breakdown: {
                liquidCapital: Number(formData.get('liquidCapital')),
                equities: Number(formData.get('equities')),
                realEstate: Number(formData.get('realEstate')),
                other: Number(formData.get('other')),
              },
            };

            if (editingRecord) {
              handleUpdateRecord({ ...newRecord, id: editingRecord.id });
            } else {
              handleAddRecord(newRecord);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              日期
            </label>
            <input
              type="date"
              name="date"
              defaultValue={editingRecord ? editingRecord.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              总资产
            </label>
            <input
              type="number"
              name="totalAssets"
              defaultValue={editingRecord?.totalAssets}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              变化金额
            </label>
            <input
              type="number"
              name="changeAmount"
              defaultValue={editingRecord?.changeAmount}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              变化原因
            </label>
            <input
              type="text"
              name="changeReason"
              defaultValue={editingRecord?.changeReason}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                流动资金
              </label>
              <input
                type="number"
                name="liquidCapital"
                defaultValue={editingRecord?.breakdown.liquidCapital}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                股票与指数
              </label>
              <input
                type="number"
                name="equities"
                defaultValue={editingRecord?.breakdown.equities}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                房地产
              </label>
              <input
                type="number"
                name="realEstate"
                defaultValue={editingRecord?.breakdown.realEstate}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                其他资产
              </label>
              <input
                type="number"
                name="other"
                defaultValue={editingRecord?.breakdown.other}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingRecord ? '保存' : '添加'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
