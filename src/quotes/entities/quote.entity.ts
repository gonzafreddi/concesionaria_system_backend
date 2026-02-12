import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (c) => c.quotes)
  client: Client;

  @ManyToOne(() => User, (u) => u.quotes)
  user: User;

  @ManyToOne(() => Vehicle, (v) => v.quotes)
  vehicle: Vehicle;

  @Column({ name: 'base_price', type: 'decimal' })
  basePrice: number;

  @Column({ name: 'final_price', type: 'decimal' })
  finalPrice: number;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.DRAFT })
  status: QuoteStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
