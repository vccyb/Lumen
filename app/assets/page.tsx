'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { formatCurrency, getWealthRecordWithTotal } from '@/lib/data';
import { WealthRecord } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { wealthRecordAPI } from '@/lib/api/wealth';
import { useAuth } from '@/contexts/AuthContext';

const toNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentWealth, setCurrentWealth] = useState<WealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLatestWealth = async () => {
      try {
        setLoading(true);
        setError(null);

        const latestRecord = await wealthRecordAPI.getLatest();
        if (!latestRecord) {
          setCurrentWealth(null);
          return;
        }

        const breakdown = (latestRecord.breakdown ?? {}) as Record<string, unknown>;
        const mappedRecord: WealthRecord = {
          id: latestRecord.id,
          date: new Date(latestRecord.date),
          changeAmount: toNumber(latestRecord.change_amount),
          changeReason: latestRecord.change_reason,
          breakdown: {
            liquid: toNumber(breakdown.liquid),
            equities: toNumber(breakdown.equities),
            realEstate: toNumber(breakdown.realEstate ?? breakdown.real_estate),
            other: toNumber(breakdown.other),
          },
          createdAt: new Date(latestRecord.created_at),
          updatedAt: new Date(latestRecord.updated_at),
        };

        setCurrentWealth(mappedRecord);
      } catch (err) {
        console.error('Failed to load latest wealth record:', err);
        setError('加载资产清单失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;

    if (!user) {
      setCurrentWealth(null);
      setLoading(false);
      return;
    }

    loadLatestWealth();
  }, [user, authLoading]);

  const getCategoryColor = (category: string) => {
    const colors = {
      liquid: 'bg-lumen-blue',
      equities: 'bg-lumen-text-primary',
      'real-estate': 'bg-lumen-warm-end',
      other: 'bg-lumen-accent-gold',
    };
    return colors[category as keyof typeof colors] || 'bg-lumen-gray-inactive';
  };

  const currentWealthWithTotal = currentWealth ? getWealthRecordWithTotal(currentWealth) : null;
  const latestUpdatedLabel = currentWealth
    ? new Date(currentWealth.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  const assets = currentWealth
    ? [
        { name: '流动资金', value: currentWealth.breakdown.liquid, category: 'liquid', icon: '💵', description: '现金、银行存款、货币基金' },
        { name: '股票与指数基金', value: currentWealth.breakdown.equities, category: 'equities', icon: '📈', description: 'ETF、个股、指数基金' },
        { name: '房地产', value: currentWealth.breakdown.realEstate, category: 'real-estate', icon: '🏠', description: '自住房产、投资房产' },
        { name: '其他资产', value: currentWealth.breakdown.other, category: 'other', icon: '💎', description: '数字资产、收藏品、私人投资等' },
      ]
    : [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <section className="p-24 max-w-[1100px] mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold">
              资产清单
            </div>
            <Badge variant="secondary" className="text-xs">基于最新财富记录自动生成</Badge>
          </div>

          <h1 className="text-[64px] leading-tight mb-6 text-lumen-text-primary max-w-[800px] tracking-tight">
            你的<span className="text-lumen-text-secondary font-normal italic">财富</span>，
            <br />
            一目了然
          </h1>
          <p className="text-base text-lumen-text-secondary max-w-[480px] leading-relaxed">
            资产清单与最近一条财富记录实时同步，无需单独编辑。
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

        {!loading && !error && !currentWealthWithTotal && (
          <section className="px-24 pb-40 max-w-[1100px] mx-auto">
            <Card className="p-8 text-center text-lumen-text-secondary">
              还没有财富记录。请先在「财富记录」页面新增一条记录。
            </Card>
          </section>
        )}

        {!loading && !error && currentWealthWithTotal && (
          <>
            <section className="px-24 pb-12 max-w-[1100px] mx-auto">
              <Card className="p-8 shadow-glow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                      总资产价值
                    </div>
                    <div className="text-5xl font-bold tracking-tight text-lumen-text-primary">
                      {formatCurrency(currentWealthWithTotal.totalAssets)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold mb-2">
                      最新更新
                    </div>
                    <div className="text-sm text-lumen-text-secondary">
                      {latestUpdatedLabel}
                    </div>
                  </div>
                </div>

                <div className="h-2 bg-lumen-bg-system rounded-full overflow-hidden flex">
                  {assets.map((asset) => {
                    const percentage = currentWealthWithTotal.totalAssets > 0
                      ? (asset.value / currentWealthWithTotal.totalAssets) * 100
                      : 0;
                    return (
                      <div
                        key={asset.name}
                        className={`h-full ${getCategoryColor(asset.category)}`}
                        style={{ width: `${percentage}%` }}
                        title={`${asset.name}: ${percentage.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {assets.map((asset) => {
                    const percentage = currentWealthWithTotal.totalAssets > 0
                      ? (asset.value / currentWealthWithTotal.totalAssets) * 100
                      : 0;
                    return (
                      <div key={asset.name} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(asset.category)}`} />
                        <span className="text-sm text-lumen-text-secondary">
                          {asset.name} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>

            <section className="px-24 pb-40 max-w-[1100px] mx-auto">
              <div className="grid grid-cols-2 gap-6">
                {assets.map((asset) => {
                  const percentage = currentWealthWithTotal.totalAssets > 0
                    ? ((asset.value / currentWealthWithTotal.totalAssets) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <Card key={asset.name} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{asset.icon}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-lumen-text-primary">{asset.name}</h3>
                            <Badge variant="secondary" className="text-xs mt-0.5">
                              {asset.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-lumen-text-primary">
                            {formatCurrency(asset.value)}
                          </div>
                          <div className="text-xs text-lumen-text-secondary mt-0.5">
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-lumen-text-secondary mb-4">
                        {asset.description}
                      </p>

                      <div className="h-1.5 bg-lumen-bg-system rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCategoryColor(asset.category)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
