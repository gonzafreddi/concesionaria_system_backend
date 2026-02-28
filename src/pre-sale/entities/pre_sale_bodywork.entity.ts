import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { PreSaleStatus } from './pre-sale-status.enum';

@Entity()
export class PreSaleBodywork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  generalPaintInspection: boolean;

  @Column({ default: false })
  bumperTouchUp: boolean;

  @Column({ default: false })
  opticsPolished: boolean;

  @Column({ default: false })
  minorDentRepair: boolean;

  @Column({ default: false })
  finalPolish: boolean;

  @Column({ default: false }) completed: boolean;
  @Column({ type: 'enum', enum: PreSaleStatus, default: PreSaleStatus.DRAFT })
  status: PreSaleStatus;

  @Column({ nullable: true })
  observations?: string;

  @OneToOne(() => Vehicle)
  @JoinColumn()
  vehicle: Vehicle;
}
