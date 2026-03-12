import Image from 'next/image';
import { Milestone } from '@/types';
import { formatDate, formatCurrency, getAssetClassLabel } from '@/lib/data';

interface ChapterCardProps {
  milestone: Milestone;
  index: number;
  isEven: boolean;
}

export default function ChapterCard({ milestone, index, isEven }: ChapterCardProps) {
  return (
    <article className={`grid grid-cols-2 gap-20 p-15 max-w-[1100px] mx-auto relative z-1
      bg-lumen-surface rounded-2xl shadow-glow transition-transform duration-300 hover:scale-[1.01]
      ${isEven ? 'order-2' : 'order-1'}`}
    >
      {/* Content */}
      <div className={`flex flex-col justify-center max-w-[400px] ${isEven ? 'order-1 items-end text-right' : 'order-2'}`}>
        {/* Chapter Number */}
        <div className="text-base font-semibold text-lumen-text-tertiary mb-3">
          {String(index + 1).padStart(2, '0')}.
        </div>

        {/* Title */}
        <h2 className="text-[42px] leading-tight mb-6 text-lumen-text-primary tracking-tight">
          {milestone.title}
        </h2>

        {/* Reflection */}
        <p className="text-base text-lumen-text-secondary leading-relaxed mb-12 font-normal">
          "{milestone.description}"
        </p>

        {/* Divider */}
        <div className={`h-px bg-lumen-border-subtle w-10 mb-6 ${isEven ? 'ml-auto' : ''}`} />

        {/* Meta Grid */}
        <div className="flex flex-col gap-6 w-full border-t border-lumen-border-subtle pt-6">
          {/* Capital Allocated */}
          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              资本配置
            </span>
            <span className="text-base font-medium">
              {formatCurrency(milestone.capitalDeployed)}
              {milestone.assetClass === 'tangible-shelter' && (
                <span className="text-xs text-lumen-text-tertiary ml-1">首付</span>
              )}
            </span>
          </div>

          {/* Asset Class */}
          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              资产类别
            </span>
            <span className="text-sm font-normal">
              {getAssetClassLabel(milestone.assetClass).toUpperCase()}
            </span>
          </div>

          {/* Emotional Yield */}
          <div className={`flex justify-between items-baseline gap-6 ${isEven ? 'flex-row-reverse' : ''}`}>
            <span className="text-[10px] uppercase tracking-widest text-lumen-text-tertiary font-semibold flex-shrink-0">
              情感回报
            </span>
            <span className="text-base font-semibold text-lumen-text-primary">
              {milestone.emotionalYield.join('、')}
            </span>
          </div>

          {/* Location or Status */}
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
        {milestone.imageUrl && (
          <Image
            src={milestone.imageUrl}
            alt={milestone.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
        {/* Date Badge */}
        <div className="absolute top-6 right-6 bg-white/90 px-3.5 py-2 rounded-lg shadow-sm z-10 text-lumen-text-primary font-semibold text-[10px] uppercase tracking-widest">
          {formatDate(milestone.date).toUpperCase()}
        </div>
      </div>
    </article>
  );
}
