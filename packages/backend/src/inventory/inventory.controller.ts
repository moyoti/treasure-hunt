import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory(@Request() req: any) {
    return this.inventoryService.getUserInventory(req.user.id);
  }

  @Get('stats')
  async getInventoryStats(@Request() req: any) {
    return this.inventoryService.getUserInventoryStats(req.user.id);
  }

  @Get(':id')
  async getInventoryItem(@Request() req: any, @Param('id') id: string) {
    return this.inventoryService.getInventoryItemById(req.user.id, id);
  }

  @Delete(':id')
  async removeItem(
    @Request() req: any,
    @Param('id') id: string,
    @Query('quantity') quantity?: string,
  ) {
    await this.inventoryService.removeItemFromInventory(
      req.user.id,
      id,
      quantity ? parseInt(quantity) : 1,
    );
    return { success: true };
  }
}