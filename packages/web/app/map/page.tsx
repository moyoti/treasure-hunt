'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/components/AuthProvider';
import { getNearbyItems, collectItem } from '@/lib/api';
import { SpawnedItem, ItemRarity } from '@/types';
import ItemModal from '@/components/ItemModal';

// Note: Set your Mapbox token in environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [items, setItems] = useState<SpawnedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SpawnedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchItems = useCallback(async (lat: number, lng: number) => {
    try {
      const nearbyItems = await getNearbyItems(lat, lng);
      setItems(nearbyItems);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('无法加载附近宝藏');
    }
  }, []);

  const initMap = useCallback((lat: number, lng: number) => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Add user location marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([lng, lat])
      .addTo(map.current);

    map.current.on('load', () => {
      setLoading(false);
    });
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;

    // Clear existing markers
    document.querySelectorAll('.mapboxgl-marker:not(.mapboxgl-ctrl)').forEach((el) => el.remove());

    // Add item markers
    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = RARITY_COLORS[item.itemRarity];
      el.innerHTML = '💎';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.boxShadow = `0 0 10px ${RARITY_COLORS[item.itemRarity]}`;

      el.addEventListener('click', () => {
        setSelectedItem(item);
      });

      new mapboxgl.Marker(el)
        .setLngLat([item.longitude, item.latitude])
        .addTo(map.current!);
    });
  }, [items]);

  useEffect(() => {
    // Get user's location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          initMap(latitude, longitude);
          fetchItems(latitude, longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Default to Beijing if location not available
          const defaultLat = 39.9087;
          const defaultLng = 116.3975;
          setLocation({ lat: defaultLat, lng: defaultLng });
          initMap(defaultLat, defaultLng);
          fetchItems(defaultLat, defaultLng);
          setError('无法获取位置，显示默认位置');
          setLoading(false);
        }
      );
    } else {
      const defaultLat = 39.9087;
      const defaultLng = 116.3975;
      setLocation({ lat: defaultLat, lng: defaultLng });
      initMap(defaultLat, defaultLng);
      fetchItems(defaultLat, defaultLng);
      setError('浏览器不支持定位');
      setLoading(false);
    }
  }, [initMap, fetchItems]);

  useEffect(() => {
    addMarkers();
  }, [addMarkers]);

  const handleCollect = async () => {
    if (!selectedItem || !location) return;

    try {
      const result = await collectItem(selectedItem.id, location.lat, location.lng);
      
      if (result.success) {
        alert(`收集成功！获得了 ${selectedItem.itemName}！`);
        setSelectedItem(null);
        fetchItems(location.lat, location.lng);
      } else {
        alert(`距离太远，还需要靠近 ${Math.round(result.distance)} 米`);
      }
    } catch (err) {
      alert('收集失败，请稍后重试');
    }
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-dark-300/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">正在加载地图...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-dark-200 border border-gray-700 rounded-lg p-4 z-20">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-dark-200/90 backdrop-blur border border-gray-700 rounded-lg p-4 z-20">
        <p className="text-sm text-gray-400">附近宝藏</p>
        <p className="text-2xl font-bold text-primary">{items.length}</p>
      </div>

      {/* Refresh button */}
      <button
        onClick={() => location && fetchItems(location.lat, location.lng)}
        className="absolute bottom-24 right-4 bg-primary text-dark-300 font-bold py-3 px-4 rounded-lg shadow-lg z-20 hover:bg-yellow-400 transition"
      >
        🔄 刷新
      </button>

      {/* Item modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCollect={handleCollect}
        />
      )}
    </div>
  );
}