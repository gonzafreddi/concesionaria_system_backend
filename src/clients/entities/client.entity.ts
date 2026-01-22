import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { VehicleRequest } from '../../vehicle_request/entities/vehicle_request.entity';
import { Quote } from '../../quotes/entities/quote.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Inspection } from '../../inspections/entities/inspection.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  dni: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ type: 'text', name: 'signature_data', nullable: true })
  signatureData: string | null;

  @Column({ type: 'timestamp', name: 'signature_created_at', nullable: true })
  signatureCreatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => VehicleRequest, (vr) => vr.client)
  vehicleRequests: VehicleRequest[];

  @OneToMany(() => Quote, (q) => q.client)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.client)
  sales: Sale[];

  @OneToMany(() => Inspection, (i) => i.client)
  inspections: Inspection[];
}
