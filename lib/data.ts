import { Milestone, WealthRecord, LifeGoal, Project, WealthRecordWithTotal, AssetBreakdown } from '@/types';

// ==========================================
// 示例数据 (已清理 - 用于开发测试)
// ==========================================

export const sampleMilestones: Milestone[] = [];
export const sampleWealthRecords: WealthRecordWithTotal[] = [];
export const sampleGoals: LifeGoal[] = [];
export const sampleProjects: Project[] = [];

// ==========================================
// 工具函数
// ==========================================

/**
 * 格式化货币为人民币显示
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 格式化日期为中文格式
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * 格式化月份为中文格式（年月）
 */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * 获取项目状态标签
 */
export function getProjectStatusLabel(status: Project['status']): string {
  const labels: Record<Project['status'], string> = {
    'active': '活跃维护',
    'in-progress': '开发中',
    'completed': '已完成',
    'archived': '已归档',
    'planning': '规划中',
  };
  return labels[status] || status;
}

/**
 * 获取项目分类标签
 */
export function getProjectCategoryLabel(category: Project['category']): string {
  const labels: Record<Project['category'], string> = {
    'web': 'Web 应用',
    'mobile': '移动应用',
    'desktop': '桌面应用',
    'ai-ml': 'AI/ML 项目',
    'infrastructure': '基础设施',
    'other': '其他',
  };
  return labels[category] || category;
}

/**
 * 获取里程碑类型标签
 */
export function getMilestoneTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'release': 'Release',
    'feature': 'Feature',
    'achievement': 'Achievement',
    'learning': 'Learning',
  };
  return labels[type] || type;
}

/**
 * 计算财富记录的总资产
 */
export function getWealthRecordWithTotal(record: WealthRecord): WealthRecordWithTotal {
  const breakdown = (record.breakdown || {}) as AssetBreakdown;
  const totalAssets =
    (breakdown.liquid || 0) +
    (breakdown.equities || 0) +
    (breakdown.realEstate || 0) +
    (breakdown.other || 0);

  return {
    ...record,
    totalAssets,
    breakdown: breakdown || {
      liquid: 0,
      equities: 0,
      realEstate: 0,
      other: 0,
    },
  };
}

/**
 * 获取资产分类标签
 */
export function getAssetClassLabel(assetClass: string): string {
  const labels: Record<string, string> = {
    'tangible-shelter': '居所',
    'tangible-vehicle': '车辆',
    'intangible-experiential': '体验',
    'venture-autonomy': '自主权',
    'venture-investment': '投资',
    'equities': '股票',
    'real-estate': '房产',
    'other': '其他',
  };
  return labels[assetClass] || assetClass;
}

/**
 * 导航菜单项
 */
export const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: 'LayoutDashboard' },
  { href: '/timeline', label: '人生节点', icon: 'Timeline' },
  { href: '/wealth', label: '财富记录', icon: 'TrendingUp' },
  { href: '/goals', label: '人生目标', icon: 'Target' },
  { href: '/projects', label: '项目作品', icon: 'Briefcase' },
  { href: '/assets', label: '资产清单', icon: 'Package' },
];

