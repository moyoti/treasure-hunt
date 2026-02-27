import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Item } from '../../item/entities/item.entity';

@Entity('spawned_items')
@Index(['latitude', 'longitude'])
export class SpawnedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @ManyToOne(() => Item)
  @JoinColumn()
  item: Item;

  @Column()
  itemId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  poiLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  poiLongitude: number;

  @Column({ nullable: true })
  poiName: string;

  @CreateDateColumn()
  createdAt: Date;
}