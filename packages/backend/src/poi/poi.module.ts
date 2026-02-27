import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoiController } from './poi.controller';
import { PoiService } from './poi.service';
import { POI } from './entities/poi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([POI])],
  controllers: [PoiController],
  providers: [PoiService],
  exports: [PoiService],
})
export class PoiModule {}