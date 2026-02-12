import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vehicle_acquisition_types')
export class VehicleAcquisitionTypes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @OneToMany(() => VehicleAcquisitionTypes, (vehicle) => vehicle.id)
  vehicles: VehicleAcquisitionTypes[];
}
