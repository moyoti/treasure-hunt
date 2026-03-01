'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, setUser } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/map');
    }
    if (searchParams.get('registered') === 'true') {
      setSuccess('注册成功！请登录');
    }
  }, [user, authLoading, router, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cartoon-loader"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-bounce-in">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🗺️💎</div>
          <h1 className="cartoon-title text-4xl md:text-5xl mb-2">寻宝记</h1>
          <p className="text-lg text-gray-600 font-semibold">探索世界，收集宝藏</p>
        </div>

        {/* 登录卡片 */}
        <div className="cartoon-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="cartoon-alert cartoon-alert-error animate-shake">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="cartoon-alert cartoon-alert-success">
                ✅ {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                📧 邮箱
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cartoon-input w-full"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                🔐 密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cartoon-input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cartoon-btn w-full text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> 登录中...
                </span>
              ) : (
                '🚀 开始探险'
              )}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t-2 border-gray-200"></div>
            <span className="px-4 text-gray-400 font-bold text-sm">或</span>
            <div className="flex-1 border-t-2 border-gray-200"></div>
          </div>

          {/* 社交登录 */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="cartoon-btn cartoon-btn-secondary w-full flex items-center justify-center gap-2"
              disabled
            >
              <span>🌐</span>
              <span>Google 登录</span>
              <span className="text-xs opacity-60">(即将开放)</span>
            </button>
            <button
              type="button"
              className="cartoon-btn w-full flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(180deg, #333 0%, #111 100%)', color: 'white' }}
              disabled
            >
              <span>🍎</span>
              <span>Apple 登录</span>
              <span className="text-xs opacity-60">(即将开放)</span>
            </button>
          </div>
        </div>

        {/* 注册链接 */}
        <p className="mt-6 text-center text-gray-600 font-semibold">
          还没有账号？{' '}
          <Link href="/register" className="text-yellow-600 hover:text-yellow-700 font-bold underline decoration-2 underline-offset-2">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}