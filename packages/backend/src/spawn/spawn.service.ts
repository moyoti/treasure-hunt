import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SpawnedItem } from './entities/spawned-item.entity';
import { ItemService } from '../item/item.service';
import { PoiService } from '../poi/poi.service';
import { InventoryService } from '../inventory/inventory.service';
import { CollectItemDto } from './dto/collect-item.dto';

const COLLECTION_RADIUS_METERS = 50;

@Injectable()
export class SpawnService implements OnModuleInit {
  private readonly logger = new Logger(SpawnService.name);

  constructor(
    @InjectRepository(SpawnedItem)
    private spawnedItemRepository: Repository<SpawnedItem>,
    private itemService: ItemService,
    private poiService: PoiService,
    private inventoryService: InventoryService,
  ) {}

  async onModuleInit() {
    // 启动时自动生成宝藏
    const count = await this.spawnedItemRepository.count();
    if (count === 0) {
      this.logger.log('No spawned items found, generating initial items...');
      await this.spawnItemsAtPois(30);
    }
  }

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
      const offset = this.getRandomOffset(30);
      
      const spawnedItem = this.spawnedItemRepository.create({
        latitude: Number(poi.latitude) + offset.lat,
        longitude: Number(poi.longitude) + offset.lng,
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

  async getNearbySpawnedItems(latitude: number, longitude: number, radiusKm: number = 5): Promise<SpawnedItem[]> {
    const latRange = radiusKm / 111.32;
    const lngRange = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180));

    const items = await this.spawnedItemRepository
      .createQueryBuilder('si')
      .leftJoinAndSelect('si.item', 'item')
      .where('si.isActive = :isActive', { isActive: true })
      .andWhere('si.expiresAt > :now', { now: new Date() })
      .andWhere('si.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - latRange,
        maxLat: latitude + latRange,
      })
      .andWhere('si.longitude BETWEEN :minLng AND :maxLng', {
        minLng: longitude - lngRange,
        maxLng: longitude + lngRange,
      })
      .orderBy('si.createdAt', 'DESC')
      .limit(100)
      .getMany();

    return items;
  }

  async collectItem(userId: string, collectDto: CollectItemDto): Promise<{ success: boolean; item: any; distance: number }> {
    const { spawnedItemId, latitude, longitude } = collectDto;

    const spawnedItem = await this.spawnedItemRepository.findOne({
      where: { id: spawnedItemId, isActive: true },
      relations: ['item'],
    });

    if (!spawnedItem) {
      throw new NotFoundException('Item not found or already collected');
    }

    if (new Date() > spawnedItem.expiresAt) {
      throw new Error('Item has expired');
    }

    const distance = this.calculateDistance(latitude, longitude, Number(spawnedItem.latitude), Number(spawnedItem.longitude));

    if (distance > COLLECTION_RADIUS_METERS) {
      return { success: false, item: spawnedItem.item, distance };
    }

    // Mark item as collected
    spawnedItem.isActive = false;
    await this.spawnedItemRepository.save(spawnedItem);

    // Add item to user's inventory
    await this.inventoryService.addItemToInventory(
      userId,
      spawnedItem.item,
      Number(spawnedItem.latitude),
      Number(spawnedItem.longitude),
      spawnedItem.poiName,
    );

    return { success: true, item: spawnedItem.item, distance };
  }

  async cleanupExpiredItems(): Promise<number> {
    const result = await this.spawnedItemRepository.delete({
      expiresAt: Between(new Date(0), new Date()),
    });
    return result.affected || 0;
  }

  async spawnItemsNearLocation(
    latitude: number,
    longitude: number,
    count: number = 10,
  ): Promise<SpawnedItem[]> {
    const spawnedItems: SpawnedItem[] = [];

    for (let i = 0; i < count; i++) {
      const item = await this.itemService.getRandomItemByWeight();
      const offset = this.getRandomOffset(500); // 500米范围内

      const spawnedItem = this.spawnedItemRepository.create({
        latitude: latitude + offset.lat,
        longitude: longitude + offset.lng,
        item,
        itemId: item.id,
        isActive: true,
        expiresAt: this.getExpirationDate(),
        poiLatitude: latitude,
        poiLongitude: longitude,
        poiName: '测试宝藏点',
      });

      spawnedItems.push(await this.spawnedItemRepository.save(spawnedItem));
    }

    this.logger.log(`Spawned ${spawnedItems.length} items near (${latitude}, ${longitude})`);
    return spawnedItems;
  }

  private getExpirationDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }

  private getRandomOffset(maxMeters: number): { lat: number; lng: number } {
    const metersPerDegree = 111320;
    const randomMeters = Math.random() * maxMeters;
    const angle = Math.random() * 2 * Math.PI;
    return {
      lat: (randomMeters * Math.cos(angle)) / metersPerDegree,
      lng: (randomMeters * Math.sin(angle)) / metersPerDegree,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}