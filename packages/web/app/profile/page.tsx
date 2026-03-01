'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { logout } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果认证加载完成且用户未登录，重定向到登录页
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;

    setLoading(true);
    try {
      await logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 等待认证状态加载
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 未登录不渲染内容
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-300 pb-20">
      {/* Header */}
      <div className="bg-dark-200 border-b border-gray-700 px-4 py-4">
        <h1 className="text-xl font-bold text-white">个人中心</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="bg-dark-200 border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl md:text-4xl font-bold text-dark-300">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{user?.username || '探险家'}</h1>
          <p className="text-gray-400 text-sm md:text-base">{user?.email}</p>
        </div>

        {/* Menu */}
        <div className="mt-6 space-y-2">
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition flex items-center justify-between">
            <span className="text-white">🏆 成就</span>
            <span className="text-gray-500 text-sm">即将推出</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition flex items-center justify-between">
            <span className="text-white">📊 统计</span>
            <span className="text-gray-500 text-sm">即将推出</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition flex items-center justify-between">
            <span className="text-white">⚙️ 设置</span>
            <span className="text-gray-500 text-sm">即将推出</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition flex items-center justify-between">
            <span className="text-white">❓ 帮助</span>
            <span className="text-gray-500 text-sm">即将推出</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition flex items-center justify-between">
            <span className="text-white">📜 关于</span>
            <span className="text-gray-500 text-sm">v1.0.0</span>
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full mt-6 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '退出中...' : '退出登录'}
        </button>
      </div>
    </div>
  );
}