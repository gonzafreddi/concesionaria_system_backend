import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum RequestStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('vehicle_requests')
export class VehicleRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (c) => c.vehicleRequests, { eager: false })
  client: Client;

  @ManyToOne(() => User, (u) => u.vehicleRequests, { eager: false })
  user: User;

  @Column({ type: 'enum', enum: ['AUTO', 'MOTO'], nullable: true })
  type: 'AUTO' | 'MOTO' | null;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ name: 'year_from', nullable: true })
  yearFrom: number;

  @Column({ name: 'year_to', nullable: true })
  yearTo: number;

  @Column({ name: 'color_preference', nullable: true })
  colorPreference: string;

  @Column({ name: 'max_price', type: 'decimal', nullable: true })
  maxPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.OPEN })
  status: RequestStatus;

  @ManyToOne(() => Vehicle, { nullable: true })
  matchedVehicle: Vehicle | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
