'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getInventory, getInventoryStats } from '@/lib/api';
import { InventoryItem, ItemRarity } from '@/types';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [inventoryData, statsData] = await Promise.all([
        getInventory(),
        getInventoryStats(),
      ]);
      setItems(inventoryData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 如果认证加载完成且用户未登录，重定向到登录页
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // 等待认证状态加载
  if (authLoading || loading) {
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
        <h1 className="text-xl font-bold text-white">我的收藏</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-dark-200 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-center gap-6 md:gap-12 overflow-x-auto">
              <div className="text-center flex-shrink-0">
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalItems}</p>
                <p className="text-xs md:text-sm text-gray-400">总物品</p>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.uniqueItems}</p>
                <p className="text-xs md:text-sm text-gray-400">种类</p>
              </div>
              {Object.entries(stats.byRarity).map(([rarity, count]) => (
                <div key={rarity} className="text-center flex-shrink-0">
                  <p className={`text-2xl md:text-3xl font-bold ${RARITY_COLORS[rarity as ItemRarity]}`}>
                    {count as number}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">{RARITY_NAMES[rarity as ItemRarity]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
            {error}
            <button
              onClick={fetchData}
              className="ml-2 underline hover:text-red-300"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Items grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl text-gray-400">还没有收集任何物品</p>
            <p className="text-gray-500 mt-2">去地图上寻找宝藏吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-dark-200 border border-gray-700 rounded-lg p-4 hover:border-primary/50 transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-dark-100 rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                    💎
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.item.name}</h3>
                    <p className={`text-sm ${RARITY_COLORS[item.item.rarity as ItemRarity]}`}>
                      {RARITY_NAMES[item.item.rarity as ItemRarity]}
                    </p>
                    {item.poiName && (
                      <p className="text-xs text-gray-500 mt-1 truncate">📍 {item.poiName}</p>
                    )}
                  </div>
                  <div className="bg-dark-100 px-2 md:px-3 py-1 rounded-lg flex-shrink-0">
                    <span className="text-primary font-bold text-sm md:text-base">x{item.quantity}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-3 line-clamp-2">{item.item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}