'use client';

import { useAuth } from '@/components/AuthProvider';
import { logout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-dark-300 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile header */}
        <div className="bg-dark-200 border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-dark-300">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{user?.username || '探险家'}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        {/* Menu */}
        <div className="mt-6 space-y-2">
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition">
            <span className="text-white">🏆 成就</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition">
            <span className="text-white">📊 统计</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition">
            <span className="text-white">⚙️ 设置</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition">
            <span className="text-white">❓ 帮助</span>
          </button>
          <button className="w-full bg-dark-200 border border-gray-700 rounded-lg p-4 text-left hover:bg-dark-100 transition">
            <span className="text-white">📜 关于</span>
          </button>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full mt-6 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? '退出中...' : '退出登录'}
        </button>

        <p className="text-center text-gray-600 text-sm mt-8">版本 1.0.0</p>
      </div>
    </div>
  );
}