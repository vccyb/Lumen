import { Milestone, WealthRecord, LifeGoal } from '@/types';

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
