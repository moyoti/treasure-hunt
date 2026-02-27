import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PoiService } from './poi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pois')
@UseGuards(JwtAuthGuard)
export class PoiController {
  constructor(private readonly poiService: PoiService) {}

  @Get()
  async findAll() {
    return this.poiService.findAll();
  }

  @Get('nearby')
  async getNearby(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.poiService.getNearbyPois(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 10,
    );
  }
}