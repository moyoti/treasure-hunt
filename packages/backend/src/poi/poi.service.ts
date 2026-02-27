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
    // Seed some initial POIs if none exist
    const count = await this.poiRepository.count();
    if (count === 0) {
      await this.seedInitialPois();
    }
  }

  async findAll(): Promise<POI[]> {
    return this.poiRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getNearbyPois(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
  ): Promise<POI[]> {
    // Simple bounding box query for nearby POIs
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

  async updatePoi(id: string, data: Partial<POI>): Promise<POI> {
    await this.poiRepository.update(id, data);
    const poi = await this.poiRepository.findOne({ where: { id } });
    if (!poi) {
      throw new Error('POI not found');
    }
    return poi;
  }

  private async seedInitialPois(): Promise<void> {
    this.logger.log('Seeding initial POIs...');

    // Sample POIs for major cities
    const samplePois: Partial<POI>[] = [
      // Beijing
      { name: '天安门广场', latitude: 39.9087, longitude: 116.3975, category: 'landmark' },
      { name: '故宫博物院', latitude: 39.9163, longitude: 116.3972, category: 'museum' },
      { name: '颐和园', latitude: 39.9999, longitude: 116.2755, category: 'park' },
      { name: '天坛公园', latitude: 39.8822, longitude: 116.4066, category: 'park' },
      { name: '北京动物园', latitude: 39.9427, longitude: 116.3324, category: 'attraction' },
      
      // Shanghai
      { name: '外滩', latitude: 31.2400, longitude: 121.4900, category: 'landmark' },
      { name: '东方明珠塔', latitude: 31.2397, longitude: 121.4998, category: 'landmark' },
      { name: '豫园', latitude: 31.2271, longitude: 121.4869, category: 'park' },
      { name: '上海迪士尼乐园', latitude: 31.1434, longitude: 121.6570, category: 'attraction' },
      
      // Shenzhen
      { name: '世界之窗', latitude: 22.5347, longitude: 113.9748, category: 'attraction' },
      { name: '欢乐谷', latitude: 22.5470, longitude: 113.9824, category: 'attraction' },
      { name: '深圳湾公园', latitude: 22.5040, longitude: 113.9370, category: 'park' },
      
      // Guangzhou
      { name: '广州塔', latitude: 23.1066, longitude: 113.3245, category: 'landmark' },
      { name: '白云山', latitude: 23.1834, longitude: 113.2989, category: 'park' },
      { name: '陈家祠', latitude: 23.1255, longitude: 113.2516, category: 'museum' },
      
      // Hangzhou
      { name: '西湖', latitude: 30.2590, longitude: 120.1480, category: 'park' },
      { name: '灵隐寺', latitude: 30.2394, longitude: 120.1003, category: 'landmark' },
      
      // Chengdu
      { name: '大熊猫繁育研究基地', latitude: 30.7325, longitude: 104.1465, category: 'attraction' },
      { name: '宽窄巷子', latitude: 30.6706, longitude: 104.0620, category: 'attraction' },
      
      // Xi'an
      { name: '秦始皇兵马俑博物馆', latitude: 34.3847, longitude: 109.2783, category: 'museum' },
      { name: '大雁塔', latitude: 34.2186, longitude: 108.9646, category: 'landmark' },
      
      // Hong Kong
      { name: '维多利亚港', latitude: 22.2855, longitude: 114.1577, category: 'landmark' },
      { name: '香港迪士尼乐园', latitude: 22.3132, longitude: 114.0419, category: 'attraction' },
      { name: '太平山顶', latitude: 22.2762, longitude: 114.1447, category: 'landmark' },
      
      // Taipei
      { name: '台北101', latitude: 25.0339, longitude: 121.5620, category: 'landmark' },
      { name: '士林夜市', latitude: 25.0881, longitude: 121.5249, category: 'market' },
      
      // International cities
      { name: 'Times Square', latitude: 40.7580, longitude: -73.9855, category: 'landmark' },
      { name: 'Central Park', latitude: 40.7829, longitude: -73.9654, category: 'park' },
      { name: 'Statue of Liberty', latitude: 40.6892, longitude: -74.0445, category: 'landmark' },
      { name: 'Eiffel Tower', latitude: 48.8584, longitude: 2.2945, category: 'landmark' },
      { name: 'Louvre Museum', latitude: 48.8606, longitude: 2.3376, category: 'museum' },
      { name: 'Big Ben', latitude: 51.5007, longitude: -0.1246, category: 'landmark' },
      { name: 'Tower Bridge', latitude: 51.5055, longitude: -0.0754, category: 'landmark' },
      { name: 'Sydney Opera House', latitude: -33.8568, longitude: 151.2153, category: 'landmark' },
      { name: 'Tokyo Tower', latitude: 35.6586, longitude: 139.7454, category: 'landmark' },
      { name: 'Senso-ji Temple', latitude: 35.7148, longitude: 139.7967, category: 'landmark' },
      { name: 'Colosseum', latitude: 41.8902, longitude: 12.4922, category: 'landmark' },
      { name: 'Sagrada Familia', latitude: 41.4036, longitude: 2.1744, category: 'landmark' },
    ];

    for (const poiData of samplePois) {
      const poi = this.poiRepository.create(poiData);
      await this.poiRepository.save(poi);
    }

    this.logger.log(`Seeded ${samplePois.length} POIs`);
  }
}