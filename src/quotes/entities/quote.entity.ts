import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { QuoteActivity } from './quote-activity.entity';

export enum QuoteStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUOTED = 'QUOTED',
  FOLLOW_UP = 'FOLLOW_UP',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  EXPIRED = 'EXPIRED',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id', type: 'int' })
  clientId: number;

  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'quoted_price', type: 'decimal', precision: 12, scale: 2 })
  quotedPrice: number;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  source: string | null;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({
    name: 'down_payment',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  downPayment: number | null;

  @Column({ name: 'financing_details', type: 'text', nullable: true })
  financingDetails: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'next_follow_up_at', type: 'timestamp', nullable: true })
  nextFollowUpAt: Date | null;

  @Column({ name: 'lost_reason', type: 'text', nullable: true })
  lostReason: string | null;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.NEW })
  status: QuoteStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.quotes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User, (user) => user.quotes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.quotes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(() => QuoteActivity, (activity) => activity.quote)
  activities: QuoteActivity[];
}
