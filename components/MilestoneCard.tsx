'use client';

import { useEffect, useRef, useState } from 'react';
import { Milestone } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/data';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  onEdit: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

export function MilestoneCard({ milestone, index, onEdit, onDelete }: MilestoneCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const isEven = index % 2 === 1;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '未知日期';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '无效日期';

    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
    }).format(dateObj);
  };

  const getAssetClassLabel = (assetClass?: string) => {
    if (!assetClass) return '未分类';

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
  };

  return (
    <article
      ref={elementRef}
      className={`scroll-animate grid grid-cols-2 gap-20 p-15 relative z-1 group
        bg-lumen-surface rounded-2xl shadow-glow transition-transform duration-300 hover:scale-[1.01]
        ${isVisible ? 'is-visible' : ''}`}
    >
      {/* Edit/Delete Buttons */}
      <div className={`absolute top-6 ${isEven ? 'left-6' : 'right-6'} z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(milestone)}
          className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-white"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(milestone.id)}
          className="h-8 w-8 bg-lumen-bg-system/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-center max-w-[400px] ${isEven ? 'order-1 items-end text-right' : 'order-2'}`}>
        <h2 className="text-[42px] leading-tight mb-6 text-lumen-text-primary tracking-tight">
          {milestone.title}
        </h2>

        <p className="text-base text-lumen-text-secondary leading-relaxed mb-12 font-normal">
          "{milestone.description}"
        </p>

        <div className={`h-px bg-lumen-border-subtle w-10 mb-6 ${isEven ? 'ml-auto' : ''}`} />

        <div className="flex flex-col gap-6 w-full border-t border-lumen-border-subtle pt-6">
          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              资本配置
            </span>
            <span className="text-base font-medium">
              {formatCurrency(milestone.capitalDeployed || 0)}
            </span>
          </div>

          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              资产类别
            </span>
            <span className="text-sm font-normal">
              {getAssetClassLabel(milestone.assetClass)}
            </span>
          </div>

          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              情感回报
            </span>
            <span className="text-base font-semibold text-lumen-text-primary">
              {milestone.emotionalYield?.join('、') || '无'}
            </span>
          </div>

          {(milestone.location || milestone.status) && (
            <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
              <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
                {milestone.location ? '位置' : '状态'}
              </span>
              <span className="text-sm font-normal text-lumen-text-secondary">
                {milestone.location || (milestone.status === 'compounding' ? '复合增长中' : milestone.status)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual */}
      <div className={`relative w-full aspect-[3/4] overflow-hidden rounded-lg ${isEven ? 'order-2' : 'order-1'}`}>
        {milestone.imageUrl ? (
          <Image
            src={milestone.imageUrl}
            alt={milestone.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-lumen-bg-system flex items-center justify-center">
            <svg className="w-16 h-16 text-lumen-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <Badge className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3.5 py-2 shadow-sm z-3 text-lumen-text-primary font-semibold text-[10px] uppercase tracking-widest rounded-lg">
          {formatDate(milestone.date).toUpperCase()}
        </Badge>
      </div>
    </article>
  );
}
