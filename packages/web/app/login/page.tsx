'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await login(email, password);
      setUser(user);
      router.push('/map');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-300 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">寻宝记</h1>
          <p className="text-gray-400">探索世界，收集宝藏</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-dark-300 font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-4 text-gray-500 text-sm">或</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full py-3 bg-dark-200 border border-gray-700 rounded-lg hover:bg-dark-100 transition flex items-center justify-center gap-2">
            <span>🔍</span>
            <span>使用 Google 登录</span>
          </button>
          <button className="w-full py-3 bg-dark-200 border border-gray-700 rounded-lg hover:bg-dark-100 transition flex items-center justify-center gap-2">
            <span>🍎</span>
            <span>使用 Apple 登录</span>
          </button>
        </div>

        <p className="mt-8 text-center text-gray-400">
          还没有账号？{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}