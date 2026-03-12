'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { sampleWealthRecords, formatCurrency } from '@/lib/data';
import { WealthRecord } from '@/types';
import Modal from '@/components/ui/Modal';

export default function AssetsPage() {
  const [records, setRecords] = useState(sampleWealthRecords);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WealthRecord | null>(null);

  const currentWealth = records[records.length - 1];

  const assets = [
    { name: '流动资金', value: currentWealth.breakdown.liquidCapital, category: 'liquid', icon: '💵', description: '现金、银行存款、货币基金' },
    { name: '股票与指数基金', value: currentWealth.breakdown.equities, category: 'equities', icon: '📈', description: 'ETF、个股、指数基金' },
    { name: '房地产', value: currentWealth.breakdown.realEstate, category: 'real-estate', icon: '🏠', description: '自住房产、投资房产' },
    { name: '其他资产', value: currentWealth.breakdown.other, category: 'other', icon: '💎', description: '数字资产、收藏品、私人投资等' },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'liquid': 'bg-lumen-blue',
      'equities': 'bg-lumen-text-primary',
      'real-estate': 'bg-lumen-warm-end',
      'other': 'bg-lumen-accent-gold',
    };
    return colors[category as keyof typeof colors] || 'bg-lumen-gray-inactive';
  };

  const handleUpdateAssets = (updatedRecord: WealthRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingRecord(null);
    setShowEditModal(false);
  };

  const handleEditClick = () => {
    setEditingRecord(currentWealth);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <section className="p-24 max-w-[1100px] mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
              资产清单
            </div>
            <button
              onClick={handleEditClick}
              className="btn-primary"
            >
              编辑资产配置
            </button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">财富</span>，
            <br />
            一目了然
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            详细记录每一项资产，追踪其价值和变化。了解你的财富分布，做出更明智的配置决策。
          </p>
        </section>

        {/* Summary Card */}
        <section className="px-24 pb-12 max-w-[1100px] mx-auto">
          <div className="bg-lumen-surface rounded-2xl p-8 shadow-glow border border-lumen-border-subtle">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                  总资产价值
                </div>
                <div className="text-5xl font-bold tracking-tight text-lumen-text-primary">
                  {formatCurrency(currentWealth.totalAssets)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                  最新更新
                </div>
                <div className="text-sm text-lumen-text-secondary">
                  {new Date(currentWealth.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Allocation Chart Placeholder */}
            <div className="h-2 bg-lumen-bg-system rounded-full overflow-hidden flex">
              {assets.map((asset) => {
                const percentage = (asset.value / currentWealth.totalAssets) * 100;
                return (
                  <div
                    key={asset.name}
                    className={`h-full ${getCategoryColor(asset.category)}`}
                    style={{ width: `${percentage}%` }}
                    title={`${asset.name}: ${percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              {assets.map((asset) => {
                const percentage = (asset.value / currentWealth.totalAssets) * 100;
                return (
                  <div key={asset.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(asset.category)}`} />
                    <span className="text-sm text-lumen-text-secondary">
                      {asset.name} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Assets Grid */}
        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {assets.map((asset) => {
              const percentage = ((asset.value / currentWealth.totalAssets) * 100).toFixed(1);
              return (
                <article
                  key={asset.name}
                  className="bg-lumen-surface rounded-2xl p-6 shadow-subtle border border-lumen-border-subtle hover:shadow-elevated transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{asset.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-lumen-text-primary">{asset.name}</h3>
                        <p className="text-xs text-lumen-text-tertiary uppercase tracking-wider mt-0.5">
                          {asset.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-lumen-text-primary">
                        {formatCurrency(asset.value)}
                      </div>
                      <div className="text-xs text-lumen-text-secondary mt-0.5">
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-lumen-text-secondary mb-4">
                    {asset.description}
                  </p>

                  {/* Mini Bar */}
                  <div className="h-1.5 bg-lumen-bg-system rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCategoryColor(asset.category)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Edit Assets Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        title="编辑资产配置"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updatedRecord: WealthRecord = {
              ...editingRecord!,
              totalAssets: Number(formData.get('totalAssets')),
              breakdown: {
                liquidCapital: Number(formData.get('liquidCapital')),
                equities: Number(formData.get('equities')),
                realEstate: Number(formData.get('realEstate')),
                other: Number(formData.get('other')),
              },
            };
            handleUpdateAssets(updatedRecord);
          }}
          className="space-y-4"
        >
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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              保存
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
