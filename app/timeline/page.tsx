'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { sampleMilestones, formatCurrency } from '@/lib/data';
import { Milestone } from '@/types';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';

export default function HomePage() {
  const [milestones, setMilestones] = useState(sampleMilestones);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const handleAddMilestone = (newMilestone: Omit<Milestone, 'id'>) => {
    const milestone: Milestone = {
      ...newMilestone,
      id: Date.now().toString(),
    };
    setMilestones([...milestones, milestone].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setShowAddModal(false);
  };

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestones(milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m));
    setEditingMilestone(null);
    setShowAddModal(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm('确定要删除这条人生节点吗？')) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  const getAssetClassLabel = (assetClass: string) => {
    const labels: Record<string, string> = {
      'tangible-shelter': '有形-住房',
      'tangible-vehicle': '有形-交通工具',
      'intangible-experiential': '无形-体验',
      'venture-autonomy': '创业-自主',
      'venture-investment': '创业-投资',
      'equities': '股票',
      'real-estate': '房地产',
    };
    return labels[assetClass] || assetClass;
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingMilestone(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="p-24 max-w-[1100px] mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
              人生叙事
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              + 新增人生节点
            </button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            记录生命的<span className="text-lumen-text-secondary font-normal italic">轨迹</span>
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            每个人生节点都是一次重要的选择与转折。记录那些塑造了你的关键时刻——无论是第一次独立创业、间隔年的觉醒，还是实现长久的梦想。这些故事构成了你独一无二的人生叙事。
          </p>
        </section>

        {/* Ledger Container */}
        <section className="relative pb-40 pt-5 flex flex-col gap-15 px-24 max-w-[1100px] mx-auto">
          {milestones.map((milestone, index) => {
            const isEven = index % 2 === 1;
            const [ref, isVisible] = useScrollAnimation();

            return (
              <article
                key={milestone.id}
                ref={ref}
                className={`scroll-animate grid grid-cols-2 gap-20 p-15 relative z-1 group
                  bg-lumen-surface rounded-2xl shadow-glow transition-transform duration-300 hover:scale-[1.01]
                  ${isEven ? 'order-2' : 'order-1'} ${isVisible ? 'is-visible' : ''}`}
              >
                {/* Edit/Delete Buttons - Inside card, visible on hover */}
                <div className={`absolute top-6 ${isEven ? 'left-6' : 'right-6'} flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                  <button
                    onClick={() => {
                      setEditingMilestone(milestone);
                      setShowAddModal(true);
                    }}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-white text-lumen-text-secondary hover:text-lumen-text-primary transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-red-50 text-lumen-text-secondary hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className={`flex flex-col justify-center max-w-[400px] ${isEven ? 'order-1 items-end text-right' : 'order-2'}`}>
                  {/* Chapter Number */}
                  <div className="text-base font-semibold text-lumen-text-tertiary mb-3">
                    {String(index + 1).padStart(2, '0')}.
                  </div>

                  {/* Title */}
                  <h2 className="text-[42px] leading-tight mb-6 text-lumen-text-primary tracking-tight">
                    {milestone.title}
                  </h2>

                  {/* Reflection */}
                  <p className="text-base text-lumen-text-secondary leading-relaxed mb-12 font-normal">
                    "{milestone.description}"
                  </p>

                  {/* Divider */}
                  <div className={`h-px bg-lumen-border-subtle w-10 mb-6 ${isEven ? 'ml-auto' : ''}`} />

                  {/* Meta Grid */}
                  <div className="flex flex-col gap-6 w-full border-t border-lumen-border-subtle pt-6">
                    {/* Capital Allocated */}
                    <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
                        资本配置
                      </span>
                      <span className="text-base font-medium">
                        {formatCurrency(milestone.capitalDeployed)}
                      </span>
                    </div>

                    {/* Asset Class */}
                    <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
                        资产类别
                      </span>
                      <span className="text-sm font-normal">
                        {getAssetClassLabel(milestone.assetClass).toUpperCase()}
                      </span>
                    </div>

                    {/* Emotional Yield */}
                    <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
                        情感回报
                      </span>
                      <span className="text-base font-semibold text-lumen-text-primary">
                        {milestone.emotionalYield.join('、')}
                      </span>
                    </div>

                    {/* Location or Status */}
                    {(milestone.location || milestone.status) && (
                      <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
                          {milestone.location ? '位置' : '状态'}
                        </span>
                        <span className="text-sm font-normal text-lumen-text-secondary">
                          {milestone.location || (milestone.status === 'compounding' ? '复合增长中' : milestone.status)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual */}
                <div className={`relative w-full aspect-[3/4] overflow-hidden rounded-lg ${isEven ? 'order-2' : 'order-1'}`}>
                  {milestone.imageUrl ? (
                    <Image
                      src={milestone.imageUrl}
                      alt={milestone.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-lumen-bg-system flex items-center justify-center">
                      <svg className="w-16 h-16 text-lumen-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Date Badge */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-sm z-3 text-lumen-text-primary font-semibold text-[10px] uppercase tracking-widest">
                    {formatDate(milestone.date).toUpperCase()}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingMilestone ? '编辑人生节点' : '新增人生节点'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newMilestone: Omit<Milestone, 'id'> = {
              date: new Date(formData.get('date') as string),
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              category: formData.get('category') as Milestone['category'],
              emotionalYield: (formData.get('emotionalYield') as string).split('、').filter(Boolean),
              capitalDeployed: Number(formData.get('capitalDeployed')),
              assetClass: formData.get('assetClass') as Milestone['assetClass'],
              imageUrl: formData.get('imageUrl') as string || undefined,
              location: formData.get('location') as string || undefined,
              status: formData.get('status') as Milestone['status'] || undefined,
            };

            if (editingMilestone) {
              handleUpdateMilestone({ ...newMilestone, id: editingMilestone.id });
            } else {
              handleAddMilestone(newMilestone);
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
              defaultValue={editingMilestone ? editingMilestone.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              标题
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingMilestone?.title}
              required
              placeholder="例如：第一处居所"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              描述
            </label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={editingMilestone?.description}
              placeholder="描述这个人生节点的意义..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                类别
              </label>
              <select
                name="category"
                required
                defaultValue={editingMilestone?.category}
                className="input-field"
              >
                <option value="foundation">基础建设</option>
                <option value="experience">人生体验</option>
                <option value="strategic-asset">战略资产</option>
                <option value="vision-realized">愿景实现</option>
                <option value="life-chapter">人生章节</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                资产类别
              </label>
              <select
                name="assetClass"
                required
                defaultValue={editingMilestone?.assetClass}
                className="input-field"
              >
                <option value="tangible-shelter">有形-住房</option>
                <option value="intangible-experiential">无形-体验</option>
                <option value="venture-autonomy">创业-自主</option>
                <option value="venture-investment">创业-投资</option>
                <option value="real-estate">房地产</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              资本配置金额
            </label>
            <input
              type="number"
              name="capitalDeployed"
              required
              defaultValue={editingMilestone?.capitalDeployed}
              placeholder="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              情感回报（用、分隔）
            </label>
            <input
              type="text"
              name="emotionalYield"
              required
              defaultValue={editingMilestone?.emotionalYield.join('、')}
              placeholder="例如：稳定性、自由、成长"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              位置（可选）
            </label>
            <input
              type="text"
              name="location"
              defaultValue={editingMilestone?.location}
              placeholder="例如：北京市朝阳区"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              图片URL（可选）
            </label>
            <input
              type="url"
              name="imageUrl"
              defaultValue={editingMilestone?.imageUrl}
              placeholder="https://..."
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingMilestone ? '保存' : '添加'}
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
