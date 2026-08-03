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
import { ExpenseCategory } from './expense-category.entity';

export enum ExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('expenses')
@Index('idx_expenses_category_id_status', ['categoryId', 'status'])
@Index('idx_expenses_expense_date', ['expenseDate'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  @Column({ name: 'expense_date', type: 'timestamp' })
  expenseDate: Date;

  @Column({
    name: 'supplier_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  supplierName: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ExpenseCategory, (category) => category.expenses, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory;
}
