import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { VehicleAcquisitionTypes } from './vehicle_acquisition_types';

export enum VehicleType {
  NEW = 'NEW',
  USED = 'USED',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  ISPECTION = 'INSPECTION',
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

  @Column({ unique: true })
  vehiclePlate: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'decimal', nullable: true })
  acquisitionPrice: number;

  @Column({ type: 'text', nullable: true })
  characteristics: string | null;

  @Column({ type: 'int', nullable: true })
  mileage: number;

  @Column({ type: 'text', nullable: true })
  technicalSpecifications: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ISPECTION,
  })
  status: VehicleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Quote, (q) => q.vehicle)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.vehicle)
  sales: Sale[];

  @ManyToOne(
    () => VehicleAcquisitionTypes,
    (acquisitionType) => acquisitionType.vehicles,
    { nullable: true },
  )
  @JoinColumn({ name: 'acquisition_type_id' })
  acquisitionType: VehicleAcquisitionTypes;
}
