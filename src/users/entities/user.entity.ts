import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
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
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => VehicleRequest, (vr) => vr.user)
  vehicleRequests: VehicleRequest[];

  @OneToMany(() => Quote, (q) => q.user)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.user)
  sales: Sale[];
}
