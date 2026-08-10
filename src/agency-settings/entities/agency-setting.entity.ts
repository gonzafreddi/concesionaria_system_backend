import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('agency_settings')
export class AgencySetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'legal_name', type: 'varchar', nullable: true })
  legalName: string | null;

  @Column({ name: 'trade_name', type: 'varchar', nullable: true })
  tradeName: string | null;

  @Column({ name: 'tax_id', type: 'varchar', nullable: true })
  taxId: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  province: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ name: 'representative_name', type: 'varchar', nullable: true })
  representativeName: string | null;

  @Column({ name: 'representative_document', type: 'varchar', nullable: true })
  representativeDocument: string | null;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'tax_condition', type: 'varchar', nullable: true })
  taxCondition: string | null;

  @Column({ name: 'postal_code', type: 'varchar', nullable: true })
  postalCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
