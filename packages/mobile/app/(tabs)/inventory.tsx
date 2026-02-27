import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getInventory, getInventoryStats } from '@/api/inventory';
import { InventoryItem, ItemRarity } from '@/types';

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

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [inventoryData, statsData] = await Promise.all([
        getInventory(),
        getInventoryStats(),
      ]);
      setItems(inventoryData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View style={styles.itemIconContainer}>
        <Text style={styles.itemIcon}>💎</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.item.name}</Text>
        <Text
          style={[
            styles.itemRarity,
            { color: RARITY_COLORS[item.item.rarity as ItemRarity] },
          ]}
        >
          {RARITY_NAMES[item.item.rarity as ItemRarity]}
        </Text>
        {item.poiName && (
          <Text style={styles.itemLocation}>📍 {item.poiName}</Text>
        )}
      </View>
      <View style={styles.itemQuantity}>
        <Text style={styles.quantityText}>x{item.quantity}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Stats section */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>总物品</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.uniqueItems}</Text>
            <Text style={styles.statLabel}>种类</Text>
          </View>
          {Object.entries(stats.byRarity).map(([rarity, count]) => (
            <View key={rarity} style={styles.statItem}>
              <Text style={[styles.statValue, { color: RARITY_COLORS[rarity as ItemRarity] }]}>
                {count as number}
              </Text>
              <Text style={styles.statLabel}>{RARITY_NAMES[rarity as ItemRarity]}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Items list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffd700"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>还没有收集任何物品</Text>
            <Text style={styles.emptySubtext}>去地图上寻找宝藏吧！</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemRarity: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemQuantity: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityText: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});