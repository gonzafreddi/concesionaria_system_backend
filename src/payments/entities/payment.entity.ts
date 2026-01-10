import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sale, (s) => s.payments)
  sale: Sale;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  method: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;
}
