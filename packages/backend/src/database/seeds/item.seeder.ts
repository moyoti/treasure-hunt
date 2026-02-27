import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item, ItemRarity, ItemType } from '../../item/entities/item.entity';

@Injectable()
export class ItemSeeder implements OnModuleInit {
  private readonly logger = new Logger(ItemSeeder.name);

  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async onModuleInit() {
    const count = await this.itemRepository.count();
    if (count === 0) {
      await this.seedItems();
    }
  }

  async seedItems(): Promise<void> {
    this.logger.log('Seeding items...');

    const items: Partial<Item>[] = [
      // COMMON ITEMS (高权重，容易获得)
      { name: '普通石子', description: '一颗普通的石子，虽然不起眼但也是收藏的一部分。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 10, maxStack: 99 },
      { name: '小树枝', description: '从树上掉落的小树枝，朴实无华。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 10, maxStack: 99 },
      { name: '露珠', description: '清晨凝结的露珠，纯净透明。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 10, maxStack: 99 },
      { name: '落花', description: '随风飘落的花瓣，带着淡淡香气。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 9, maxStack: 99 },
      { name: '幸运草', description: '普通的三叶草，但也有一丝幸运的含义。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 9, maxStack: 50 },
      { name: '鹅卵石', description: '光滑的鹅卵石，被水流打磨多年。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 9, maxStack: 99 },
      { name: '松果', description: '从松树上掉落的果实，是大自然的礼物。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 8, maxStack: 50 },
      { name: '贝壳', description: '大海留下的礼物，带着海的味道。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 8, maxStack: 50 },
      { name: '羽毛', description: '鸟儿遗落的羽毛，轻盈飘逸。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 8, maxStack: 50 },
      { name: '小蘑菇', description: '森林里的小蘑菇，可爱但不可食用。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 8, maxStack: 50 },
      { name: '枫叶', description: '秋天飘落的枫叶，火红一片。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 7, maxStack: 50 },
      { name: '雪花结晶', description: '雪花融化前捕捉的美丽瞬间。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 7, maxStack: 50 },
      { name: '漂流瓶', description: '来自远方的漂流瓶，里面似乎有张纸条。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 6, maxStack: 30 },
      { name: '萤火虫', description: '夏夜的小精灵，发出微弱的光芒。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 6, maxStack: 30 },
      { name: '蒲公英种子', description: '随风飘散的蒲公英种子，许个愿望吧。', rarity: ItemRarity.COMMON, type: ItemType.COLLECTIBLE, spawnWeight: 6, maxStack: 50 },

      // RARE ITEMS (中等权重)
      { name: '水晶碎片', description: '闪闪发光的水晶碎片，蕴含着神秘能量。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 4, maxStack: 20 },
      { name: '月光石', description: '在月光下会发出淡蓝色光芒的石头。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 4, maxStack: 20 },
      { name: '四叶草', description: '传说中的幸运象征，能带来好运。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 4, maxStack: 10 },
      { name: '琥珀', description: '凝固的时光，里面封存着远古的生命。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3.5, maxStack: 20 },
      { name: '猫眼石', description: '如同猫眼一般的宝石，神秘莫测。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3.5, maxStack: 20 },
      { name: '蓝宝石碎片', description: '珍贵的蓝宝石碎片，闪烁着深海的光芒。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3, maxStack: 15 },
      { name: '翡翠玉佩', description: '古老的翡翠玉佩，散发着温润的光泽。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3, maxStack: 10 },
      { name: '彩虹碎片', description: '彩虹的一部分，七彩光芒绚丽夺目。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3, maxStack: 15 },
      { name: '星尘', description: '从天空坠落星尘，闪烁着宇宙的光芒。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 3, maxStack: 30 },
      { name: '极光之羽', description: '被极光染色的羽毛，神秘而美丽。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2.5, maxStack: 15 },
      { name: '珊瑚枝', description: '海底珊瑚的枝条，色彩斑斓。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2.5, maxStack: 15 },
      { name: '珍珠', description: '大海孕育的珍宝，洁白圆润。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2.5, maxStack: 20 },
      { name: '紫水晶', description: '神秘的紫色水晶，散发着高贵的气息。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2, maxStack: 15 },
      { name: '龙鳞片', description: '传说中龙身上的鳞片，坚硬如铁。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2, maxStack: 10 },
      { name: '凤凰羽', description: '凤凰掉落的羽毛，带着不灭的火焰。', rarity: ItemRarity.RARE, type: ItemType.COLLECTIBLE, spawnWeight: 2, maxStack: 10 },

      // EPIC ITEMS (低权重)
      { name: '时光沙漏', description: '据说可以控制时间流逝的神秘物品。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 1, maxStack: 5 },
      { name: '星辰之心', description: '一颗陨落星辰的核心，蕴含无穷能量。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 1, maxStack: 5 },
      { name: '龙之泪', description: '龙悲伤时流下的眼泪，化作水晶。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.8, maxStack: 5 },
      { name: '永恒之火', description: '永不熄灭的火焰，温暖而神秘。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.8, maxStack: 3 },
      { name: '月光宝盒', description: '可以穿越时空的神秘宝盒。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.7, maxStack: 3 },
      { name: '精灵之泪', description: '精灵族珍贵的眼泪，拥有治愈之力。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.7, maxStack: 5 },
      { name: '彩虹桥碎片', description: '连接天地的彩虹桥碎片。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.6, maxStack: 3 },
      { name: '独角兽之角', description: '传说中的独角兽留下的角，纯净无暇。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.6, maxStack: 3 },
      { name: '魔法水晶球', description: '可以预见未来的神秘水晶球。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.5, maxStack: 3 },
      { name: '天使之翼', description: '天使遗落的羽翼，洁白神圣。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.5, maxStack: 3 },
      { name: '海神之泪', description: '海神波塞冬的眼泪，蕴含海洋之力。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.5, maxStack: 3 },
      { name: '仙女尘', description: '仙女洒落的魔粉，可以实现小愿望。', rarity: ItemRarity.EPIC, type: ItemType.COLLECTIBLE, spawnWeight: 0.4, maxStack: 10 },

      // LEGENDARY ITEMS (极低权重)
      { name: '黄金罗盘', description: '可以指引方向的神器，永远不会迷失。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.2, maxStack: 1 },
      { name: '凤凰之心', description: '凤凰涅槃后留下的心脏，永生不灭。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.15, maxStack: 1 },
      { name: '创世之石', description: '宇宙诞生时的第一块石头，蕴含创世之力。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.1, maxStack: 1 },
      { name: '龙之宝藏', description: '巨龙守护千年的宝藏，价值连城。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.1, maxStack: 1 },
      { name: '时间水晶', description: '可以操控时间的水晶，极其珍贵。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.1, maxStack: 1 },
      { name: '永恒之星', description: '永不陨落的星星，照亮黑暗。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.08, maxStack: 1 },
      { name: '神龙之珠', description: '传说中的龙珠，拥有神奇力量。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.08, maxStack: 1 },
      { name: '天使之泪', description: '天使落下的眼泪，可以净化一切。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.05, maxStack: 1 },
      { name: '命运轮盘', description: '可以改变命运的神秘轮盘。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.05, maxStack: 1 },
      { name: '创世神之眼', description: '创世神留下的眼睛，可以洞察一切。', rarity: ItemRarity.LEGENDARY, type: ItemType.COLLECTIBLE, spawnWeight: 0.03, maxStack: 1 },
    ];

    for (const itemData of items) {
      const item = this.itemRepository.create(itemData);
      await this.itemRepository.save(item);
    }

    this.logger.log(`Seeded ${items.length} items`);
  }
}