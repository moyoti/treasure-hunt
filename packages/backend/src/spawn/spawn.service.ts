import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SpawnedItem } from './entities/spawned-item.entity';
import { ItemService } from '../item/item.service';
import { PoiService } from '../poi/poi.service';
import { CollectItemDto } from './dto/collect-item.dto';

// Collection radius in meters
const COLLECTION_RADIUS_METERS = 50;

@Injectable()
export class SpawnService {
  private readonly logger = new Logger(SpawnService.name);

  constructor(
    @InjectRepository(SpawnedItem)
    private spawnedItemRepository: Repository<SpawnedItem>,
    private itemService: ItemService,
    private poiService: PoiService,
    private dataSource: DataSource,
  ) {}

  // Spawn items every hour at random POIs
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledSpawn() {
    this.logger.log('Starting scheduled item spawn...');
    await this.spawnItemsAtPois();
  }

  async spawnItemsAtPois(count: number = 50): Promise<SpawnedItem[]> {
    const pois = await this.poiService.getRandomActivePois(count);
    const spawnedItems: SpawnedItem[] = [];

    for (const poi of pois) {
      const item = await this.itemService.getRandomItemByWeight();
      
      // Add small random offset from POI (within 30 meters)
      const offset = this.getRandomOffset(30);
      
      const spawnedItem = this.spawnedItemRepository.create({
        latitude: poi.latitude + offset.lat,
        longitude: poi.longitude + offset.lng,
        item,
        itemId: item.id,
        isActive: true,
        expiresAt: this.getExpirationDate(),
        poiLatitude: poi.latitude,
        poiLongitude: poi.longitude,
        poiName: poi.name,
      });

      spawnedItems.push(await this.spawnedItemRepository.save(spawnedItem));
    }

    this.logger.log(`Spawned ${spawnedItems.length} items`);
    return spawnedItems;
  }

  async getNearbySpawnedItems(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<SpawnedItem[]> {
    // Use raw SQL with PostGIS for efficient spatial query
    const query = `
      SELECT si.*, i.name as "itemName", i.rarity as "itemRarity", i."iconUrl" as "itemIconUrl"
      FROM spawned_items si
      JOIN items i ON si."itemId" = i.id
      WHERE si."isActive" = true
        AND si."expiresAt" > NOW()
        AND ST_DWithin(
          ST_MakePoint(si.longitude, si.latitude)::geography,
          ST_MakePoint($2, $1)::geography,
          $3 * 1000
        )
      ORDER BY si."createdAt" DESC
      LIMIT 100
    `;

    const results = await this.dataSource.query(query, [latitude, longitude, radiusKm]);
    return results;
  }

  async collectItem(
    userId: string,
    collectDto: CollectItemDto,
  ): Promise<{ success: boolean; item: any; distance: number }> {
    const { spawnedItemId, latitude, longitude } = collectDto;

    const spawnedItem = await this.spawnedItemRepository.findOne({
      where: { id: spawnedItemId, isActive: true },
      relations: ['item'],
    });

    if (!spawnedItem) {
      throw new Error('Item not found or already collected');
    }

    if (new Date() > spawnedItem.expiresAt) {
      throw new Error('Item has expired');
    }

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      latitude,
      longitude,
      spawnedItem.latitude,
      spawnedItem.longitude,
    );

    if (distance > COLLECTION_RADIUS_METERS) {
      return {
        success: false,
        item: spawnedItem.item,
        distance,
      };
    }

    // Mark as collected
    spawnedItem.isActive = false;
    await this.spawnedItemRepository.save(spawnedItem);

    return {
      success: true,
      item: spawnedItem.item,
      distance,
    };
  }

  async cleanupExpiredItems(): Promise<number> {
    const result = await this.spawnedItemRepository.delete({
      expiresAt: Between(new Date(0), new Date()),
    });
    return result.affected || 0;
  }

  private getExpirationDate(): Date {
    // Items expire after 24 hours
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }

  private getRandomOffset(maxMeters: number): { lat: number; lng: number } {
    // Convert meters to approximate degrees
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(0); // Approximate at equator

    const randomMeters = Math.random() * maxMeters;
    const angle = Math.random() * 2 * Math.PI;

    const latOffset = (randomMeters * Math.cos(angle)) / metersPerDegreeLat;
    const lngOffset = (randomMeters * Math.sin(angle)) / metersPerDegreeLng;

    return { lat: latOffset, lng: lngOffset };
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}