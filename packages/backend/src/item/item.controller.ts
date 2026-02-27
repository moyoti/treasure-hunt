import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findById(id);
  }
}