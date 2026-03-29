import { ExportData, BackupMetadata } from '@/types';

/**
 * 导出所有数据为JSON格式
 */
export function exportToJSON(
  milestones: any[],
  wealthRecords: any[],
  lifeGoals: any[],
  projects: any[],
  userPreferences: any
): string {
  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date(),
    milestones,
    wealthRecords,
    lifeGoals,
    projects,
    userPreferences,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 导出数据为CSV格式（仅财富记录）
 */
export function exportWealthToCSV(wealthRecords: any[]): string {
  if (wealthRecords.length === 0) return '';

  const headers = ['日期', '总资产', '变化额', '变化原因', '流动资金', '股票', '房地产', '其他'];
  const rows = wealthRecords.map(record => {
    const totalAssets = record.breakdown.liquid + record.breakdown.equities + record.breakdown.realEstate + record.breakdown.other;
    return [
      new Date(record.date).toLocaleDateString('zh-CN'),
      totalAssets.toString(),
      record.changeAmount.toString(),
      record.changeReason,
      record.breakdown.liquid.toString(),
      record.breakdown.equities.toString(),
      record.breakdown.realEstate.toString(),
      record.breakdown.other.toString(),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * 触发文件下载
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 生成备份文件名
 */
export function generateBackupFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return `lumen-backup-${dateStr}.json`;
}

/**
 * 创建备份元数据
 */
export function createBackupMetadata(dataSize: number): BackupMetadata {
  const crypto = window.crypto || (window as any).msCrypto;
  const content = JSON.stringify(Date.now());
  let checksum = '';

  if (crypto && crypto.subtle) {
    // 简单的校验和生成（实际应该使用更复杂的哈希）
    checksum = btoa(content).substring(0, 16);
  } else {
    checksum = btoa(content).substring(0, 16);
  }

  return {
    version: '1.0.0',
    createdAt: new Date(),
    dataSize,
    checksum,
  };
}

/**
 * 验证备份文件
 */
export function validateBackup(data: ExportData): boolean {
  if (!data.version || !data.exportedAt) {
    return false;
  }

  // 检查必需的数据字段
  if (!Array.isArray(data.milestones) ||
      !Array.isArray(data.wealthRecords) ||
      !Array.isArray(data.lifeGoals)) {
    return false;
  }

  return true;
}

/**
 * 导入备份数据
 */
export function importBackup(jsonContent: string): ExportData | null {
  try {
    const data = JSON.parse(jsonContent) as ExportData;

    if (!validateBackup(data)) {
      throw new Error('Invalid backup format');
    }

    return data;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return null;
  }
}

/**
 * 获取数据大小统计
 */
export function getDataSizeStats(data: ExportData): {
  total: number;
  milestones: number;
  wealthRecords: number;
  lifeGoals: number;
  projects: number;
  userPreferences: number;
} {
  const getSize = (obj: any) => JSON.stringify(obj).length;

  return {
    total: getSize(data),
    milestones: getSize(data.milestones),
    wealthRecords: getSize(data.wealthRecords),
    lifeGoals: getSize(data.lifeGoals),
    projects: getSize(data.projects),
    userPreferences: getSize(data.userPreferences),
  };
}