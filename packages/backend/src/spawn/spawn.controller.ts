import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SpawnService } from './spawn.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CollectItemDto } from './dto/collect-item.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';

@Controller('spawned-items')
@UseGuards(JwtAuthGuard)
export class SpawnController {
  constructor(private readonly spawnService: SpawnService) {}

  @Get('nearby')
  async getNearbyItems(@Query() query: NearbyQueryDto) {
    return this.spawnService.getNearbySpawnedItems(
      query.lat,
      query.lng,
      query.radius || 5,
    );
  }

  @Post('collect')
  async collectItem(@Request() req: any, @Body() collectDto: CollectItemDto) {
    return this.spawnService.collectItem(req.user.id, collectDto);
  }

  @Post('spawn')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async spawnItems(@Query('count') count?: string) {
    return this.spawnService.spawnItemsAtPois(count ? parseInt(count) : 50);
  }

  @Post('spawn-nearby')
  async spawnNearbyItems(
    @Body() body: { latitude: number; longitude: number; count?: number },
  ) {
    return this.spawnService.spawnItemsNearLocation(
      body.latitude,
      body.longitude,
      body.count || 10,
    );
  }
}