import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POI } from './entities/poi.entity';

@Injectable()
export class PoiService implements OnModuleInit {
  private readonly logger = new Logger(PoiService.name);

  constructor(
    @InjectRepository(POI)
    private poiRepository: Repository<POI>,
  ) {}

  async onModuleInit() {
    const count = await this.poiRepository.count();
    if (count === 0) {
      await this.seedInitialPois();
    }
  }

  private async seedInitialPois() {
    this.logger.log('Seeding initial POIs...');

    // 北京地区的测试POI
    const pois = [
      { name: '天安门广场', latitude: 39.9087, longitude: 116.3975, category: 'landmark' },
      { name: '故宫博物院', latitude: 39.9163, longitude: 116.3972, category: 'museum' },
      { name: '景山公园', latitude: 39.9250, longitude: 116.3968, category: 'park' },
      { name: '北海公园', latitude: 39.9250, longitude: 116.3838, category: 'park' },
      { name: '什刹海', latitude: 39.9410, longitude: 116.3870, category: 'landmark' },
      { name: '南锣鼓巷', latitude: 39.9370, longitude: 116.4020, category: 'shopping' },
      { name: '鼓楼', latitude: 39.9430, longitude: 116.3930, category: 'landmark' },
      { name: '雍和宫', latitude: 39.9470, longitude: 116.4170, category: 'temple' },
      { name: '地坛公园', latitude: 39.9500, longitude: 116.4140, category: 'park' },
      { name: '日坛公园', latitude: 39.9200, longitude: 116.4480, category: 'park' },
      { name: '天坛公园', latitude: 39.8820, longitude: 116.4060, category: 'park' },
      { name: '前门大街', latitude: 39.8980, longitude: 116.3980, category: 'shopping' },
      { name: '王府井大街', latitude: 39.9130, longitude: 116.4100, category: 'shopping' },
      { name: '西单商业街', latitude: 39.9100, longitude: 116.3730, category: 'shopping' },
      { name: '三里屯', latitude: 39.9320, longitude: 116.4540, category: 'entertainment' },
      { name: '国贸商圈', latitude: 39.9080, longitude: 116.4590, category: 'business' },
      { name: '朝阳公园', latitude: 39.9440, longitude: 116.4720, category: 'park' },
      { name: '奥林匹克公园', latitude: 40.0020, longitude: 116.3940, category: 'landmark' },
      { name: '鸟巢', latitude: 39.9920, longitude: 116.3960, category: 'landmark' },
      { name: '水立方', latitude: 39.9930, longitude: 116.3870, category: 'landmark' },
    ];

    for (const poiData of pois) {
      const poi = this.poiRepository.create({
        ...poiData,
        description: `${poiData.name}附近的宝藏点`,
        isActive: true,
      });
      await this.poiRepository.save(poi);
    }

    this.logger.log(`Seeded ${pois.length} POIs`);
  }

  async findAll(): Promise<POI[]> {
    return this.poiRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getNearbyPois(latitude: number, longitude: number, radiusKm: number = 10): Promise<POI[]> {
    const latRange = radiusKm / 111.32;
    const lngRange = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180));

    return this.poiRepository
      .createQueryBuilder('poi')
      .where('poi.isActive = :isActive', { isActive: true })
      .andWhere('poi.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - latRange,
        maxLat: latitude + latRange,
      })
      .andWhere('poi.longitude BETWEEN :minLng AND :maxLng', {
        minLng: longitude - lngRange,
        maxLng: longitude + lngRange,
      })
      .getMany();
  }

  async getRandomActivePois(count: number = 50): Promise<POI[]> {
    return this.poiRepository
      .createQueryBuilder('poi')
      .where('poi.isActive = :isActive', { isActive: true })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  async createPoi(data: Partial<POI>): Promise<POI> {
    const poi = this.poiRepository.create(data);
    return this.poiRepository.save(poi);
  }
}