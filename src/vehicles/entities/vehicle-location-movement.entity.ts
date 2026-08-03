import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_location_movements')
export class VehicleLocationMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vehicle_id', type: 'int' })
  vehicleId: number;

  @Column({ name: 'from_location_id', type: 'int', nullable: true })
  fromLocationId: number | null;

  @Column({ name: 'to_location_id', type: 'int', nullable: true })
  toLocationId: number | null;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.locationMovements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'from_location_id' })
  fromLocation: Location | null;

  @ManyToOne(() => Location, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'to_location_id' })
  toLocation: Location | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
