'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Milestone } from '@/types';
import { milestoneAPI } from '@/lib/api/milestones';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2 } from 'lucide-react';
import { MilestoneCard } from '@/components/MilestoneCard';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load milestones from API
  const loadMilestones = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await milestoneAPI.getAll();

      const milestones = data
        .map((milestone) => ({
          id: milestone.id,
          date: new Date(milestone.date),
          title: milestone.title,
          description: milestone.description,
          category: milestone.category,
          emotionalYield: [], // TODO: Add emotional_yield field to milestones table
          capitalDeployed: toNumber(milestone.capital_deployed),
          assetClass: milestone.asset_class,
          imageUrl: milestone.image_url?.trim() || undefined,
          location: milestone.location?.trim() || undefined,
          status: milestone.status ?? undefined,
          createdAt: new Date(milestone.created_at),
          updatedAt: new Date(milestone.updated_at),
        } as Milestone))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      setMilestones(milestones);
    } catch (err) {
      console.error('Failed to load milestones:', err);
      setError('加载人生节点失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMilestones();
    }
  }, [user]);

  const handleAddMilestone = async (newMilestone: Omit<Milestone, 'id'>) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const milestoneData = {
        user_id: user.id,
        date: newMilestone.date.toISOString().split('T')[0], // Use date format YYYY-MM-DD
        title: newMilestone.title,
        description: newMilestone.description,
        category: newMilestone.category,
        capital_deployed: newMilestone.capitalDeployed,
        asset_class: newMilestone.assetClass,
        image_url: newMilestone.imageUrl?.trim(),
        location: newMilestone.location?.trim(),
        status: newMilestone.status,
      };

      const created = await milestoneAPI.create(milestoneData);
      await loadMilestones(); // Reload to get the new list
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create milestone:', err);
      alert('创建失败，请重试');
    }
  };

  const handleUpdateMilestone = async (updatedMilestone: Milestone) => {
    try {
      const milestoneData = {
        date: updatedMilestone.date.toISOString().split('T')[0], // Use date format YYYY-MM-DD
        title: updatedMilestone.title,
        description: updatedMilestone.description,
        category: updatedMilestone.category,
        capital_deployed: updatedMilestone.capitalDeployed,
        asset_class: updatedMilestone.assetClass,
        image_url: updatedMilestone.imageUrl?.trim(),
        location: updatedMilestone.location?.trim(),
        status: updatedMilestone.status,
      };

      await milestoneAPI.update(updatedMilestone.id, milestoneData);
      await loadMilestones(); // Reload to get the updated list
      setEditingMilestone(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to update milestone:', err);
      alert('更新失败，请重试');
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    setMilestoneToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMilestone = async () => {
    if (!milestoneToDelete) return;

    try {
      await milestoneAPI.delete(milestoneToDelete);
      await loadMilestones();
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      alert('删除失败，请重试');
    } finally {
      setMilestoneToDelete(null);
    }
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
            <Button variant="warm" onClick={() => setShowAddModal(true)} disabled={loading}>
              + 新增人生节点
            </Button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            记录生命的<span className="text-lumen-text-secondary font-normal italic">轨迹</span>
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            每个人生节点都是一次重要的选择与转折。记录那些塑造了你的关键时刻——无论是第一次独立创业、间隔年的觉醒，还是实现长久的梦想。这些故事构成了你独一无二的人生叙事。
          </p>

          {/* Loading State */}
          {loading && (
            <div className="mt-10 flex items-center justify-center gap-2 rounded-xl border border-lumen-border-subtle bg-lumen-bg-system/60 py-6 text-lumen-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-8">
              {error}
              <Button variant="link" onClick={loadMilestones} className="ml-2">
                重试
              </Button>
            </div>
          )}
        </section>

        {/* Ledger Container */}
        <section className="relative pb-40 pt-5 flex flex-col gap-15 px-24 max-w-[1100px] mx-auto">
          {milestones.map((milestone, index) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              index={index}
              onEdit={(milestone) => {
                setEditingMilestone(milestone);
                setShowAddModal(true);
              }}
              onDelete={handleDeleteMilestone}
            />
          ))}
        </section>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? '编辑人生节点' : '新增人生节点'}</DialogTitle>
          </DialogHeader>
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
                imageUrl: (formData.get('imageUrl') as string || undefined)?.trim(),
                location: (formData.get('location') as string || undefined)?.trim(),
                status: formData.get('status') as Milestone['status'] || undefined,
                createdAt: editingMilestone?.createdAt || new Date(),
                updatedAt: new Date(),
              };

              if (editingMilestone) {
                handleUpdateMilestone({ ...newMilestone, id: editingMilestone.id });
              } else {
                handleAddMilestone(newMilestone);
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
                defaultValue={editingMilestone ? editingMilestone.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                type="text"
                name="title"
                defaultValue={editingMilestone?.title}
                required
                placeholder="例如：第一处居所"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                defaultValue={editingMilestone?.description}
                placeholder="描述这个人生节点的意义..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">类别</Label>
                <Select name="category" required defaultValue={editingMilestone?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">基础建设</SelectItem>
                    <SelectItem value="experience">人生体验</SelectItem>
                    <SelectItem value="strategic-asset">战略资产</SelectItem>
                    <SelectItem value="vision-realized">愿景实现</SelectItem>
                    <SelectItem value="life-chapter">人生章节</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetClass">资产类别</Label>
                <Select name="assetClass" required defaultValue={editingMilestone?.assetClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择资产类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tangible-shelter">有形-住房</SelectItem>
                    <SelectItem value="intangible-experiential">无形-体验</SelectItem>
                    <SelectItem value="venture-autonomy">创业-自主</SelectItem>
                    <SelectItem value="venture-investment">创业-投资</SelectItem>
                    <SelectItem value="real-estate">房地产</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capitalDeployed">资本配置金额</Label>
              <Input
                id="capitalDeployed"
                type="number"
                name="capitalDeployed"
                required
                defaultValue={editingMilestone?.capitalDeployed}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionalYield">情感回报（用、分隔）</Label>
              <Input
                id="emotionalYield"
                type="text"
                name="emotionalYield"
                defaultValue={editingMilestone?.emotionalYield?.join('、') || ''}
                placeholder="例如：稳定性、自由、成长"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">位置（可选）</Label>
              <Input
                id="location"
                type="text"
                name="location"
                defaultValue={editingMilestone?.location}
                placeholder="例如：北京市朝阳区"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">图片URL（可选）</Label>
              <Input
                id="imageUrl"
                type="url"
                name="imageUrl"
                defaultValue={editingMilestone?.imageUrl}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="warm" className="flex-1">
                {editingMilestone ? '保存' : '添加'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteMilestone}
        title="确认删除人生节点"
        description="此操作无法撤销，确定要删除这条人生节点吗？"
      />
    </div>
  );
}
