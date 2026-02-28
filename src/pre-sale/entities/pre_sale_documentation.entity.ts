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
export class PreSaleDocumentation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) vtv: boolean;
  @Column({ default: false }) policeVerification: boolean;
  @Column({ default: false }) ownershipReport: boolean;
  @Column({ default: false }) titleAndIdVerified: boolean;
  @Column({ default: false }) form08Signed: boolean;
  @Column({ default: false }) insuranceArranged: boolean;
  @Column({ default: false }) cetaForm: boolean;
  @Column({ default: false }) finesAndDebtsCheck: boolean;
  @Column({ default: false }) autoPartsEngraving: boolean;
  @Column({ default: false }) manualsAndKeys: boolean;
  @Column({ default: false }) completed: boolean;
  @Column({ type: 'enum', enum: PreSaleStatus, default: PreSaleStatus.DRAFT })
  status: PreSaleStatus;

  @Column({ nullable: true })
  extraObservations?: string;

  @OneToOne(() => Vehicle)
  @JoinColumn()
  vehicle: Vehicle;
}
//proximo paso crear el servicio para el cambio de estado automatico
