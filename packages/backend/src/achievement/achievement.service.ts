import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'collection' | 'rarity' | 'distance';
}

export interface UserAchievement {
  achievement: Achievement;
  progress: number;
  completed: boolean;
  completedAt: Date | null;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_collect', name: '初次收藏', description: '收集第一个宝藏', icon: '🎯', requirement: 1, type: 'collection' },
  { id: 'collector_10', name: '收藏新手', description: '收集10个宝藏', icon: '📦', requirement: 10, type: 'collection' },
  { id: 'collector_50', name: '收藏达人', description: '收集50个宝藏', icon: '🎁', requirement: 50, type: 'collection' },
  { id: 'collector_100', name: '收藏大师', description: '收集100个宝藏', icon: '👑', requirement: 100, type: 'collection' },
  { id: 'rare_item', name: '稀有发现', description: '获得一件稀有物品', icon: '💎', requirement: 1, type: 'rarity' },
  { id: 'epic_item', name: '史诗收获', description: '获得一件史诗物品', icon: '🌟', requirement: 1, type: 'rarity' },
  { id: 'legendary_item', name: '传说猎人', description: '获得一件传说物品', icon: '🏆', requirement: 1, type: 'rarity' },
];

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    // 获取用户收藏数量
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.inventoryItems', 'inventory')
      .select('user.id', 'userId')
      .addSelect('COUNT(inventory.id)', 'collectionCount')
      .where('user.id = :userId', { userId })
      .groupBy('user.id')
      .getRawOne();

    const collectionCount = user ? parseInt(user.collectionCount) || 0 : 0;

    // 计算成就进度
    return ACHIEVEMENTS.map(achievement => {
      let progress = 0;
      let completed = false;

      if (achievement.type === 'collection') {
        progress = Math.min(collectionCount, achievement.requirement);
        completed = collectionCount >= achievement.requirement;
      } else {
        // 稀有度成就需要实际查询库存
        progress = 0;
        completed = false;
      }

      return {
        achievement,
        progress,
        completed,
        completedAt: completed ? new Date() : null,
      };
    });
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return ACHIEVEMENTS;
  }
}