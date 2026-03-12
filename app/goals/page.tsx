'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { sampleLifeGoals, formatCurrency } from '@/lib/data';
import { LifeGoal } from '@/types';
import Modal from '@/components/ui/Modal';
import Progress from '@/components/ui/Progress';

export default function GoalsPage() {
  const [goals, setGoals] = useState(sampleLifeGoals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);

  const getStatusLabel = (status: LifeGoal['status']) => {
    const labels = {
      'dreaming': '梦想中',
      'planning': '规划中',
      'in-progress': '进行中',
      'achieved': '已实现',
    };
    return labels[status];
  };

  const getStatusColor = (status: LifeGoal['status']) => {
    const colors = {
      'dreaming': 'bg-lumen-gray-inactive',
      'planning': 'bg-lumen-blue',
      'in-progress': 'bg-lumen-accent-gold',
      'achieved': 'bg-green-500',
    };
    return colors[status];
  };

  const getCategoryLabel = (category: LifeGoal['category']) => {
    const labels = {
      'financial': '财务目标',
      'experiential': '体验目标',
      'personal-growth': '个人成长',
      'relationship': '关系目标',
      'legacy': '传承目标',
    };
    return labels[category];
  };

  const handleAddGoal = (newGoal: Omit<LifeGoal, 'id'>) => {
    const goal: LifeGoal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    setGoals([...goals, goal]);
    setShowAddModal(false);
  };

  const handleUpdateGoal = (updatedGoal: LifeGoal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    setEditingGoal(null);
    setShowAddModal(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingGoal(null);
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
              人生目标
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              + 新增目标
            </button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">愿景</span>，
            <br />
            你的路径
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            设定人生目标，追踪进度，将梦想与资本配置联系起来。每一个目标都是一个需要精心规划的投资组合。
          </p>
        </section>

        {/* Goals Grid */}
        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {goals.map((goal) => (
              <article
                key={goal.id}
                className="bg-lumen-surface rounded-2xl p-8 shadow-subtle border border-lumen-border-subtle hover:shadow-elevated transition-shadow relative group"
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowAddModal(true);
                    }}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-white text-lumen-text-secondary hover:text-lumen-text-primary transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-red-50 text-lumen-text-secondary hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4 pr-16">
                  <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                    {getCategoryLabel(goal.category)}
                  </span>
                  <span className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full text-white ${getStatusColor(goal.status)}`}>
                    {getStatusLabel(goal.status)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold tracking-tight mb-3 text-lumen-text-primary">
                  {goal.title}
                </h2>

                {/* Description */}
                <p className="text-base text-lumen-text-secondary leading-relaxed mb-6">
                  {goal.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-6">
                  <Progress value={goal.progress} size="md" color={goal.progress >= 75 ? 'green' : goal.progress >= 50 ? 'gold' : 'warm'} />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3 border-t border-lumen-border-subtle pt-4">
                  {goal.targetDate && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                        目标日期
                      </span>
                      <span className="text-sm text-lumen-text-secondary">
                        {new Date(goal.targetDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                      估算成本
                    </span>
                    <span className="text-sm font-medium text-lumen-text-primary">
                      {formatCurrency(goal.estimatedCost)}
                    </span>
                  </div>
                  {goal.milestones.length > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                        关联节点
                      </span>
                      <span className="text-sm text-lumen-text-secondary">
                        {goal.milestones.length} 个
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingGoal ? '编辑目标' : '新增人生目标'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const goalData: Omit<LifeGoal, 'id'> = {
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              category: formData.get('category') as LifeGoal['category'],
              targetDate: formData.get('targetDate')
                ? new Date(formData.get('targetDate') as string)
                : undefined,
              progress: Number(formData.get('progress') || 0),
              estimatedCost: Number(formData.get('estimatedCost')),
              milestones: [],
              status: editingGoal?.status || 'dreaming',
            };

            if (editingGoal) {
              handleUpdateGoal({ ...goalData, id: editingGoal.id });
            } else {
              handleAddGoal(goalData);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              目标标题
            </label>
            <input
              type="text"
              name="title"
              defaultValue={editingGoal?.title}
              required
              placeholder="例如：财务独立"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              目标描述
            </label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={editingGoal?.description}
              placeholder="描述你的目标..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              目标类别
            </label>
            <select
              name="category"
              required
              defaultValue={editingGoal?.category}
              className="input-field"
            >
              <option value="">选择类别</option>
              <option value="financial">财务目标</option>
              <option value="experiential">体验目标</option>
              <option value="personal-growth">个人成长</option>
              <option value="relationship">关系目标</option>
              <option value="legacy">传承目标</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                目标日期
              </label>
              <input
                type="date"
                name="targetDate"
                defaultValue={editingGoal?.targetDate?.toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                估算成本
              </label>
              <input
                type="number"
                name="estimatedCost"
                required
                defaultValue={editingGoal?.estimatedCost}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
              当前进度 (%)
            </label>
            <input
              type="number"
              name="progress"
              min="0"
              max="100"
              defaultValue={editingGoal?.progress || 0}
              placeholder="0"
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingGoal ? '保存' : '创建'}
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
