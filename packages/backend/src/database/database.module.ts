import { Module, OnModuleInit } from '@nestjs/common';
import { ItemSeeder } from './item.seeder';

@Module({})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly itemSeeder: ItemSeeder) {}

  async onModuleInit() {
    // Seeds are run automatically when the module initializes
  }
}