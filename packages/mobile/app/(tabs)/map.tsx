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
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { getNearbyItems, collectItem } from '@/api/items';
import { ItemRarity } from '@/types';

const { width, height } = Dimensions.get('window');

// Default region (San Francisco)
const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

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

const RARITY_EMOJI: Record<ItemRarity, string> = {
  common: '💎',
  rare: '💠',
  epic: '💜',
  legendary: '👑',
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [items, setItems] = useState<SpawnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SpawnedItem | null>(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要位置权限才能显示附近宝藏');
      setLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(loc);
    setMapRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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

  const handleMarkerPress = (item: SpawnedItem) => {
    setSelectedItem(item);
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
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
        onRegionChangeComplete={setMapRegion}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            title={item.itemName}
            description={`${item.itemRarity} - ${item.poiName || '宝藏'}`}
            onPress={() => handleMarkerPress(item)}
          >
            <View
              style={[
                styles.markerContainer,
                { borderColor: RARITY_COLORS[item.itemRarity] },
              ]}
            >
              <Text style={styles.markerEmoji}>
                {RARITY_EMOJI[item.itemRarity]}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Selected item modal */}
      {selectedItem && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem.itemName}</Text>
            <Text
              style={[
                styles.modalRarity,
                { color: RARITY_COLORS[selectedItem.itemRarity] },
              ]}
            >
              稀有度: {selectedItem.itemRarity}
            </Text>
            {selectedItem.poiName && (
              <Text style={styles.modalLocation}>位置: {selectedItem.poiName}</Text>
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
        <Text style={styles.itemsCountText}>附近有 {items.length} 个宝藏</Text>
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchNearbyItems}>
        <Text style={styles.refreshButtonText}>刷新</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: width,
    height: height,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: width - 64,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 8,
  },
  modalRarity: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '700',
  },
  modalLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    borderRadius: 25,
    padding: 16,
    paddingHorizontal: 32,
    borderWidth: 3,
    borderColor: '#333',
  },
  collectButton: {
    backgroundColor: '#FFD93D',
  },
  collectButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  itemsCount: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    borderWidth: 3,
    borderColor: '#333',
  },
  itemsCountText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#FFD93D',
    borderRadius: 25,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: '#333',
  },
  refreshButtonText: {
    color: '#333',
    fontWeight: '900',
  },
});