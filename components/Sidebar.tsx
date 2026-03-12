'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/data';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] border-r border-lumen-border-subtle p-6 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold tracking-tight flex items-center">
          Lum
          <span className="relative inline-flex ml-0.5">
            e
            <svg className="absolute -top-0.5 -right-1.5 w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
            </svg>
          </span>
          n
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 mt-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm uppercase tracking-widest py-2 transition-colors flex items-center gap-3 font-medium ${
                  isActive
                    ? 'text-lumen-text-primary'
                    : 'text-lumen-text-secondary hover:text-lumen-text-primary'
                }`}
              >
                <span className={`w-1 h-1 rounded-full transition-opacity ${
                  isActive ? 'bg-lumen-text-primary opacity-100' : 'bg-lumen-text-primary opacity-0'
                }`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Global Metrics */}
      <div className="border-t border-lumen-border-subtle pt-6">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
            总资产配置
          </div>
          <div className="text-xl font-medium mt-1">¥2,845,000</div>
        </div>
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
            主要回报
          </div>
          <div className="text-base italic text-lumen-text-secondary mt-1">
            体验与基础
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-lumen-text-tertiary font-semibold">
            档案跨度
          </div>
          <div className="text-sm font-normal mt-1">2018 — 至今</div>
        </div>
      </div>
    </aside>
  );
}
