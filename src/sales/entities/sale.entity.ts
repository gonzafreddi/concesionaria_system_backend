import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { Client } from '../../clients/entities/client.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { TradeIn } from './trade-in.entity';

/**
 * Sale Entity
 *
 * Soporta tanto operaciones de venta como compra (SALE/PURCHASE).
 *
 * Flujo unificado:
 * - SALE: Cliente compra vehículo (stock disminuye)
 * - PURCHASE: Concesionaria compra vehículo (stock aumenta)
 *
 * Estado: Transiciones validadas en SaleService
 * - DRAFT: Operación inicial sin confirmar
 * - RESERVED: Cliente reserva, vehículo marcado como RESERVED
 * - SOLD/DELIVERED: Completada, vehículo pasado a SOLD
 *
 * Precio: basePrice es inicial, finalPrice se calcula con tradein y pagos
 */

export enum SaleType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
}

export enum SaleStatus {
  DRAFT = 'DRAFT',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  DELIVERED = 'DELIVERED',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  // Tipo de operación: SALE (venta) o PURCHASE (compra)
  @Column({ type: 'enum', enum: SaleType, default: SaleType.SALE })
  type: SaleType;

  // Estado de la operación
  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.DRAFT })
  status: SaleStatus;

  @ManyToOne(() => Quote, { nullable: true })
  quote: Quote | null;

  @ManyToOne(() => Client, (c) => c.sales)
  client: Client;

  @ManyToOne(() => Vehicle, (v) => v.sales)
  vehicle: Vehicle;

  @ManyToOne(() => User, (u) => u.sales)
  user: User;

  // Precio base inicial
  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  // Precio final después de descontos/tradein (calculado automáticamente)
  @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  // Monto total pagado (suma de pagos confirmados)
  @Column({
    name: 'total_paid',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPaid: number;

  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate: Date;

  @OneToMany(() => Payment, (p) => p.sale, { cascade: true })
  payments: Payment[];

  // Trade-ins asociados (vehículos dados como parte de pago)
  @OneToMany(() => TradeIn, (t) => t.sale, { cascade: true })
  tradeIns: TradeIn[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
