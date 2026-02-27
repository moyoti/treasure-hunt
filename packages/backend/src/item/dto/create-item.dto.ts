import { IsString, IsEnum, IsNumber, IsOptional, IsUrl, Min, Max } from 'class-validator';
import { ItemRarity, ItemType } from '../entities/item.entity';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ItemRarity)
  rarity: ItemRarity;

  @IsEnum(ItemType)
  type: ItemType;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  spawnWeight: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStack?: number;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @IsOptional()
  @IsUrl()
  modelUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}