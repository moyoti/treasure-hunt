import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  async getAllAchievements() {
    return this.achievementService.getAllAchievements();
  }

  @Get('me')
  async getUserAchievements(@Request() req: any) {
    return this.achievementService.getUserAchievements(req.user.id);
  }
}