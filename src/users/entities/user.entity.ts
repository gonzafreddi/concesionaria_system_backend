import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Quote } from '../../quotes/entities/quote.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { VehicleRequest } from '../../vehicle_request/entities/vehicle_request.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  MANAGER = 'MANAGER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SELLER })
  role: UserRole;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => VehicleRequest, (vr) => vr.user)
  vehicleRequests: VehicleRequest[];

  @OneToMany(() => Quote, (q) => q.user)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.user)
  sales: Sale[];
}
