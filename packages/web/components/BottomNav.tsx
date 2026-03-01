'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // 认证加载中或未登录时不显示导航
  if (loading || !user) {
    return null;
  }

  // 在登录和注册页面不显示导航
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    { href: '/map', label: '地图', icon: '🗺️' },
    { href: '/inventory', label: '收藏', icon: '📦' },
    { href: '/achievements', label: '成就', icon: '🏅' },
    { href: '/leaderboard', label: '排行', icon: '🏆' },
    { href: '/profile', label: '我的', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-800 z-50 safe-area-pb shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition touch-manipulation ${
                isActive ? 'text-yellow-500 font-bold' : 'text-gray-500 hover:text-yellow-400'
              }`}
            >
              <span className="text-xl md:text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
