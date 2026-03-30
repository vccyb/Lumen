'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { formatCurrency, getWealthRecordWithTotal } from '@/lib/data';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { milestoneAPI } from '@/lib/api/milestones';
import { wealthRecordAPI } from '@/lib/api/wealth';
import { lifeGoalAPI } from '@/lib/api/goals';
import { projectAPI } from '@/lib/api/projects';
import { Milestone, WealthRecord, LifeGoal } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [records, setRecords] = useState<WealthRecord[]>([]);
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [milestoneRows, wealthRows, goalRows, projectRows] = await Promise.all([
          milestoneAPI.getAll(),
          wealthRecordAPI.getAll(),
          lifeGoalAPI.getAll(),
          projectAPI.getAll(),
        ]);

        const mappedMilestones = milestoneRows.map((milestone) => ({
          id: milestone.id,
          date: new Date(milestone.date),
          title: milestone.title,
          description: milestone.description,
          category: milestone.category,
          emotionalYield: [], // TODO: Add emotional_yield field to milestones table
          capitalDeployed: toNumber(milestone.capital_deployed),
          assetClass: milestone.asset_class,
          imageUrl: milestone.image_url ?? undefined,
          location: milestone.location ?? undefined,
          status: milestone.status ?? undefined,
          createdAt: new Date(milestone.created_at),
          updatedAt: new Date(milestone.updated_at),
        } as Milestone));

        const mappedRecords = wealthRows
          .map((record) => {
            const breakdown = (record.breakdown ?? {}) as Record<string, unknown>;
            return {
              id: record.id,
              date: new Date(record.date),
              changeAmount: toNumber(record.change_amount),
              changeReason: record.change_reason,
              breakdown: {
                liquid: toNumber(breakdown.liquid),
                equities: toNumber(breakdown.equities),
                realEstate: toNumber(breakdown.realEstate ?? breakdown.real_estate),
                other: toNumber(breakdown.other),
              },
              createdAt: new Date(record.created_at),
              updatedAt: new Date(record.updated_at),
            } as WealthRecord;
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        const mappedGoals = goalRows.map((goal) => ({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          targetDate: goal.target_date ? new Date(goal.target_date) : undefined,
          progress: toNumber(goal.progress),
          estimatedCost: toNumber(goal.estimated_cost),
          milestones: [], // TODO: Load from goal_milestones junction table
          status: goal.status,
          priority: goal.priority ?? undefined,
          createdAt: new Date(goal.created_at),
          updatedAt: new Date(goal.updated_at),
        } as LifeGoal));

        setMilestones(mappedMilestones);
        setRecords(mappedRecords);
        setGoals(mappedGoals);
        setProjects(projectRows.map((project) => ({ id: project.id, status: project.status })));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('加载仪表盘数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;

    if (!user) {
      setMilestones([]);
      setRecords([]);
      setGoals([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [user, authLoading]);

  const currentRecord = records.length > 0 ? getWealthRecordWithTotal(records[records.length - 1]) : null;
  const yearStartRecord = records.length > 0 ? getWealthRecordWithTotal(records[0]) : null;
  const currentTotal = currentRecord?.totalAssets ?? 0;
  const yearStartTotal = yearStartRecord?.totalAssets ?? 0;
  const yearlyChange = currentTotal - yearStartTotal;
  const yearlyChangePercent = yearStartTotal > 0 ? ((yearlyChange / yearStartTotal) * 100).toFixed(1) : '0.0';

  const currentYearMilestones = milestones.filter(
    (milestone) => milestone.date.getFullYear() === new Date().getFullYear()
  ).length;

  const achievedGoals = goals.filter((goal) => goal.status === 'achieved').length;
  const inProgressGoals = goals.filter((goal) => goal.status === 'in-progress').length;
  const activeProjectCount = projects.filter(
    (project) => project.status === 'active' || project.status === 'in-progress'
  ).length;

  const topEmotions = useMemo(() => {
    const emotionalKeywords = milestones
      .flatMap((milestone) => milestone.emotionalYield)
      .reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(emotionalKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([emotion]) => emotion);
  }, [milestones]);

  const latestRecordBreakdown = records.length > 0 ? records[records.length - 1].breakdown : null;

  const [dashboardRef, isDashboardVisible] = useScrollAnimation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <section className="p-24 max-w-[1100px] mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
              生命资本仪表盘
            </div>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">人生与财富</span>，
            <br />
            一目了然
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            统一视角审视你的人生叙事、财富积累和目标追求。每一项资本配置都在为你的人生故事增添光彩。
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
            </div>
          )}
        </section>

        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div ref={dashboardRef} className={`scroll-animate ${isDashboardVisible ? 'is-visible' : ''}`}>
            {!loading && (
              <>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <Card
                    className="p-6 cursor-pointer hover:shadow-elevated transition-all"
                    onClick={() => router.push('/assets')}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                      总资产
                    </div>
                    <div className="text-3xl font-bold text-lumen-text-primary mb-2">
                      {formatCurrency(currentTotal)}
                    </div>
                    <div className={`text-sm font-medium ${yearlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {yearlyChange >= 0 ? '+' : ''}{formatCurrency(yearlyChange)}
                      <span className="text-lumen-text-secondary ml-1">今年</span>
                    </div>
                  </Card>

                  <Card
                    className="p-6 cursor-pointer hover:shadow-elevated transition-all"
                    onClick={() => router.push('/timeline')}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                      今年节点
                    </div>
                    <div className="text-3xl font-bold text-lumen-text-primary mb-2">
                      {currentYearMilestones}
                    </div>
                    <div className="text-sm text-lumen-text-secondary">
                      个人故事的重要时刻
                    </div>
                  </Card>

                  <Card
                    className="p-6 cursor-pointer hover:shadow-elevated transition-all"
                    onClick={() => router.push('/goals')}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                      目标进度
                    </div>
                    <div className="text-3xl font-bold text-lumen-text-primary mb-2">
                      {achievedGoals}/{goals.length}
                    </div>
                    <div className="text-sm text-lumen-text-secondary">
                      {inProgressGoals} 个进行中
                    </div>
                  </Card>

                  <Card
                    className="p-6 cursor-pointer hover:shadow-elevated transition-all"
                    onClick={() => router.push('/projects')}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                      项目统计
                    </div>
                    <div className="text-3xl font-bold text-lumen-text-primary mb-2">
                      {projects.length}
                    </div>
                    <div className="text-sm text-lumen-text-secondary">
                      {activeProjectCount} 个活跃中
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">财富资本</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-lumen-bg-system rounded-xl">
                          <span className="text-sm text-lumen-text-secondary">年度变化</span>
                          <span className={`text-lg font-bold ${yearlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {yearlyChange >= 0 ? '+' : ''}{formatCurrency(yearlyChange)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-lumen-bg-system rounded-xl">
                          <span className="text-sm text-lumen-text-secondary">年度增长率</span>
                          <span className={`text-lg font-bold ${yearlyChangePercent !== '0.0' ? 'text-green-500' : 'text-lumen-text-primary'}`}>
                            {yearlyChangePercent}%
                          </span>
                        </div>

                        <div className="p-4 bg-lumen-bg-system rounded-xl">
                          <div className="text-sm text-lumen-text-secondary mb-3">资产配置概览</div>
                          {latestRecordBreakdown && (
                            <div className="space-y-2">
                              {Object.entries(latestRecordBreakdown).map(([key, value]) => {
                                const labels: Record<string, string> = {
                                  liquid: '流动资金',
                                  equities: '股票与指数',
                                  realEstate: '房地产',
                                  other: '其他资产',
                                };
                                const percentage = currentTotal > 0 ? ((value / currentTotal) * 100).toFixed(1) : '0.0';
                                return (
                                  <div key={key} className="flex justify-between items-center">
                                    <span className="text-sm text-lumen-text-secondary">{labels[key]}</span>
                                    <span className="text-sm font-medium text-lumen-text-primary">
                                      {percentage}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">人生情感总结</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-lumen-bg-system rounded-xl">
                          <div className="text-sm text-lumen-text-secondary mb-3">季度情感画像</div>
                          <p className="text-base text-lumen-text-primary leading-relaxed">
                            近期你的人生叙事更偏向<span className="font-semibold">稳定建设</span>与
                            <span className="font-semibold">长期积累</span>，情绪关键词主要是
                            <span className="font-semibold">成长</span>和<span className="font-semibold">安心</span>。
                          </p>
                        </div>

                        <div className="p-4 bg-lumen-bg-system rounded-xl">
                          <div className="text-sm text-lumen-text-secondary mb-3">高频情感关键词</div>
                          <div className="flex flex-wrap gap-2">
                            {topEmotions.length > 0 ? (
                              topEmotions.map((emotion) => (
                                <Badge key={emotion} variant="secondary" className="bg-lumen-accent-gold/10 text-lumen-accent-gold hover:bg-lumen-accent-gold/20">
                                  {emotion}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-lumen-text-secondary">暂无情感数据</span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-lumen-bg-system rounded-xl">
                          <div className="text-sm text-lumen-text-secondary mb-2">下一步建议</div>
                          <ul className="space-y-1.5 text-sm text-lumen-text-secondary">
                            <li className="flex items-start gap-2">
                              <span className="text-lumen-accent-gold mt-0.5">→</span>
                              <span>把一个“进行中”的人生节点推进到“已完成”</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-lumen-accent-gold mt-0.5">→</span>
                              <span>记录一次高质量复盘，沉淀情感和决策经验</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
