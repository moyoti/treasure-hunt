export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'collectible' | 'consumable' | 'cosmetic';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  type: ItemType;
  spawnWeight: number;
  maxStack: number;
  iconUrl?: string;
  modelUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SpawnedItem {
  id: string;
  latitude: number;
  longitude: number;
  itemId: string;
  itemName: string;
  itemRarity: ItemRarity;
  itemIconUrl?: string;
  poiName?: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  collectedLatitude: number;
  collectedLongitude: number;
  poiName?: string;
  collectedAt: string;
  item: Item;
}