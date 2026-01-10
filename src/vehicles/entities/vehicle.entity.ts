import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { Sale } from '../../sales/entities/sale.entity';

export enum VehicleType {
  AUTO = 'AUTO',
  MOTO = 'MOTO',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ nullable: true })
  mileage: number | null;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Quote, (q) => q.vehicle)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.vehicle)
  sales: Sale[];
}
