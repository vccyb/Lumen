'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { navItems } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

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

      {/* User Section */}
      <div className="border-t border-lumen-border-subtle pt-6">
        {user ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lumen-accent-gold/20 flex items-center justify-center">
                <User className="w-5 h-5 text-lumen-accent-gold" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-lumen-text-primary truncate">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-lumen-text-tertiary truncate max-w-[160px]">
                  {user.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="h-9 w-9 shrink-0 text-lumen-text-secondary hover:text-lumen-text-primary"
              aria-label="登出"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Not logged in */}
            <div className="space-y-3">
              <p className="text-xs text-lumen-text-tertiary mb-3">
                登录以保存您的数据
              </p>
              <Button
                variant="warm"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                登录 / 注册
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
