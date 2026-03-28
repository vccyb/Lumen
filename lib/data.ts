import { Milestone, WealthRecord, LifeGoal, Project } from '@/types';

// 示例人生节点数据
export const sampleMilestones: Milestone[] = [
  {
    id: '1',
    date: new Date('2018-10-15'),
    title: '第一处居所',
    description: '一个由木石构成的结构，但实际上是对永久性的获得。第一次感觉到资本的重量，将我锚定在特定的经纬度上。',
    category: 'foundation',
    emotionalYield: ['稳定性', '生活的画布'],
    capitalDeployed: 125000,
    assetClass: 'tangible-shelter',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1469&auto=format&fit=crop',
    location: '45°31\'12"N 122°40\'55"W',
    status: 'compounding',
  },
  {
    id: '2',
    date: new Date('2021-09-01'),
    title: '巴塔哥尼亚间隔年',
    description: '有意识的暂停。在巴塔哥尼亚高原用资本换取时间，其回报在清晰度上每日复利。银行账本显示赤字；灵魂记录了巨大的获得。',
    category: 'experience',
    emotionalYield: ['视角', '疲惫', '敬畏'],
    capitalDeployed: 18400,
    assetClass: 'intangible-experiential',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1470&auto=format&fit=crop',
    status: 'completed',
  },
  {
    id: '3',
    date: new Date('2023-03-15'),
    title: '种子资金：工作室',
    description: '赌上薪水的舒适度。买回自己的时间。设备会贬值，但获得的自主权是增值资产。',
    category: 'strategic-asset',
    emotionalYield: ['焦虑', '目标', '主权'],
    capitalDeployed: 45000,
    assetClass: 'venture-autonomy',
    imageUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1470&auto=format&fit=crop',
    status: 'compounding',
  },
  {
    id: '4',
    date: new Date('2023-10-12'),
    title: '阿尔卑斯山居',
    description: '在喀斯喀特山脉 securing 了 A 型木屋。十年的梦想，为远离城市噪音的家庭聚会建立锚点。',
    category: 'vision-realized',
    emotionalYield: ['归属感', '家族传承', '宁静'],
    capitalDeployed: 145000,
    assetClass: 'real-estate',
    imageUrl: 'https://images.pexels.com/photos/206648/pexels-photo-206648.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Cascades, USA',
    status: 'compounding',
  },
];

// 示例财富记录数据（6个月的模拟数据）
export const sampleWealthRecords: WealthRecord[] = [
  {
    id: '1',
    date: new Date('2024-07-31'),
    totalAssets: 850000,
    changeAmount: 50000,
    changeReason: '月度储蓄 + 投资收益',
    breakdown: {
      liquidCapital: 180000,
      equities: 320000,
      realEstate: 350000,
      other: 0,
    },
  },
  {
    id: '2',
    date: new Date('2024-08-31'),
    totalAssets: 875000,
    changeAmount: 25000,
    changeReason: '工资收入 + 股票分红',
    breakdown: {
      liquidCapital: 190000,
      equities: 335000,
      realEstate: 350000,
      other: 0,
    },
  },
  {
    id: '3',
    date: new Date('2024-09-30'),
    totalAssets: 860000,
    changeAmount: -15000,
    changeReason: '旅行支出 + 家庭聚会',
    breakdown: {
      liquidCapital: 175000,
      equities: 335000,
      realEstate: 350000,
      other: 0,
    },
  },
  {
    id: '4',
    date: new Date('2024-10-31'),
    totalAssets: 895000,
    changeAmount: 35000,
    changeReason: '季度奖金 + 投资增值',
    breakdown: {
      liquidCapital: 200000,
      equities: 345000,
      realEstate: 350000,
      other: 0,
    },
  },
  {
    id: '5',
    date: new Date('2024-11-30'),
    totalAssets: 920000,
    changeAmount: 25000,
    changeReason: '工资收入 + 定投',
    breakdown: {
      liquidCapital: 210000,
      equities: 360000,
      realEstate: 350000,
      other: 0,
    },
  },
  {
    id: '6',
    date: new Date('2024-12-31'),
    totalAssets: 980000,
    changeAmount: 60000,
    changeReason: '年终奖 + 房产增值 + 投资收益',
    breakdown: {
      liquidCapital: 230000,
      equities: 380000,
      realEstate: 350000,
      other: 20000,
    },
  },
];

// 示例人生目标数据
export const sampleLifeGoals: LifeGoal[] = [
  {
    id: '1',
    title: '财务独立',
    description: '在45岁前实现被动收入覆盖生活支出，拥有选择工作的自由',
    category: 'financial',
    targetDate: new Date('2035-01-01'),
    progress: 35,
    estimatedCost: 2000000,
    milestones: ['1', '3'],
    status: 'in-progress',
  },
  {
    id: '2',
    title: '环球旅行',
    description: '用一年的时间环游世界，体验不同的文化和生活方式',
    category: 'experiential',
    targetDate: new Date('2028-01-01'),
    progress: 10,
    estimatedCost: 150000,
    milestones: ['2'],
    status: 'planning',
  },
  {
    id: '3',
    title: '建立家庭基金会',
    description: '创建一个支持教育和环境保护的家族基金会',
    category: 'legacy',
    targetDate: new Date('2040-01-01'),
    progress: 5,
    estimatedCost: 5000000,
    milestones: [],
    status: 'dreaming',
  },
];

// 导航菜单数据
export const navItems = [
  { label: '仪表盘', href: '/dashboard', icon: 'dashboard' },
  { label: '人生叙事', href: '/timeline', icon: 'timeline' },
  { label: '财富记录', href: '/wealth', icon: 'account_balance' },
  { label: '人生目标', href: '/goals', icon: 'flag' },
  { label: '项目作品', href: '/projects', icon: 'code' },
  { label: '资产清单', href: '/assets', icon: 'inventory' },
];

// 工具函数
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'life-chapter': '人生章节',
    'vision-realized': '愿景实现',
    'strategic-asset': '战略资产',
    'experience': '人生体验',
    'foundation': '基础建设',
  };
  return labels[category] || category;
}

export function getAssetClassLabel(assetClass: string): string {
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
}

// 项目作品集工具函数
export function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'active': '活跃维护',
    'in-progress': '开发中',
    'archived': '已归档',
    'planning': '规划中',
  };
  return labels[status] || status;
}

export function getProjectCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'web-app': 'Web 应用',
    'mobile-app': '移动应用',
    'cli-tool': '命令行工具',
    'library': '开源库',
    'api-service': 'API 服务',
    'automation': '自动化',
    'design': '设计项目',
    'experiment': '实验项目',
  };
  return labels[category] || category;
}

export function getMilestoneTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'release': '版本发布',
    'feature': '功能上线',
    'achievement': '成就达成',
    'learning': '学习收获',
  };
  return labels[type] || type;
}

// 示例项目数据
export const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Lumen',
    description: '个人生活与财富管理应用，记录人生节点，追踪财富变化，实现生活与微光的平衡。',
    longDescription: 'Lumen 是我最核心的个人项目。它不仅是一个应用，更是一种生活哲学的实践——把人生的每个重要决定当作一次资本配置，量化情感回报，追踪长期趋势。',
    status: 'active',
    category: 'web-app',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop',
    techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    links: [
      { label: 'GitHub', url: 'https://github.com/vccyb/Lumen' },
    ],
    startDate: new Date('2025-01-15'),
    lastUpdated: new Date('2026-03-20'),
    progress: 65,
    milestones: [
      { id: 'pm-1', date: new Date('2025-01-15'), title: '项目启动', description: '确定产品方向与技术栈', type: 'learning' },
      { id: 'pm-2', date: new Date('2025-03-01'), title: 'MVP 完成', description: '核心功能开发完成', type: 'feature' },
      { id: 'pm-3', date: new Date('2025-06-15'), title: 'v1.0 发布', description: '人生叙事 + 财富记录上线', type: 'release' },
      { id: 'pm-4', date: new Date('2026-01-10'), title: '目标追踪上线', description: '人生目标模块完成', type: 'feature' },
    ],
    learnings: ['Next.js App Router 深度实践', '个人产品的设计思维', '数据可视化的艺术'],
    emotionalYield: ['成就感', '创造', '自我认知'],
    estimatedHoursInvested: 320,
    monthlyCost: 0,
    featured: true,
  },
  {
    id: 'proj-2',
    name: 'CloudSync CLI',
    description: '多云环境文件同步命令行工具，支持 AWS S3、阿里云 OSS、腾讯云 COS。',
    longDescription: '在多个云服务之间同步文件时遇到了痛点，于是开发了这款 CLI 工具。支持增量同步、并发传输、断点续传。',
    status: 'active',
    category: 'cli-tool',
    coverImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=1470&auto=format&fit=crop',
    techStack: ['Go', 'AWS SDK', 'Cobra'],
    links: [
      { label: 'GitHub', url: 'https://github.com/vccyb/cloudsync' },
      { label: 'Documentation', url: 'https://cloudsync.dev/docs' },
    ],
    startDate: new Date('2024-06-01'),
    lastUpdated: new Date('2026-02-15'),
    progress: 90,
    milestones: [
      { id: 'pm-5', date: new Date('2024-08-20'), title: 'v0.1 内测', description: '基础 S3 同步功能', type: 'release' },
      { id: 'pm-6', date: new Date('2025-01-10'), title: 'v1.0 发布', description: '多云支持 + 增量同步', type: 'release' },
      { id: 'pm-7', date: new Date('2025-09-01'), title: '100 Stars', description: 'GitHub 获得第一个 100 stars', type: 'achievement' },
    ],
    learnings: ['Go 并发编程', 'CLI 用户体验设计', '开源社区运营'],
    emotionalYield: ['技术深度', '社区认同'],
    estimatedHoursInvested: 180,
    monthlyCost: 0,
    featured: true,
  },
  {
    id: 'proj-3',
    name: 'MarkdownNote',
    description: '基于本地文件的轻量 Markdown 笔记应用，支持双向链接和知识图谱可视化。',
    status: 'archived',
    category: 'web-app',
    techStack: ['React', 'Electron', 'SQLite', 'D3.js'],
    links: [
      { label: 'GitHub', url: 'https://github.com/vccyb/markdownnote' },
    ],
    startDate: new Date('2023-03-01'),
    lastUpdated: new Date('2024-12-01'),
    milestones: [
      { id: 'pm-8', date: new Date('2023-06-01'), title: 'v0.1 Alpha', type: 'release' },
      { id: 'pm-9', date: new Date('2024-01-15'), title: '知识图谱上线', type: 'feature' },
      { id: 'pm-10', date: new Date('2024-12-01'), title: '项目归档', description: '转向 Obsidian，停止维护', type: 'learning' },
    ],
    learnings: ['Electron 桌面开发', '图数据库基础', 'D3.js 可视化'],
    emotionalYield: ['探索', '满足感'],
    estimatedHoursInvested: 250,
    monthlyCost: 0,
  },
  {
    id: 'proj-4',
    name: 'PaySplit',
    description: '朋友间的 AA 记账小程序，支持微信支付凭证自动识别和智能分账。',
    status: 'in-progress',
    category: 'mobile-app',
    techStack: ['Flutter', 'Dart', 'Firebase', 'OCR'],
    links: [
      { label: 'GitHub', url: 'https://github.com/vccyb/paysplit' },
    ],
    startDate: new Date('2026-01-10'),
    lastUpdated: new Date('2026-03-25'),
    progress: 30,
    milestones: [
      { id: 'pm-11', date: new Date('2026-01-10'), title: '项目立项', description: '旅行中发现的痛点', type: 'learning' },
      { id: 'pm-12', date: new Date('2026-02-20'), title: 'UI 原型完成', type: 'feature' },
    ],
    learnings: ['Flutter 跨平台开发', 'OCR 集成'],
    emotionalYield: ['好奇心', '解决问题'],
    estimatedHoursInvested: 60,
    monthlyCost: 50,
  },
  {
    id: 'proj-5',
    name: 'React Animate Kit',
    description: '轻量级 React 动画组件库，提供 20+ 开箱即用的动画效果。',
    status: 'archived',
    category: 'library',
    techStack: ['React', 'TypeScript', 'Storybook'],
    links: [
      { label: 'GitHub', url: 'https://github.com/vccyb/react-animate-kit' },
      { label: 'npm', url: 'https://www.npmjs.com/package/react-animate-kit' },
    ],
    startDate: new Date('2023-09-01'),
    lastUpdated: new Date('2025-03-01'),
    milestones: [
      { id: 'pm-13', date: new Date('2024-01-15'), title: 'npm 发布', type: 'release' },
      { id: 'pm-14', date: new Date('2024-08-01'), title: '500+ 周下载量', type: 'achievement' },
      { id: 'pm-15', date: new Date('2025-03-01'), title: '停止维护', description: 'Framer Motion 已足够成熟', type: 'learning' },
    ],
    learnings: ['npm 包发布流程', '动画原理', '开源文档编写'],
    emotionalYield: ['分享', '成长'],
    estimatedHoursInvested: 120,
    monthlyCost: 0,
  },
];
