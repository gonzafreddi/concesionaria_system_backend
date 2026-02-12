import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
@Entity()
export class PreSaleMechanical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false }) oilAndFilterChange: boolean;
  @Column({ default: false }) airFilter: boolean;
  @Column({ default: false }) fuelFilter: boolean;
  @Column({ default: false }) cabinFilter: boolean;

  @Column({ default: false }) brakeCheck: boolean;
  @Column({ default: false }) suspensionCheck: boolean;
  @Column({ default: false }) steeringCheck: boolean;
  @Column({ default: false }) drivetrainCheck: boolean;
  @Column({ default: false }) exhaustCheck: boolean;
  @Column({ default: false }) timingBeltCheck: boolean;
  @Column({ default: false }) clutchCheck: boolean;
  @Column({ default: false }) batteryCheck: boolean;
  @Column({ default: false }) lightsAndHorn: boolean;
  @Column({ default: false }) tiresCheck: boolean;
  @Column({ default: false }) alignmentAndBalancing: boolean;
  @Column({ default: false }) fluidLevelsCheck: boolean;
  @Column({ default: false }) roadTestAndDiagnostics: boolean;
  @Column({ default: false }) completed: boolean;

  @Column({ nullable: true })
  observations?: string;

  @OneToOne(() => Vehicle)
  @JoinColumn()
  vehicle: Vehicle;
}
