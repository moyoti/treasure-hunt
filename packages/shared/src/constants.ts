import { ItemRarity } from './types';

// Collection radius in meters
export const COLLECTION_RADIUS_METERS = 50;

// Item spawn interval in hours
export const SPAWN_INTERVAL_HOURS = 1;

// Item expiration in hours
export const ITEM_EXPIRATION_HOURS = 24;

// Default map zoom level
export const DEFAULT_MAP_ZOOM = 15;

// Rarity colors
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

// Rarity names in Chinese
export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

// Rarity weights (higher = more common)
export const RARITY_WEIGHTS: Record<ItemRarity, number> = {
  common: 1,
  rare: 0.5,
  epic: 0.2,
  legendary: 0.05,
};