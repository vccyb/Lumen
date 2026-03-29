'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { formatCurrency } from '@/lib/data';
import { LifeGoal } from '@/types';
import { lifeGoalAPI } from '@/lib/api/goals';
import { useAuth } from '@/contexts/AuthContext';
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
import Progress from '@/components/ui/Progress';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);

  // Load goals from API
  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lifeGoalAPI.getAll();

      const goals = data
        .map((goal) => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.target_date ? new Date(goal.target_date) : undefined,
          progress: toNumber(goal.progress),
          estimatedCost: toNumber(goal.estimated_cost),
          milestones: Array.isArray(goal.milestones) ? goal.milestones : [],
          status: goal.status,
          priority: goal.priority ?? undefined,
          createdAt: new Date(goal.created_at),
          updatedAt: new Date(goal.updated_at),
        } as LifeGoal))
        .sort((a, b) => {
          const aTime = a.targetDate ? a.targetDate.getTime() : a.createdAt.getTime();
          const bTime = b.targetDate ? b.targetDate.getTime() : b.createdAt.getTime();
          return bTime - aTime;
        });

      setGoals(goals);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('加载目标失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

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

  const handleAddGoal = async (newGoal: Omit<LifeGoal, 'id'>) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const goalData = {
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        target_date: newGoal.targetDate ? newGoal.targetDate.toISOString().split('T')[0] : null,
        progress: newGoal.progress,
        estimated_cost: newGoal.estimatedCost,
        status: newGoal.status,
        priority: newGoal.priority || 'medium',
      };

      await lifeGoalAPI.create(goalData);
      await loadGoals();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create goal:', err);
      alert('创建失败，请重试');
    }
  };

  const handleUpdateGoal = async (updatedGoal: LifeGoal) => {
    try {
      const goalData = {
        title: updatedGoal.title,
        description: updatedGoal.description,
        category: updatedGoal.category,
        target_date: updatedGoal.targetDate ? updatedGoal.targetDate.toISOString().split('T')[0] : null,
        progress: updatedGoal.progress,
        estimated_cost: updatedGoal.estimatedCost,
        status: updatedGoal.status,
        priority: updatedGoal.priority || 'medium',
      };

      await lifeGoalAPI.update(updatedGoal.id, goalData);
      await loadGoals();
      setEditingGoal(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to update goal:', err);
      alert('更新失败，请重试');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      try {
        await lifeGoalAPI.delete(id);
        await loadGoals();
      } catch (err) {
        console.error('Failed to delete goal:', err);
        alert('删除失败，请重试');
      }
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
            <Button variant="warm" onClick={() => setShowAddModal(true)}>
              + 新增目标
            </Button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">愿景</span>，
            <br />
            你的路径
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            设定人生目标，追踪进度，将梦想与资本配置联系起来。每一个目标都是一个需要精心规划的投资组合。
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
              <Button variant="link" onClick={loadGoals} className="ml-2">
                重试
              </Button>
            </div>
          )}
        </section>

        {/* Goals Grid */}
        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-8 relative group">
                {/* Edit/Delete Buttons */}
                <div className="absolute top-6 right-6 z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowAddModal(true);
                    }}
                    className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-0">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4 pr-16">
                    <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                      {getCategoryLabel(goal.category)}
                    </span>
                    <Badge
                      variant={goal.status === 'achieved' ? 'active' : goal.status === 'in-progress' ? 'in-progress' : goal.status === 'planning' ? 'planning' : 'secondary'}
                      className="text-xs uppercase tracking-widest"
                    >
                      {getStatusLabel(goal.status)}
                    </Badge>
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
                    {goal.milestones?.length > 0 && (
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGoal ? '编辑目标' : '新增人生目标'}</DialogTitle>
          </DialogHeader>
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
                createdAt: editingGoal?.createdAt || new Date(),
                updatedAt: new Date(),
              };

              if (editingGoal) {
                handleUpdateGoal({ ...goalData, id: editingGoal.id });
              } else {
                handleAddGoal(goalData);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">目标标题</Label>
              <Input
                id="title"
                type="text"
                name="title"
                defaultValue={editingGoal?.title}
                required
                placeholder="例如：财务独立"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">目标描述</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                defaultValue={editingGoal?.description}
                placeholder="描述你的目标..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">目标类别</Label>
              <Select name="category" required defaultValue={editingGoal?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">财务目标</SelectItem>
                  <SelectItem value="experiential">体验目标</SelectItem>
                  <SelectItem value="personal-growth">个人成长</SelectItem>
                  <SelectItem value="relationship">关系目标</SelectItem>
                  <SelectItem value="legacy">传承目标</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">目标日期</Label>
                <Input
                  id="targetDate"
                  type="date"
                  name="targetDate"
                  defaultValue={editingGoal?.targetDate?.toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">估算成本</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  name="estimatedCost"
                  required
                  defaultValue={editingGoal?.estimatedCost}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">当前进度 (%)</Label>
              <Input
                id="progress"
                type="number"
                name="progress"
                min="0"
                max="100"
                defaultValue={editingGoal?.progress || 0}
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="warm" className="flex-1">
                {editingGoal ? '保存' : '创建'}
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
