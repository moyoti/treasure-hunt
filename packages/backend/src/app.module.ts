import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ItemModule } from './item/item.module';
import { SpawnModule } from './spawn/spawn.module';
import { InventoryModule } from './inventory/inventory.module';
import { PoiModule } from './poi/poi.module';
import { appConfig, databaseConfig, jwtConfig } from './config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    
    // Scheduler for item spawning
    ScheduleModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UserModule,
    ItemModule,
    SpawnModule,
    InventoryModule,
    PoiModule,
  ],
})
export class AppModule {}