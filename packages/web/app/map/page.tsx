'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getNearbyItems, collectItem } from '@/lib/api';
import { SpawnedItem, ItemRarity } from '@/types';
import { useRouter } from 'next/navigation';

// 高德地图 API Key (Web 端专用)
const AMAP_KEY = '68eb7700f1011a06dedbb0daabddd770';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

// 声明高德地图全局对象
declare global {
  interface Window {
    AMap: any;
  }
}

export default function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [items, setItems] = useState<SpawnedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SpawnedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 重定向未登录用户
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchItems = useCallback(async (lat: number, lng: number) => {
    try {
      const nearbyItems = await getNearbyItems(lat, lng);
      setItems(nearbyItems);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('无法加载附近宝藏，请确保已登录');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchItems(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // 使用北京天安门作为默认位置
          const defaultLat = 39.9087;
          const defaultLng = 116.3975;
          setLocation({ lat: defaultLat, lng: defaultLng });
          fetchItems(defaultLat, defaultLng);
          setError('无法获取位置，显示默认位置(北京天安门)');
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      const defaultLat = 39.9087;
      const defaultLng = 116.3975;
      setLocation({ lat: defaultLat, lng: defaultLng });
      fetchItems(defaultLat, defaultLng);
    }
  }, [user, fetchItems]);

  // 初始化高德地图
  useEffect(() => {
    if (!location || !mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      if (!window.AMap) {
        setTimeout(initMap, 100);
        return;
      }

      try {
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 15,
          center: [location.lng, location.lat],
          viewMode: '2D',
        });

        // 添加用户位置标记
        const userMarker = new window.AMap.Marker({
          position: [location.lng, location.lat],
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="34" viewBox="0 0 25 34">
                <circle cx="12.5" cy="12.5" r="10" fill="#3b82f6" stroke="white" stroke-width="3"/>
              </svg>
            `),
            imageSize: new window.AMap.Size(25, 34),
          }),
          offset: new window.AMap.Pixel(-12.5, -12.5),
        });
        userMarker.setMap(map);
        userMarker.setLabel({
          content: '📍 你的位置',
          direction: 'top',
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('地图初始化失败');
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  // 更新宝藏标记
  useEffect(() => {
    if (!mapInstanceRef.current || !window.AMap) return;

    // 清除旧标记
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 添加新标记
    items.forEach((item) => {
      const marker = new window.AMap.Marker({
        position: [item.longitude, item.latitude],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(36, 36),
          image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="${RARITY_COLORS[item.itemRarity as ItemRarity]}" stroke="white" stroke-width="3"/>
              <text x="18" y="23" text-anchor="middle" font-size="16">💎</text>
            </svg>
          `),
          imageSize: new window.AMap.Size(36, 36),
        }),
        offset: new window.AMap.Pixel(-18, -18),
      });

      marker.setMap(mapInstanceRef.current);
      marker.setLabel({
        content: `<b>${item.itemName}</b><br/>${RARITY_NAMES[item.itemRarity as ItemRarity]}`,
        direction: 'top',
      });

      marker.on('click', () => setSelectedItem(item));
      markersRef.current.push(marker);
    });
  }, [items]);

  const handleCollect = async () => {
    if (!selectedItem || !location) return;

    try {
      const result = await collectItem(selectedItem.id, location.lat, location.lng);
      if (result.success) {
        alert(`🎉 收集成功！获得了 ${selectedItem.itemName}！`);
        setSelectedItem(null);
        fetchItems(location.lat, location.lng);
      } else {
        alert(`📍 距离太远，还需要 ${Math.round(result.distance)} 米`);
      }
    } catch (err) {
      alert('❌ 收集失败，请稍后重试');
    }
  };

  // 等待认证
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cartoon-loader"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cartoon-loader mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载地图...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pb-20" style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)' }}>
      {/* 顶部信息栏 */}
      <div className="cartoon-card m-2 p-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">附近宝藏</p>
          <p className="text-2xl font-black text-yellow-500">{items.length}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">坐标</p>
          <p className="text-sm font-bold text-gray-700">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
        </div>
      </div>

      {error && (
        <div className="mx-2 cartoon-alert cartoon-alert-info text-sm">
          {error}
        </div>
      )}

      {/* 地图容器 */}
      <div className="flex-1 relative m-2">
        <div
          ref={mapRef}
          className="w-full h-full rounded-2xl border-4 border-gray-800"
          style={{ minHeight: '300px' }}
        />

        {/* 刷新按钮 */}
        <button
          onClick={() => fetchItems(location.lat, location.lng)}
          className="cartoon-btn absolute top-4 right-4 z-[1000]"
        >
          🔄 刷新
        </button>

        {/* 图例 */}
        <div className="cartoon-card absolute bottom-4 left-4 p-3 z-[1000]">
          <p className="text-xs font-bold text-gray-700 mb-2">稀有度</p>
          {Object.entries(RARITY_NAMES).map(([rarity, name]) => (
            <div key={rarity} className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-800"
                style={{ backgroundColor: RARITY_COLORS[rarity as ItemRarity] }}
              />
              <span className="text-xs font-bold text-gray-700">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 收集弹窗 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="cartoon-card max-w-md w-full p-6 animate-bounce-in">
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl border-4 border-gray-800"
                style={{ backgroundColor: RARITY_COLORS[selectedItem.itemRarity as ItemRarity] + '30' }}
              >
                💎
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">{selectedItem.itemName}</h2>
              <p className="font-bold mb-2" style={{ color: RARITY_COLORS[selectedItem.itemRarity as ItemRarity] }}>
                {RARITY_NAMES[selectedItem.itemRarity as ItemRarity]}
              </p>
              {selectedItem.poiName && (
                <p className="text-gray-500 mb-4">📍 {selectedItem.poiName}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleCollect} className="cartoon-btn flex-1">
                收集
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="cartoon-btn cartoon-btn-accent flex-1"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}