/**
 * 月份维度管理的日期工具函数
 */

/**
 * 将月份字符串(YYYY-MM)转换为每月1号
 * 输入: "2026-04"
 * 输出: "2026-04-01"
 */
export function monthToFirstDay(monthString: string): string {
  const [year, month] = monthString.split('-');
  return `${year}-${month}-01`;
}

/**
 * 将Date对象转换为月份键(YYYY-MM)
 * 用于比较两个日期是否在同一个月
 */
export function dateToMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 判断两个日期是否在同一个月
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return dateToMonthKey(date1) === dateToMonthKey(date2);
}

/**
 * 获取下个月的第一天
 */
export function getNextMonthFirstDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
