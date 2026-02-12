import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * TradeIn Entity
 * 
 * Representa un vehículo dado como parte de pago en una operación.
 * 
 * Un vehículo en TradeIn:
 * - Es un vehículo usado que el cliente aporta
 * - Se valúa en tradeInValue
 * - Se descuenta del precio final
 * - No se duplica (referencia al Vehicle existente)
 * - Puede estar en múltiples TradeIn pero solo en UNA venta activa
 */

@Entity('trade_ins')
export class TradeIn {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (s) => s.tradeIns, { onDelete: 'CASCADE' })
  sale: Sale;

  @ManyToOne(() => Vehicle)
  vehicle: Vehicle;

  // Valuación del vehículo dado como parte de pago
  @Column({ name: 'trade_in_value', type: 'decimal', precision: 10, scale: 2 })
  tradeInValue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
