'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const { user } = useAuth();

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Stats */}
      {stats && (
        <div className="bg-dark-200 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.totalItems}</p>
                <p className="text-sm text-gray-400">总物品</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.uniqueItems}</p>
                <p className="text-sm text-gray-400">种类</p>
              </div>
              {Object.entries(stats.byRarity).map(([rarity, count]) => (
                <div key={rarity} className="text-center">
                  <p className={`text-3xl font-bold ${RARITY_COLORS[rarity as ItemRarity]}`}>
                    {count as number}
                  </p>
                  <p className="text-sm text-gray-400">{RARITY_NAMES[rarity as ItemRarity]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Items grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  <div className="w-16 h-16 bg-dark-100 rounded-lg flex items-center justify-center text-3xl">
                    💎
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.item.name}</h3>
                    <p className={`text-sm ${RARITY_COLORS[item.item.rarity as ItemRarity]}`}>
                      {RARITY_NAMES[item.item.rarity as ItemRarity]}
                    </p>
                    {item.poiName && (
                      <p className="text-xs text-gray-500 mt-1">📍 {item.poiName}</p>
                    )}
                  </div>
                  <div className="bg-dark-100 px-3 py-1 rounded-lg">
                    <span className="text-primary font-bold">x{item.quantity}</span>
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