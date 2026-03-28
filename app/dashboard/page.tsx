'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { sampleMilestones, sampleWealthRecords, sampleLifeGoals, formatCurrency } from '@/lib/data';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [milestones] = useState(sampleMilestones);
  const [records] = useState(sampleWealthRecords);
  const [goals] = useState(sampleLifeGoals);

  const currentTotal = records.length > 0 ? records[records.length - 1].totalAssets : 0;
  const yearStartTotal = records.length > 0 ? records[0].totalAssets : 0;
  const yearlyChange = currentTotal - yearStartTotal;
  const yearlyChangePercent = yearStartTotal > 0 ? ((yearlyChange / yearStartTotal) * 100).toFixed(1) : '0.0';

  const currentYearMilestones = milestones.filter(m =>
    m.date.getFullYear() === new Date().getFullYear()
  ).length;

  const achievedGoals = goals.filter(g => g.status === 'achieved').length;
  const inProgressGoals = goals.filter(g => g.status === 'in-progress').length;

  // 提取所有情感收益关键词
  const emotionalYields = milestones.flatMap(m => m.emotionalYield);
  const emotionalKeywords = emotionalYields.reduce((acc, emotion) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEmotions = Object.entries(emotionalKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const [dashboardRef, isDashboardVisible] = useScrollAnimation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
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
        </section>

        {/* Dashboard Content */}
        <section className="px-24 pb-40 max-w-[1100px] mx-auto">
          <div ref={dashboardRef} className={`scroll-animate ${isDashboardVisible ? 'is-visible' : ''}`}>
            {/* Top Cards Row */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Total Assets */}
              <Card className="p-6">
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

              {/* Year Milestones */}
              <Card className="p-6">
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

              {/* Goals Progress */}
              <Card className="p-6">
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

              {/* Emotional Yield */}
              <Card className="p-6">
                <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-3">
                  主要情感收益
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {topEmotions.map(([emotion, count]) => (
                    <Badge key={emotion} variant="secondary" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left: Wealth Capital */}
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
                      {records.length > 0 && (
                        <div className="space-y-2">
                          {Object.entries(records[records.length - 1].breakdown).map(([key, value]) => {
                            const labels: Record<string, string> = {
                              liquidCapital: '流动资金',
                              equities: '股票与指数',
                              realEstate: '房地产',
                              other: '其他资产',
                            };
                            const percentage = ((value / currentTotal) * 100).toFixed(1);
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

              {/* Right: Life Capital */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">人生资本</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-lumen-bg-system rounded-xl">
                      <div className="text-sm text-lumen-text-secondary mb-3">2026 季度回顾</div>
                      <p className="text-base text-lumen-text-primary leading-relaxed">
                        你主要把资本投入在<span className="font-semibold">家庭</span>和<span className="font-semibold">学习</span>上，
                        主要的情感收益是<span className="font-semibold">安心</span>、<span className="font-semibold">成长</span>。
                      </p>
                    </div>

                    <div className="p-4 bg-lumen-bg-system rounded-xl">
                      <div className="text-sm text-lumen-text-secondary mb-3">热门标签</div>
                      <div className="flex flex-wrap gap-2">
                        {['稳定', '成长', '探索', '自由', '家庭'].map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-lumen-accent-gold/10 text-lumen-accent-gold hover:bg-lumen-accent-gold/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-lumen-bg-system rounded-xl">
                      <div className="text-sm text-lumen-text-secondary mb-2">下一步建议</div>
                      <ul className="space-y-1.5 text-sm text-lumen-text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-lumen-accent-gold mt-0.5">→</span>
                          <span>继续增加股票配置，提升长期收益潜力</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-lumen-accent-gold mt-0.5">→</span>
                          <span>考虑下一个体验式人生节点</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
