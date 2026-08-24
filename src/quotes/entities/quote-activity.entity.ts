import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quote } from './quote.entity';
import { User } from '../../users/entities/user.entity';

export enum QuoteActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  STATUS_CHANGE = 'STATUS_CHANGE',
  TASK = 'TASK',
}

@Entity('quote_activities')
export class QuoteActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quote_id', type: 'int' })
  quoteId: number;

  @Column({ name: 'created_by_id', type: 'int', nullable: true })
  createdById: number | null;

  @Column({
    type: 'enum',
    enum: QuoteActivityType,
    default: QuoteActivityType.NOTE,
  })
  type: QuoteActivityType;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Quote, (quote) => quote.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User | null;
}
