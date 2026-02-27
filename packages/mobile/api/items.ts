import api from '@/lib/api';
import { SpawnedItem } from '@/types';

export async function getNearbyItems(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<SpawnedItem[]> {
  const response = await api.get<SpawnedItem[]>('/spawned-items/nearby', {
    params: { lat: latitude, lng: longitude, radius: radiusKm },
  });
  return response.data;
}

export async function collectItem(
  spawnedItemId: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; item: any; distance: number }> {
  const response = await api.post('/spawned-items/collect', {
    spawnedItemId,
    latitude,
    longitude,
  });
  return response.data;
}