import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Document } from '../../documents/entities/document.entity';

/**
 * Estados de la operación de compra del vehículo.
 *
 * DRAFT: registro inicial todavía editable
 * DOCUMENTS_PENDING: compra avanzada, con documentación todavía incompleta
 * COMPLETED: compra cerrada correctamente
 * CANCELLED: compra anulada
 */
export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Purchase Entity
 *
 * Representa la compra de un vehículo por parte de la concesionaria.
 * Se vincula al cliente vendedor, al vehículo incorporado y a los documentos
 * generados o adjuntados para la operación.
 */
@Entity('purchases')
export class Purchase {
  @ApiProperty({ description: 'Identificador único de la compra' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID del cliente vendedor asociado' })
  @Index()
  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @ApiProperty({ description: 'ID del vehículo adquirido' })
  @Index()
  @Column({ name: 'vehicle_id', type: 'int', unique: true })
  vehicleId: number;

  @ApiProperty({
    description: 'Estado operativo actual de la compra',
    enum: PurchaseStatus,
    enumName: 'PurchaseStatus',
    default: PurchaseStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    default: PurchaseStatus.DRAFT,
  })
  status: PurchaseStatus;

  @ApiProperty({
    description: 'Monto acordado para comprar el vehículo',
    example: 13500000,
  })
  @Column({ name: 'agreed_price', type: 'decimal', precision: 12, scale: 2 })
  agreedPrice: number;

  @ApiPropertyOptional({
    description: 'Observaciones internas o comerciales de la compra',
    nullable: true,
    example: 'Vehículo recibido con segundo juego de llaves y manuales.',
  })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    description: 'Fecha efectiva en la que se registró la compra',
    example: '2026-03-24T15:30:00.000Z',
  })
  @Column({ name: 'purchase_date', type: 'timestamp' })
  purchaseDate: Date;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Cliente que vende el vehículo a la concesionaria.
  @ManyToOne(() => Client, (client) => client.purchases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  // Vehículo que ingresa al stock a través de esta compra.
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.purchases, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  // Documentación asociada a la compra.
  @OneToMany(() => Document, (document) => document.purchase)
  documents: Document[];
}
