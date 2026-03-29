import { z } from 'zod';

// ==========================================
// Milestone 验证 Schema
// ==========================================

export const milestoneSchema = z.object({
  date: z.string().datetime(),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  description: z.string().min(1, '描述不能为空'),
  category: z.enum(['foundation', 'experience', 'strategic-asset', 'vision-realized', 'life-chapter']),
  emotionalYield: z.array(z.string()).default([]),
  assetClass: z.enum([
    'tangible-shelter',
    'tangible-vehicle',
    'intangible-experiential',
    'venture-autonomy',
    'venture-investment',
    'equities',
    'real-estate',
  ]),
  status: z.enum(['compounding', 'completed', 'planned']).default('planned'),
  capitalDeployed: z.number().min(0, '资本配置不能为负数').default(0),
  impactRadius: z.number().min(1).max(10).optional(),
  recurrence: z.boolean().default(false),
  imageUrl: z.string().url('图片URL格式不正确').optional().or(z.literal('')),
  location: z.string().max(500, '位置描述不能超过500个字符').optional(),
  linkedPeople: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  connections: z.array(z.string()).optional(),
  mediaAttachments: z.array(z.object({
    type: z.enum(['image', 'video', 'audio']),
    url: z.string().url(),
    caption: z.string().optional(),
  })).optional(),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ==========================================
// WealthRecord 验证 Schema
// ==========================================

export const wealthRecordSchema = z.object({
  date: z.string().datetime(),
  changeAmount: z.number('变动金额必须是数字'),
  changeReason: z.string().min(1, '变动原因不能为空'),
  breakdown: z.object({
    liquid: z.number().min(0, '流动资金不能为负数'),
    equities: z.number().min(0, '股票资产不能为负数'),
    realEstate: z.number().min(0, '房地产资产不能为负数'),
    other: z.number().min(0, '其他资产不能为负数'),
  }).refine(
    (data) => {
      const total = data.liquid + data.equities + data.realEstate + data.other;
      return total >= 0;
    },
    { message: '总资产不能为负数' }
  ),
});

export type WealthRecordInput = z.infer<typeof wealthRecordSchema>;

// ==========================================
// LifeGoal 验证 Schema
// ==========================================

export const lifeGoalSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  description: z.string().min(1, '描述不能为空'),
  category: z.enum(['financial', 'experiential', 'personal-growth', 'relationship', 'legacy']),
  targetDate: z.string().datetime().optional().or(z.literal('')),
  progress: z.number().min(0, '进度不能小于0').max(100, '进度不能大于100').default(0),
  estimatedCost: z.number().min(0, '预估成本不能为负数').default(0),
  milestones: z.array(z.string()).default([]),
  status: z.enum(['dreaming', 'planning', 'in-progress', 'achieved']).default('dreaming'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dependsOn: z.array(z.string()).optional(),
});

export type LifeGoalInput = z.infer<typeof lifeGoalSchema>;

// ==========================================
// Project 验证 Schema
// ==========================================

export const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(200, '项目名称不能超过200个字符'),
  description: z.string().min(1, '描述不能为空'),
  longDescription: z.string().optional(),
  status: z.enum(['active', 'in-progress', 'completed', 'archived', 'planning']),
  category: z.enum(['web', 'mobile', 'desktop', 'ai-ml', 'infrastructure', 'other']),
  coverImage: z.string().url('封面图片URL格式不正确').optional().or(z.literal('')),
  techStack: z.array(z.string()).default([]),
  progress: z.number().min(0, '进度不能小于0').max(100, '进度不能大于100').optional(),
  estimatedHoursInvested: z.number().min(0, '预估投入时间不能为负数').optional(),
  monthlyCost: z.number().min(0, '月度成本不能为负数').optional(),
  featured: z.boolean().default(false),
  startDate: z.string().datetime(),
  lastUpdated: z.string().datetime(),
  milestones: z.array(z.object({
    id: z.string(),
    date: z.string().datetime(),
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['release', 'feature', 'achievement', 'learning']),
    link: z.string().url().optional().or(z.literal('')),
  })).default([]),
  learnings: z.array(z.string()).optional(),
  emotionalYield: z.array(z.string()).optional(),
  links: z.array(z.object({
    label: z.string().min(1),
    url: z.string().url('链接URL格式不正确'),
  })).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ==========================================
// 辅助函数
// ==========================================

/**
 * 验证 Milestone 数据
 */
export function validateMilestone(data: unknown): {
  success: boolean;
  data?: MilestoneInput;
  errors?: z.ZodError;
} {
  const result = milestoneSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * 验证 WealthRecord 数据
 */
export function validateWealthRecord(data: unknown): {
  success: boolean;
  data?: WealthRecordInput;
  errors?: z.ZodError;
} {
  const result = wealthRecordSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * 验证 LifeGoal 数据
 */
export function validateLifeGoal(data: unknown): {
  success: boolean;
  data?: LifeGoalInput;
  errors?: z.ZodError;
} {
  const result = lifeGoalSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * 验证 Project 数据
 */
export function validateProject(data: unknown): {
  success: boolean;
  data?: ProjectInput;
  errors?: z.ZodError;
} {
  const result = projectSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
