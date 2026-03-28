// 人生重要节点类型
export interface Milestone {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: MilestoneCategory;
  emotionalYield: string[];
  capitalDeployed: number;
  assetClass: AssetClass;
  imageUrl?: string;
  location?: string;
  status?: MilestoneStatus;
  // Enhanced fields for advanced features
  impactRadius?: number; // 影响力半径 (1-10)，衡量对未来的影响深度
  linkedPeople?: string[]; // 关联人物，记录谁见证了这一刻
  recurrence?: boolean; // 是否为周期性节点（如周年纪念）
  tags?: string[]; // 用户自定义标签（如「婚姻」「健康」「搬家」「职业转换」）
  connections?: string[]; // 关联其他 Milestone ID（如「升职」关联「入职那家公司」）
  mediaAttachments?: MediaAttachment[]; // 多媒体附件
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
}

// 多媒体附件类型
export interface MediaAttachment {
  type: 'image' | 'video' | 'audio';
  url: string;
  caption?: string;
}

export type MilestoneCategory =
  | 'life-chapter'        // 人生章节
  | 'vision-realized'     // 愿景实现
  | 'strategic-asset'     // 战略资产
  | 'experience'          // 人生体验
  | 'foundation';         // 基础建设

export type AssetClass =
  | 'tangible-shelter'    // 有形-住房
  | 'tangible-vehicle'    // 有形-交通工具
  | 'intangible-experiential' // 无形-体验
  | 'venture-autonomy'    // 创业-自主
  | 'venture-investment'  // 创业-投资
  | 'equities'            // 股票
  | 'real-estate';        // 房地产

export type MilestoneStatus =
  | 'compounding'         // 复合增长中
  | 'completed'           // 已完成
  | 'planned';            // 计划中

// 财富记录类型
export interface WealthRecord {
  id: string;
  date: Date;
  totalAssets: number;
  changeAmount: number;
  changeReason: string;
  breakdown: AssetBreakdown;
}

export interface AssetBreakdown {
  liquidCapital: number;
  equities: number;
  realEstate: number;
  other: number;
}

// 人生目标类型
export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate?: Date;
  progress: number;
  estimatedCost: number;
  milestones: string[]; // 关联的 milestone IDs
  status: GoalStatus;
  priority?: GoalPriority; // 目标优先级
  dependsOn?: string[]; // 依赖的其他目标 ID
  createdAt?: Date; // 创建时间
  updatedAt?: Date; // 更新时间
}

export type GoalPriority = 'low' | 'medium' | 'high';

export type GoalCategory =
  | 'financial'           // 财务目标
  | 'experiential'        // 体验目标
  | 'personal-growth'     // 个人成长
  | 'relationship'        // 关系目标
  | 'legacy';             // 传承目标

export type GoalStatus =
  | 'dreaming'            // 梦想中
  | 'planning'            // 规划中
  | 'in-progress'         // 进行中
  | 'achieved';           // 已实现

// 导航类型
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

// 用户配置类型
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  timezone: string;
  weeklyReminder: boolean;
  privacyMode: boolean;
  dataExportFormat: 'json' | 'csv' | 'pdf';
}

// 数据导出格式
export interface ExportData {
  version: string;
  exportedAt: Date;
  milestones: Milestone[];
  wealthRecords: WealthRecord[];
  lifeGoals: LifeGoal[];
  userPreferences: UserPreferences;
}

// 备份元数据
export interface BackupMetadata {
  version: string;
  createdAt: Date;
  dataSize: number;
  checksum: string;
}

// ==========================================
// 项目作品集类型
// ==========================================

export type ProjectStatus =
  | 'active'          // 活跃维护
  | 'in-progress'     // 开发中
  | 'archived'        // 已归档
  | 'planning';       // 规划中

export type ProjectCategory =
  | 'web-app'         // Web 应用
  | 'mobile-app'      // 移动应用
  | 'cli-tool'        // 命令行工具
  | 'library'         // 开源库
  | 'api-service'     // API 服务
  | 'automation'      // 自动化
  | 'design'          // 设计项目
  | 'experiment';     // 实验项目

export type ProjectMilestoneType = 'release' | 'feature' | 'achievement' | 'learning';

export interface ProjectMilestone {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: ProjectMilestoneType;
  link?: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  status: ProjectStatus;
  category: ProjectCategory;
  coverImage?: string;
  techStack: string[];
  links: ProjectLink[];
  startDate: Date;
  lastUpdated: Date;
  progress?: number;
  milestones: ProjectMilestone[];
  learnings?: string[];
  emotionalYield?: string[];
  estimatedHoursInvested?: number;
  monthlyCost?: number;
  featured?: boolean;
}
