import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum VehicleExpenseType {
  MECHANICAL = 'MECHANICAL',
  BODYWORK = 'BODYWORK',
  DOCUMENTATION = 'DOCUMENTATION',
  CLEANING = 'CLEANING',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export enum VehicleExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('vehicle_expenses')
@Index('idx_vehicle_expenses_vehicle_id_status', ['vehicleId', 'status'])
@Index('idx_vehicle_expenses_vehicle_id_type', ['vehicleId', 'type'])
export class VehicleExpense {
  @ApiProperty({ description: 'Identificador único del gasto' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID del vehículo asociado' })
  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @ApiProperty({
    description: 'Tipo de gasto realizado sobre el vehículo',
    enum: VehicleExpenseType,
    enumName: 'VehicleExpenseType',
  })
  @Column({ type: 'enum', enum: VehicleExpenseType })
  type: VehicleExpenseType;

  @ApiProperty({
    description: 'Descripción del gasto',
    example: 'Cambio de aceite y filtros',
  })
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @ApiProperty({
    description: 'Importe del gasto',
    example: 150000,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Estado del gasto',
    enum: VehicleExpenseStatus,
    enumName: 'VehicleExpenseStatus',
    default: VehicleExpenseStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: VehicleExpenseStatus,
    default: VehicleExpenseStatus.PENDING,
  })
  status: VehicleExpenseStatus;

  @ApiProperty({
    description: 'Fecha efectiva del gasto',
    example: '2026-07-26T15:30:00.000Z',
  })
  @Column({ name: 'expense_date', type: 'timestamp' })
  expenseDate: Date;

  @ApiPropertyOptional({
    description: 'Proveedor o taller asociado al gasto',
    nullable: true,
    example: 'Taller Central',
  })
  @Column({ name: 'supplier_name', type: 'varchar', length: 150, nullable: true })
  supplierName: string | null;

  @ApiPropertyOptional({
    description: 'Notas internas del gasto',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.expenses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
