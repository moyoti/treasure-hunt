import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ItemSeeder } from './item.seeder';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const itemSeeder = app.get(ItemSeeder);
  await itemSeeder.seedItems();
  
  await app.close();
  console.log('Seeding completed!');
}

runSeeds();