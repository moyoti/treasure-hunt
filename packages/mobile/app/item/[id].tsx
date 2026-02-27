import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

// Mock data - In production, fetch from API
const mockItem: InventoryItem = {
  id: '1',
  userId: 'user1',
  itemId: 'item1',
  quantity: 2,
  collectedLatitude: 39.9087,
  collectedLongitude: 116.3975,
  poiName: '天安门广场',
  collectedAt: new Date().toISOString(),
  item: {
    id: 'item1',
    name: '水晶碎片',
    description: '闪闪发光的水晶碎片，蕴含着神秘能量。',
    rarity: 'rare',
    type: 'collectible',
    spawnWeight: 4,
    maxStack: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // In production, fetch item data using id
  const item = mockItem;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💎</Text>
        </View>
        <Text style={styles.name}>{item.item.name}</Text>
        <Text style={[styles.rarity, { color: RARITY_COLORS[item.item.rarity as ItemRarity] }]}>
          {RARITY_NAMES[item.item.rarity as ItemRarity]}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>描述</Text>
        <Text style={styles.description}>{item.item.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>收集信息</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>收集地点</Text>
          <Text style={styles.infoValue}>{item.poiName || '未知'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>收集时间</Text>
          <Text style={styles.infoValue}>
            {new Date(item.collectedAt).toLocaleDateString('zh-CN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>数量</Text>
          <Text style={styles.infoValue}>x{item.quantity}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>返回</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a2e',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  rarity: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  backButton: {
    margin: 16,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});