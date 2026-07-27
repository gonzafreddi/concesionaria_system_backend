import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Quote } from '../../quotes/entities/quote.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { VehicleAcquisitionTypes } from './vehicle_acquisition_types';
import { Inspection } from '../../inspections/entities/inspection.entity';
import { PreSaleAesthetic } from '../../pre-sale/entities/pre_sale_aesthetic.entity';
import { PreSaleDocumentation } from '../../pre-sale/entities/pre_sale_documentation.entity';
import { PreSaleBodywork } from '../../pre-sale/entities/pre_sale_bodywork.entity';
import { PreSaleMechanical } from '../../pre-sale/entities/pre_sale_mechanical.entity';
import { Purchase } from '../../purchase/entities/purchase.entity';
import { Client } from '../../clients/entities/client.entity';
import { Consignment } from '../../consignment/entities/consignment.entity';
import { TradeIn } from '../../sales/entities/trade-in.entity';
import { VehicleImage } from '../../vehicle-images/entities/vehicle-image.entity';
import { VehicleExpense } from '../../vehicle-expenses/entities/vehicle-expense.entity';
export enum VehicleType {
  NEW = 'NEW',
  USED = 'USED',
}

export enum VehicleStatus {
  PENDING_INSPECTION = 'PENDING_INSPECTION',
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  INSPECTION = 'INSPECTION',
  PRESALE = 'PRESALE',
}

export enum VehicleEntryType {
  DIRECT_PURCHASE = 'DIRECT_PURCHASE',
  CONSIGNMENT = 'CONSIGNMENT',
  TRADE_IN = 'TRADE_IN',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ unique: true })
  vehiclePlate: string;

  @Column()
  year: number;

  @Column()
  color: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'decimal', nullable: true })
  acquisitionPrice: number;

  @Column({ type: 'text', nullable: true })
  characteristics: string | null;

  @Column({ type: 'int', nullable: true })
  mileage: number;

  @Column({ type: 'text', nullable: true })
  technicalSpecifications: string;

  @Column({ type: 'date', nullable: true })
  entryDate: Date | null;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.PENDING_INSPECTION,
  })
  status: VehicleStatus;

  @Column({
    name: 'entry_type',
    type: 'enum',
    enum: VehicleEntryType,
    default: VehicleEntryType.DIRECT_PURCHASE,
  })
  entryType: VehicleEntryType;

  @Column({ name: 'owner_client_id', type: 'int', nullable: true })
  ownerClientId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Quote, (q) => q.vehicle)
  quotes: Quote[];

  @OneToMany(() => Sale, (s) => s.vehicle)
  sales: Sale[];

  @ManyToOne(
    () => VehicleAcquisitionTypes,
    (acquisitionType) => acquisitionType.vehicles,
    { nullable: true },
  )
  @JoinColumn({ name: 'acquisition_type_id' })
  acquisitionType: VehicleAcquisitionTypes;

  @ManyToOne(() => Client, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_client_id' })
  ownerClient: Client | null;

  @OneToMany(() => Inspection, (i: Inspection) => i.vehicle)
  inspections: Inspection[];

  @OneToMany(() => Consignment, (consignment) => consignment.vehicle)
  consignments: Consignment[];

  @OneToMany(() => TradeIn, (tradeIn) => tradeIn.vehicle)
  tradeIns: TradeIn[];

  @OneToOne(
    () => PreSaleAesthetic,
    (preSaleAesthetic) => preSaleAesthetic.vehicle,
  )
  preSaleAesthetic: PreSaleAesthetic;

  @OneToOne(
    () => PreSaleDocumentation,
    (preSaleDocumentation) => preSaleDocumentation.vehicle,
  )
  preSaleDocumentation: PreSaleDocumentation;

  @OneToOne(() => PreSaleBodywork, (preSaleBodywork) => preSaleBodywork.vehicle)
  preSaleBodywork: PreSaleBodywork;

  @OneToOne(
    () => PreSaleMechanical,
    (preSaleMechanical) => preSaleMechanical.vehicle,
  )
  preSaleMechanical: PreSaleMechanical;

  @OneToMany(() => Purchase, (purchase) => purchase.vehicle)
  purchases: Purchase[];

  @OneToMany(() => VehicleImage, (vehicleImage) => vehicleImage.vehicle)
  images: VehicleImage[];

  @OneToMany(() => VehicleExpense, (vehicleExpense) => vehicleExpense.vehicle)
  expenses: VehicleExpense[];
}

