import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum LocationType {
  DEPOSIT = 'DEPOSIT',
  SHOWROOM = 'SHOWROOM',
  WORKSHOP = 'WORKSHOP',
  OTHER = 'OTHER',
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: LocationType, default: LocationType.DEPOSIT })
  type: LocationType;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.location)
  vehicles: Vehicle[];
}
