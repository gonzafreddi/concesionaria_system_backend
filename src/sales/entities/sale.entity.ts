import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { Client } from '../../clients/entities/client.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quote, { nullable: true })
  quote: Quote | null;

  @ManyToOne(() => Client, (c) => c.sales)
  client: Client;

  @ManyToOne(() => Vehicle, (v) => v.sales)
  vehicle: Vehicle;

  @ManyToOne(() => User, (u) => u.sales)
  user: User;

  @Column({ name: 'total_amount', type: 'decimal' })
  totalAmount: number;

  @Column({ name: 'sale_date', type: 'timestamp' })
  saleDate: Date;

  @OneToMany(() => Payment, (p) => p.sale)
  payments: Payment[];
}
