import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
@Entity('inspections')
export class Inspection {
  // ID del peritaje
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Fecha de la requisa / peritaje
  @CreateDateColumn()
  inspectionDate: Date;

  // =====================
  // Relaciones
  // =====================

  // Cliente
  @ManyToOne(() => Client, (client) => client.inspections)
  client: Client;

  // Vehículo
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.inspections)
  vehicle: Vehicle;

  // =====================
  // Estado General
  // =====================

  // Pintura y chapa (1 a 10)
  @Column({ type: 'int' })
  paintAndBody: number;

  // Porcentaje de cubiertas
  @Column({ type: 'int' })
  tiresPercentage: number;

  // Marca de cubiertas
  @Column()
  tiresBrand: string;

  // Estado interior (1 a 10)
  @Column({ type: 'int' })
  interiorCondition: number;

  // Detalles visibles
  @Column({ type: 'text', nullable: true })
  visibleDetails: string;

  // =====================
  // Condición mecánica / legal
  // =====================

  // Funciona todo (sí / no)
  @Column({ default: true })
  fullyOperational: boolean;

  // Service al día (sí / no)
  @Column({ default: false })
  serviceUpToDate: boolean;

  // Es titular (sí / no)
  @Column({ default: true })
  isOwner: boolean;

  // Tiene deuda de patente (sí / no)
  @Column({ default: false })
  hasLicenseDebt: boolean;

  // Monto deuda de patente
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  licenseDebtAmount: number;

  // =====================
  // Documentación a entregar
  // =====================

  // Cédula
  @Column({ default: false })
  docRegistrationCard: boolean;

  // Título
  @Column({ default: false })
  docTitle: boolean;

  // VTV
  @Column({ default: false })
  docVtv: boolean;

  // DNI del titular
  @Column({ default: false })
  docOwnerId: boolean;

  // Formulario 08
  @Column({ default: false })
  docForm08: boolean;

  // Libre deuda de patentes
  @Column({ default: false })
  docNoDebtCertificate: boolean;

  // Verificación policial
  @Column({ default: false })
  docPoliceVerification: boolean;

  // Informe de dominio
  @Column({ default: false })
  docDomainReport: boolean;

  // =====================
  // Evaluación comercial
  // =====================

  // Valor estimado de mercado
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  estimatedMarketValue: number;

  // Valor de toma
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  tradeInValue?: number;

  // Fecha estimada de ingreso
  @Column({ type: 'date', nullable: true })
  estimatedEntryDate: Date;

  // =====================
  // Observaciones
  // =====================

  // Observaciones generales
  @Column({ type: 'text', nullable: true })
  generalNotes: string;

  // Observaciones sobre pintura / paños a retocar
  @Column({ type: 'text', nullable: true })
  paintNotes: string;
}
