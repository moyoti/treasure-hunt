import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { getNearbyItems, collectItem } from '@/api/items';
import { ItemRarity } from '@/types';

const { width, height } = Dimensions.get('window');

// Note: You need to set your Mapbox access token
// Mapbox.setAccessToken('your-mapbox-token');

interface SpawnedItem {
  id: string;
  latitude: number;
  longitude: number;
  itemName: string;
  itemRarity: ItemRarity;
  itemIconUrl?: string;
  poiName?: string;
}

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [items, setItems] = useState<SpawnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SpawnedItem | null>(null);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要位置权限才能显示附近宝藏');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(loc);
  };

  const fetchNearbyItems = async () => {
    if (!location) return;

    try {
      const nearbyItems = await getNearbyItems(
        location.coords.latitude,
        location.coords.longitude
      );
      setItems(nearbyItems);
    } catch (error) {
      console.error('Failed to fetch nearby items:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      requestLocation();
    }, [])
  );

  useEffect(() => {
    if (location) {
      fetchNearbyItems();
    }
  }, [location]);

  const handleCollect = async (item: SpawnedItem) => {
    if (!location) return;

    try {
      const result = await collectItem(
        item.id,
        location.coords.latitude,
        location.coords.longitude
      );

      if (result.success) {
        Alert.alert(
          '收集成功！',
          `你获得了 ${item.itemName}！\n稀有度: ${item.itemRarity}`,
          [{ text: '太棒了', onPress: () => setSelectedItem(null) }]
        );
        // Refresh items
        fetchNearbyItems();
      } else {
        Alert.alert(
          '距离太远',
          `需要靠近 ${Math.round(result.distance)} 米才能收集`,
          [{ text: '知道了', onPress: () => setSelectedItem(null) }]
        );
      }
    } catch (error: any) {
      Alert.alert('收集失败', error.message || '请稍后重试');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingText}>正在获取你的位置...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map placeholder - In production, use Mapbox */}
      <View style={styles.mapPlaceholder}>
        {location ? (
          <Text style={styles.coordinates}>
            位置: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.coordinates}>无法获取位置</Text>
        )}
        
        {/* Item markers */}
        <View style={styles.markersContainer}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemMarker,
                { borderColor: RARITY_COLORS[item.itemRarity] },
              ]}
              onPress={() => setSelectedItem(item)}
            >
              <Text style={styles.itemMarkerText}>💎</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected item modal */}
      {selectedItem && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem.itemName}</Text>
            <Text style={styles.modalRarity}>
              稀有度: {selectedItem.itemRarity}
            </Text>
            {selectedItem.poiName && (
              <Text style={styles.modalLocation}>
                位置: {selectedItem.poiName}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.collectButton]}
                onPress={() => handleCollect(selectedItem)}
              >
                <Text style={styles.collectButtonText}>收集</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.cancelButtonText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Nearby items count */}
      <View style={styles.itemsCount}>
        <Text style={styles.itemsCountText}>
          附近有 {items.length} 个宝藏
        </Text>
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchNearbyItems}>
        <Text style={styles.refreshButtonText}>🔄 刷新</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coordinates: {
    color: '#888',
    fontSize: 14,
  },
  markersContainer: {
    position: 'absolute',
    top: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  itemMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderWidth: 2,
  },
  itemMarkerText: {
    fontSize: 24,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: width - 64,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modalRarity: {
    fontSize: 16,
    color: '#ffd700',
    marginBottom: 8,
  },
  modalLocation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 32,
  },
  collectButton: {
    backgroundColor: '#ffd700',
  },
  collectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  itemsCount: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 12,
    padding: 12,
  },
  itemsCountText: {
    color: '#fff',
    fontSize: 14,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#ffd700',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
  },
  refreshButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
});