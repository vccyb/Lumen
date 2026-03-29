'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // OAuth callback will be handled by Supabase Auth state change
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lumen-bg-system">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-lumen-accent-gold mx-auto mb-4" />
        <p className="text-lumen-text-secondary">正在完成登录...</p>
      </div>
    </div>
  );
}
