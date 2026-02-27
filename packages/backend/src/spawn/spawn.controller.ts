import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SpawnService } from './spawn.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectItemDto } from './dto/collect-item.dto';

@Controller('spawned-items')
@UseGuards(JwtAuthGuard)
export class SpawnController {
  constructor(private readonly spawnService: SpawnService) {}

  @Get('nearby')
  async getNearbyItems(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.spawnService.getNearbySpawnedItems(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseFloat(radius) : 5,
    );
  }

  @Post('collect')
  async collectItem(@Request() req: any, @Body() collectDto: CollectItemDto) {
    return this.spawnService.collectItem(req.user.id, collectDto);
  }

  @Post('spawn')
  async spawnItems(@Query('count') count?: string) {
    return this.spawnService.spawnItemsAtPois(count ? parseInt(count) : 50);
  }
}