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
export class PreSaleAesthetic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) exteriorWash: boolean;
  @Column({ default: false }) engineWash: boolean;
  @Column({ default: false }) interiorCleaning: boolean;
  @Column({ default: false }) upholsteryCleaning: boolean;
  @Column({ default: false }) glassCleaning: boolean;
  @Column({ default: false }) interiorPlastics: boolean;
  @Column({ default: false }) polishingAndWaxing: boolean;
  @Column({ default: false }) detailing: boolean;
  @Column({ default: false }) badgesAndAccessories: boolean;
  @Column({ default: false }) licensePlateInstall: boolean;
  @Column({ default: false }) completed: boolean;
  @Column({ type: 'enum', enum: PreSaleStatus, default: PreSaleStatus.DRAFT })
  status: PreSaleStatus;

  @Column({ nullable: true })
  observations?: string;

  @OneToOne(() => Vehicle)
  @JoinColumn()
  vehicle: Vehicle;
}
