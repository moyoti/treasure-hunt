'use client';

import { SpawnedItem, ItemRarity } from '@/types';

const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

interface ItemModalProps {
  item: SpawnedItem;
  onClose: () => void;
  onCollect: () => void;
}

export default function ItemModal({ item, onClose, onCollect }: ItemModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">💎</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{item.itemName}</h2>
          <p className={`font-semibold ${RARITY_COLORS[item.itemRarity]}`}>
            {RARITY_NAMES[item.itemRarity]}
          </p>
          {item.poiName && (
            <p className="text-gray-400 mt-2">📍 {item.poiName}</p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCollect}
            className="flex-1 bg-primary text-dark-300 font-bold py-3 rounded-lg hover:bg-yellow-400 transition"
          >
            收集
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-dark-100 text-white font-semibold py-3 rounded-lg hover:bg-dark-300 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}