import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemRarity, ItemType } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemRepository.create(createItemDto);
    return this.itemRepository.save(item);
  }

  async findAll(): Promise<Item[]> {
    return this.itemRepository.find({
      order: { rarity: 'ASC', name: 'ASC' },
    });
  }

  async findByRarity(rarity: ItemRarity): Promise<Item[]> {
    return this.itemRepository.find({
      where: { rarity },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async getRandomItemByWeight(): Promise<Item> {
    // Get all items with their spawn weights
    const items = await this.itemRepository.find();

    if (items.length === 0) {
      throw new NotFoundException('No items available for spawning. Please seed items first.');
    }

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => sum + Number(item.spawnWeight), 0);

    // Random selection based on weight
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= Number(item.spawnWeight);
      if (random <= 0) {
        return item;
      }
    }

    // Fallback to first item
    return items[0];
  }

  async seedItems(items: Partial<Item>[]): Promise<void> {
    for (const itemData of items) {
      const existing = await this.itemRepository.findOne({
        where: { name: itemData.name },
      });
      
      if (!existing) {
        const item = this.itemRepository.create(itemData);
        await this.itemRepository.save(item);
      }
    }
  }
}