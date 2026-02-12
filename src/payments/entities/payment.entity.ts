import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

/**
 * Payment Entity
 * 
 * Registra cada pago realizado en una operación.
 * 
 * Estado:
 * - PENDING: Pago registrado pero no confirmado
 * - CONFIRMED: Pago validado/recibido (aumenta totalPaid en Sale)
 * - REJECTED: Pago rechazado
 * 
 * NO se usan booleanos como isPaid.
 * El estado de la venta se calcula desde la suma de pagos CONFIRMED.
 * 
 * Solo se permiten nuevos pagos si Sale.status !== DELIVERED/SOLD cerrado
 */

export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FINANCING = 'FINANCING',
  CHECK = 'CHECK',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (s) => s.payments, { onDelete: 'CASCADE' })
  sale: Sale;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

