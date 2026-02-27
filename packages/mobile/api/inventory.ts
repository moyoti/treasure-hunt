import api from '@/lib/api';
import { InventoryItem } from '@/types';

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await api.get<InventoryItem[]>('/inventory');
  return response.data;
}

export async function getInventoryStats(): Promise<{
  totalItems: number;
  uniqueItems: number;
  byRarity: Record<string, number>;
}> {
  const response = await api.get('/inventory/stats');
  return response.data;
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const response = await api.get<InventoryItem>(`/inventory/${id}`);
  return response.data;
}