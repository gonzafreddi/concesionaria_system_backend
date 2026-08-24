import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Client } from '../../clients/entities/client.entity';

export enum ConsignmentStatus {
  ACTIVE = 'ACTIVE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

@Entity('consignments')
export class Consignment {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 10 })
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @ApiProperty({ example: 25 })
  @Column({ name: 'owner_client_id', type: 'int' })
  ownerClientId: number;

  @ApiProperty({ example: 13500000 })
  @Column({ name: 'take_price', type: 'decimal', precision: 12, scale: 2 })
  takePrice: number;

  @ApiProperty({ example: 14950000 })
  @Column({
    name: 'estimated_sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  estimatedSalePrice: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duracion de la consignacion expresada en dias',
    nullable: true,
  })
  @Column({ name: 'duration_days', type: 'int', nullable: true })
  durationDays: number | null;

  @ApiProperty({
    enum: ConsignmentStatus,
    default: ConsignmentStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: ConsignmentStatus,
    default: ConsignmentStatus.ACTIVE,
  })
  status: ConsignmentStatus;

  @ApiPropertyOptional({
    example: 'Vehiculo recibido en consignacion por 60 dias.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2026-04-07T18:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-07T18:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.consignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Client, (client) => client.consignments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'owner_client_id' })
  ownerClient: Client;
}
