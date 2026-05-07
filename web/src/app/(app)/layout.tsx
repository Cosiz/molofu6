'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { SessionUser } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/helper', label: 'My Tasks', icon: '📋' },
  { href: '/timeline', label: 'Timeline', icon: '📰' },
  { href: '/kids', label: 'Kids', icon: '👧' },
  { href: '/helpers', label: 'Helpers', icon: '👥' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('molofu_user');
    if (!stored) { router.push('/auth'); return; }
    setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    commander: 'bg-indigo-600',
    helper: 'bg-green-600',
    observer: 'bg-slate-500',
  };

  const roleLabels: Record<string, string> = {
    commander: 'Commander',
    helper: 'Helper',
    observer: 'Observer',
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">Molofu6</h1>
          <p className="text-xs text-slate-400">Family Command Centre</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <Separator className="bg-slate-800" />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={roleColors[user.role]}>
                {user.display_name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.display_name ?? 'User'}
              </p>
              <Badge
                variant="secondary"
                className={`text-xs ${roleColors[user.role]} text-white border-0`}
              >
                {roleLabels[user.role]}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full text-slate-300 border-slate-700 hover:bg-slate-800"
            onClick={() => {
              sessionStorage.clear();
              router.push('/auth');
            }}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
