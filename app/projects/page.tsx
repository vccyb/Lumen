'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Progress from '@/components/ui/Progress';
import { getProjectStatusLabel, getProjectCategoryLabel, getMilestoneTypeLabel, formatDate, formatCurrency } from '@/lib/data';
import { Project, ProjectMilestone } from '@/types';
import { projectAPI } from '@/lib/api/projects';
import { ExternalLink, Github, Pencil, Trash2, Plus, Clock, DollarSign, Star, Zap, BookOpen, Trophy, Rocket, ChevronRight, Loader2 } from 'lucide-react';

type FilterStatus = 'all' | Project['status'];

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const parseOptionalNumberFromForm = (value: FormDataEntryValue | null): number | undefined => {
  if (value === null) return undefined;
  const text = String(value).trim();
  if (text === '') return undefined;
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const parseProjectMilestones = (value: unknown): ProjectMilestone[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => {
      const type = item.type as ProjectMilestone['type'];
      return {
        id: String(item.id ?? crypto.randomUUID()),
        date: new Date(String(item.date ?? new Date().toISOString())),
        title: String(item.title ?? '未命名里程碑'),
        description: item.description ? String(item.description) : undefined,
        type: type === 'release' || type === 'feature' || type === 'achievement' || type === 'learning' ? type : 'feature',
        link: item.link ? String(item.link) : undefined,
      };
    });
};

const serializeProjectMilestones = (milestones: ProjectMilestone[]) => {
  return milestones.map((milestone) => ({
    id: milestone.id,
    date: new Date(milestone.date).toISOString(),
    title: milestone.title,
    description: milestone.description ?? null,
    type: milestone.type,
    link: milestone.link ?? null,
  }));
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const selectedProjectMetrics = selectedProject
    ? [
        selectedProject.estimatedHoursInvested
          ? {
              key: 'hours',
              label: '投入时间',
              value: `${selectedProject.estimatedHoursInvested}h`,
              icon: <Clock className="w-3 h-3" />,
            }
          : null,
        selectedProject.monthlyCost !== undefined && selectedProject.monthlyCost > 0
          ? {
              key: 'cost',
              label: '月度成本',
              value: formatCurrency(selectedProject.monthlyCost),
              icon: <DollarSign className="w-3 h-3" />,
            }
          : null,
        selectedProject.progress !== undefined
          ? {
              key: 'progress',
              label: '进度',
              value: `${selectedProject.progress}%`,
              icon: null,
            }
          : null,
      ].filter(Boolean) as Array<{ key: string; label: string; value: string; icon: JSX.Element | null }>
    : [];

  // Load projects from API
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectAPI.getAll();

      const projects = data
        .map((project) => {
          const parsedMilestones = parseProjectMilestones(project.milestones);

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            longDescription: project.long_description ?? undefined,
            status: project.status,
            category: project.category,
            coverImage: project.cover_image ?? undefined,
            techStack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
            links: [],
            startDate: new Date(project.start_date),
            lastUpdated: new Date(project.last_updated),
            progress: toNumber(project.progress),
            milestones: parsedMilestones,
            learnings: [],
            emotionalYield: [],
            estimatedHoursInvested: toNumber(project.estimated_hours_invested),
            monthlyCost: toNumber(project.monthly_cost),
            featured: Boolean(project.featured),
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at),
          } as Project;
        })
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

      setProjects(projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('加载项目失败，请检查网络连接');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getStatusColor = (status: Project['status']) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-500',
      'in-progress': 'bg-lumen-accent-gold',
      'archived': 'bg-lumen-gray-inactive',
      'planning': 'bg-lumen-blue',
    };
    return colors[status] || 'bg-lumen-gray-inactive';
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'release': return <Rocket className="w-3.5 h-3.5" />;
      case 'feature': return <Zap className="w-3.5 h-3.5" />;
      case 'achievement': return <Trophy className="w-3.5 h-3.5" />;
      case 'learning': return <BookOpen className="w-3.5 h-3.5" />;
      default: return <Star className="w-3.5 h-3.5" />;
    }
  };

  const filteredProjects = filterStatus === 'all'
    ? projects || []
    : (projects || []).filter(p => p.status === filterStatus);

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const regularProjects = filteredProjects.filter(p => !p.featured);

  const totalTechStacks = new Set((projects || []).flatMap(p => p.techStack || [])).size;
  const activeCount = (projects || []).filter(p => p.status === 'active' || p.status === 'in-progress').length;

  const handleAddProject = async (data: Omit<Project, 'id'>) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      const projectData = {
        user_id: user.id,
        name: data.name,
        description: data.description,
        long_description: data.longDescription || null,
        status: data.status,
        category: data.category,
        cover_image: data.coverImage || null,
        start_date: data.startDate.toISOString().split('T')[0],
        last_updated: data.lastUpdated.toISOString().split('T')[0],
        progress: data.progress ?? null,
        estimated_hours_invested: data.estimatedHoursInvested ?? null,
        monthly_cost: data.monthlyCost ?? null,
        tech_stack: data.techStack || [],
        milestones: serializeProjectMilestones(data.milestones || []),
        featured: data.featured || false,
      };

      await projectAPI.create(projectData);
      await loadProjects();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('创建失败，请重试');
    }
  };

  const handleUpdateProject = async (updated: Project) => {
    try {
      const projectData = {
        name: updated.name,
        description: updated.description,
        long_description: updated.longDescription || null,
        status: updated.status,
        category: updated.category,
        cover_image: updated.coverImage || null,
        start_date: updated.startDate.toISOString().split('T')[0],
        last_updated: updated.lastUpdated.toISOString().split('T')[0],
        progress: updated.progress ?? null,
        estimated_hours_invested: updated.estimatedHoursInvested ?? null,
        monthly_cost: updated.monthlyCost ?? null,
        tech_stack: updated.techStack || [],
        milestones: serializeProjectMilestones(updated.milestones || []),
        featured: updated.featured || false,
      };

      await projectAPI.update(updated.id, projectData);
      await loadProjects();
      setEditingProject(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('更新失败，请重试');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        await projectAPI.delete(id);
        await loadProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('删除失败，请重试');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProject(null);
  };

  const filterTabs: { label: string; value: FilterStatus }[] = [
    { label: '全部', value: 'all' },
    { label: '活跃维护', value: 'active' },
    { label: '开发中', value: 'in-progress' },
    { label: '已归档', value: 'archived' },
    { label: '规划中', value: 'planning' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="p-24 max-w-[1100px] mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
              项目作品
            </div>
            <Button variant="warm" onClick={() => setShowAddModal(true)}>
              + 新增项目
            </Button>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">创造</span>，
            <br />
            你的<span className="text-lumen-text-secondary font-normal italic">足迹</span>
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            记录每一个项目的诞生与成长，追踪投入与收获，让代码成为人生叙事的一部分。
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
              <Button variant="link" onClick={loadProjects} className="ml-2">
                重试
              </Button>
            </div>
          )}
        </section>

        {/* Summary Card */}
        <section className="px-24 max-w-[1100px] mx-auto mb-8">
          <div className="bg-lumen-surface rounded-2xl p-8 shadow-glow border border-lumen-border-subtle">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-1">
                  项目总数
                </div>
                <div className="text-3xl font-semibold text-lumen-text-primary tracking-tight">
                  {projects.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-1">
                  活跃项目
                </div>
                <div className="text-3xl font-semibold text-green-500 tracking-tight">
                  {activeCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-1">
                  技术栈
                </div>
                <div className="text-3xl font-semibold text-lumen-text-primary tracking-tight">
                  {totalTechStacks}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="px-24 max-w-[1100px] mx-auto mb-8">
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <TabsList>
              {filterTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </section>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="px-24 max-w-[1100px] mx-auto mb-8">
            <div className="grid grid-cols-2 gap-8">
              {featuredProjects.map(project => (
                <article
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-lumen-surface rounded-2xl shadow-glow border border-lumen-border-subtle hover:shadow-elevated transition-all cursor-pointer relative group overflow-hidden col-span-full"
                >
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowAddModal(true); }}
                      className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-white text-lumen-text-secondary hover:text-lumen-text-primary transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                      className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-red-50 text-lumen-text-secondary hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Cover Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-l-2xl">
                      {project.coverImage ? (
                        <Image src={project.coverImage} alt={project.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-lumen-bg-system flex items-center justify-center">
                          <Github className="w-12 h-12 text-lumen-text-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8 pr-16 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                          {getProjectCategoryLabel(project.category)}
                        </span>
                        <span className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full text-white ${getStatusColor(project.status)}`}>
                          {getProjectStatusLabel(project.status)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-semibold tracking-tight mb-2 text-lumen-text-primary">
                        {project.name}
                      </h2>

                      <p className="text-base text-lumen-text-secondary leading-relaxed mb-4">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.techStack || []).map(tech => (
                          <span key={tech} className="text-[10px] px-2.5 py-1 rounded-full bg-lumen-bg-system text-lumen-text-secondary font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {project.progress !== undefined && (
                        <Progress value={project.progress} size="sm" color={project.progress >= 75 ? 'green' : 'gold'} />
                      )}

                      <div className="flex items-center gap-4 mt-4 text-xs text-lumen-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.startDate)}
                        </span>
                        {project.estimatedHoursInvested && (
                          <span>{project.estimatedHoursInvested}h</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Regular Project Cards */}
        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {regularProjects.map(project => (
              <article
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-lumen-surface rounded-2xl p-8 shadow-subtle border border-lumen-border-subtle hover:shadow-elevated transition-shadow cursor-pointer relative group"
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowAddModal(true); }}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-white text-lumen-text-secondary hover:text-lumen-text-primary transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                    className="p-2 bg-lumen-bg-system/80 backdrop-blur-sm rounded-lg shadow-subtle hover:bg-red-50 text-lumen-text-secondary hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Category + Status */}
                <div className="flex items-center justify-between mb-4 pr-16">
                  <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                    {getProjectCategoryLabel(project.category)}
                  </span>
                  <span className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full text-white ${getStatusColor(project.status)}`}>
                    {getProjectStatusLabel(project.status)}
                  </span>
                </div>

                {/* Cover Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-lumen-bg-system">
                  {project.coverImage ? (
                    <Image src={project.coverImage} alt={project.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Github className="w-8 h-8 text-lumen-text-tertiary" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold tracking-tight mb-2 text-lumen-text-primary">
                  {project.name}
                </h2>

                {/* Description */}
                <p className="text-sm text-lumen-text-secondary leading-relaxed mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(project.techStack || []).slice(0, 4).map(tech => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-lumen-bg-system text-lumen-text-secondary font-medium">
                      {tech}
                    </span>
                  ))}
                  {(project.techStack || []).length > 4 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-lumen-bg-system text-lumen-text-tertiary font-medium">
                      +{(project.techStack || []).length - 4}
                    </span>
                  )}
                </div>

                {/* Progress */}
                {project.progress !== undefined && (
                  <div className="mb-4">
                    <Progress value={project.progress} size="sm" color={project.progress >= 75 ? 'green' : 'gold'} />
                  </div>
                )}

                {/* Bottom Info */}
                <div className="flex items-center justify-between border-t border-lumen-border-subtle pt-3">
                  <span className="text-xs text-lumen-text-tertiary">
                    {formatDate(project.lastUpdated)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-lumen-accent-gold">
                    查看详情 <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-lumen-text-tertiary">
              <p className="text-lg mb-2">暂无项目</p>
              <p className="text-sm">点击「+ 新增项目」添加你的第一个项目</p>
            </div>
          )}
        </section>
      </main>

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              {/* Cover Image */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-6 -mx-2 -mt-2">
                {selectedProject.coverImage ? (
                  <Image src={selectedProject.coverImage} alt={selectedProject.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-lumen-bg-system flex items-center justify-center">
                    <Github className="w-16 h-16 text-lumen-text-tertiary" />
                  </div>
                )}
              </div>

              {/* Title + Status */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-lumen-text-primary">{selectedProject.name}</h2>
                <Badge variant={selectedProject.status === 'active' ? 'active' : selectedProject.status === 'in-progress' ? 'in-progress' : selectedProject.status === 'archived' ? 'archived' : 'planning'} className="rounded-full">
                  {getProjectStatusLabel(selectedProject.status)}
                </Badge>
                <span className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
                  {getProjectCategoryLabel(selectedProject.category)}
                </span>
              </div>

              {/* Description */}
              <p className="text-base text-lumen-text-secondary leading-relaxed mb-6">
                {selectedProject.longDescription || selectedProject.description}
              </p>

              {(selectedProject.links || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {(selectedProject.links || []).map(link => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lumen-bg-system text-sm text-lumen-text-secondary hover:text-lumen-text-primary hover:bg-white transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Tech Stack */}
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                  技术栈
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.techStack || []).length > 0 ? (
                    (selectedProject.techStack || []).map(tech => (
                      <Badge key={tech} variant="secondary" className="rounded-full text-xs">
                        {tech}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-lumen-text-secondary">暂未填写技术栈</span>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              {selectedProjectMetrics.length > 0 && (
                <div className={`grid gap-4 mb-6 p-4 bg-lumen-bg-system rounded-xl ${selectedProjectMetrics.length === 1 ? 'grid-cols-1' : selectedProjectMetrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {selectedProjectMetrics.map((metric) => (
                    <div key={metric.key}>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-1">
                        {metric.icon}
                        {metric.label}
                      </div>
                      <div className="text-lg font-semibold text-lumen-text-primary">{metric.value}</div>
                      {metric.key === 'progress' && selectedProject.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={selectedProject.progress} size="sm" color={selectedProject.progress >= 75 ? 'green' : 'gold'} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Milestones Timeline */}
              {(selectedProject.milestones?.length || 0) > 0 && (
                <div className="mb-6">
                  <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-4">
                    里程碑
                  </div>
                  <div className="space-y-0">
                    {(selectedProject.milestones || [])
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((ms, index) => (
                        <div key={ms.id} className="flex gap-4 pb-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${getStatusColor(ms.type === 'release' ? 'active' : ms.type === 'achievement' ? 'active' : 'in-progress')}`}>
                              {getMilestoneIcon(ms.type)}
                            </div>
                            {index < (selectedProject.milestones || []).length - 1 && (
                              <div className="w-px flex-1 bg-lumen-border-subtle mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-lumen-text-primary">{ms.title}</span>
                              <span className="text-[10px] text-lumen-text-tertiary">{getMilestoneTypeLabel(ms.type)}</span>
                            </div>
                            <span className="text-xs text-lumen-text-tertiary">{formatDate(ms.date)}</span>
                            {ms.description && (
                              <p className="text-sm text-lumen-text-secondary mt-1">{ms.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Learnings & Reflections */}
              {(selectedProject.learnings?.length || selectedProject.emotionalYield?.length) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.learnings && selectedProject.learnings.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                        技术收获
                      </div>
                      <div className="space-y-2">
                        {selectedProject.learnings.map((l, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-lumen-text-secondary">
                            <Star className="w-3 h-3 text-lumen-accent-gold flex-shrink-0" />
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProject.emotionalYield && selectedProject.emotionalYield.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                        情感收获
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.emotionalYield.map((e, i) => (
                          <Badge key={i} variant="secondary" className="rounded-full bg-gradient-to-r from-lumen-warm-start/10 to-lumen-warm-end/10 text-lumen-warm-end text-xs">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Project Dialog */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? '编辑项目' : '新增项目'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const techStack = (formData.get('techStack') as string)
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

              const links: { label: string; url: string }[] = [];
              const githubUrl = formData.get('githubUrl') as string;
              const demoUrl = formData.get('demoUrl') as string;
              if (githubUrl) links.push({ label: 'GitHub', url: githubUrl });
              if (demoUrl) links.push({ label: 'Live Demo', url: demoUrl });

              const projectData: Omit<Project, 'id'> = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                longDescription: formData.get('longDescription') as string || undefined,
                status: (formData.get('status') as Project['status']) || 'in-progress',
                category: (formData.get('category') as Project['category']) || 'web',
                coverImage: (formData.get('coverImage') as string) || undefined,
                techStack,
                links,
                startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : new Date(),
                lastUpdated: new Date(),
                progress: parseOptionalNumberFromForm(formData.get('progress')),
                milestones: editingProject?.milestones || [],
                learnings: editingProject?.learnings,
                emotionalYield: editingProject?.emotionalYield,
                estimatedHoursInvested: parseOptionalNumberFromForm(formData.get('estimatedHours')),
                monthlyCost: parseOptionalNumberFromForm(formData.get('monthlyCost')),
                featured: !!formData.get('featured'),
                createdAt: editingProject?.createdAt || new Date(),
                updatedAt: new Date(),
              };

              if (editingProject) {
                handleUpdateProject({ ...projectData, id: editingProject.id });
              } else {
                handleAddProject(projectData);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">项目名称</Label>
              <Input type="text" name="name" defaultValue={editingProject?.name} required placeholder="例如：Lumen" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">项目描述</Label>
              <textarea name="description" required rows={2} defaultValue={editingProject?.description} placeholder="简要描述项目..." className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">详细描述（可选）</Label>
              <textarea name="longDescription" rows={3} defaultValue={editingProject?.longDescription} placeholder="更详细的说明..." className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">项目分类</Label>
                <Select name="category" required defaultValue={editingProject?.category || 'web'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web 应用</SelectItem>
                    <SelectItem value="mobile">移动应用</SelectItem>
                    <SelectItem value="desktop">桌面应用</SelectItem>
                    <SelectItem value="ai-ml">AI/ML 项目</SelectItem>
                    <SelectItem value="infrastructure">基础设施</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select name="status" required defaultValue={editingProject?.status || 'in-progress'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃维护</SelectItem>
                    <SelectItem value="in-progress">开发中</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                    <SelectItem value="planning">规划中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">技术栈（用逗号分隔）</Label>
              <Input type="text" name="techStack" defaultValue={editingProject?.techStack?.join(', ')} placeholder="Next.js, TypeScript, PostgreSQL" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input type="url" name="githubUrl" defaultValue={editingProject?.links?.find(l => l.label === 'GitHub')?.url} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL（可选）</Label>
                <Input type="url" name="demoUrl" defaultValue={editingProject?.links?.find(l => l.label === 'Live Demo')?.url} placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">开始日期</Label>
                <Input type="date" name="startDate" defaultValue={editingProject?.startDate?.toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">进度 (%)</Label>
                <Input type="number" name="progress" min="0" max="100" defaultValue={editingProject?.progress || 0} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">预估投入时间(h)（可选）</Label>
                <Input type="number" name="estimatedHours" defaultValue={editingProject?.estimatedHoursInvested} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyCost">月度成本(¥)（可选）</Label>
                <Input type="number" name="monthlyCost" defaultValue={editingProject?.monthlyCost} placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图 URL（可选）</Label>
              <Input type="url" name="coverImage" defaultValue={editingProject?.coverImage} placeholder="https://images.unsplash.com/..." />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="w-4 h-4 rounded border-lumen-border-subtle text-lumen-accent-gold" />
              <Label htmlFor="featured" className="text-sm text-lumen-text-secondary cursor-pointer">置顶推荐</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="warm" className="flex-1">
                {editingProject ? '保存' : '创建'}
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
