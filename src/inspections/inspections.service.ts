import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { Inspection } from './entities/inspection.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { VehicleStatus } from 'src/vehicles/entities/vehicle.entity';
import { VehiclesService } from 'src/vehicles/vehicles.service';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly vehiclesService: VehiclesService,
  ) {}

  /**
   * Helper para obtener mensaje de error de forma segura
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Crear una nueva inspección
   */
  async create(createInspectionDto: CreateInspectionDto): Promise<Inspection> {
    try {
      const { clientId, vehicleId, ...inspectionData } = createInspectionDto;

      const inspection = this.inspectionRepository.create({
        ...inspectionData,
        client: clientId ? { id: clientId } : undefined,
        vehicle: vehicleId ? { id: vehicleId } : undefined,
      });
      await this.inspectionRepository.save(inspection);

      // si se proporciona una inspeccion cambimos al estado de pre venta PRESALE
      await this.vehiclesService.changeStatus(vehicleId, VehicleStatus.PRESALE);

      return inspection;
    } catch (error) {
      throw new BadRequestException(
        `Error al crear la inspección: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Obtener todas las inspecciones
   */
  async findAll(): Promise<Inspection[]> {
    try {
      return await this.inspectionRepository.find({
        relations: ['client', 'vehicle'],
        order: { inspectionDate: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener inspecciones: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Obtener una inspección por ID
   */
  async findOne(id: string): Promise<Inspection> {
    try {
      const inspection = await this.inspectionRepository.findOne({
        where: { id },
        relations: ['client', 'vehicle'],
      });

      if (!inspection) {
        throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
      }

      return inspection;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener la inspección: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Actualizar una inspección
   */
  async update(
    id: string,
    updateInspectionDto: UpdateInspectionDto,
  ): Promise<Inspection> {
    try {
      const inspection = await this.findOne(id);

      // Validar que el cliente existe si se está actualizando
      if (
        updateInspectionDto.clientId &&
        updateInspectionDto.clientId !== inspection.client.id
      ) {
        const client = await this.clientRepository.findOne({
          where: { id: updateInspectionDto.clientId },
        });
        if (!client) {
          throw new NotFoundException(
            `Cliente con ID ${updateInspectionDto.clientId} no encontrado`,
          );
        }
      }

      // Validar que el vehículo existe si se está actualizando
      if (
        updateInspectionDto.vehicleId &&
        updateInspectionDto.vehicleId !== inspection.vehicle.id
      ) {
        const vehicle = await this.vehicleRepository.findOne({
          where: { id: updateInspectionDto.vehicleId },
        });
        if (!vehicle) {
          throw new NotFoundException(
            `Vehículo con ID ${updateInspectionDto.vehicleId} no encontrado`,
          );
        }
      }

      // Validar puntuaciones si se están actualizando
      if (
        updateInspectionDto.paintAndBody &&
        (updateInspectionDto.paintAndBody < 1 ||
          updateInspectionDto.paintAndBody > 10)
      ) {
        throw new BadRequestException(
          'La puntuación de pintura y chapa debe estar entre 1 y 10',
        );
      }

      if (
        updateInspectionDto.interiorCondition &&
        (updateInspectionDto.interiorCondition < 1 ||
          updateInspectionDto.interiorCondition > 10)
      ) {
        throw new BadRequestException(
          'La puntuación de condición interior debe estar entre 1 y 10',
        );
      }

      if (
        updateInspectionDto.tiresPercentage &&
        (updateInspectionDto.tiresPercentage < 0 ||
          updateInspectionDto.tiresPercentage > 100)
      ) {
        throw new BadRequestException(
          'El porcentaje de cubiertas debe estar entre 0 y 100',
        );
      }

      // Aplicar cambios
      Object.assign(inspection, updateInspectionDto);
      return await this.inspectionRepository.save(inspection);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar la inspección: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Eliminar una inspección
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const inspection = await this.findOne(id);
      await this.inspectionRepository.remove(inspection);
      return { message: `Inspección con ID ${id} eliminada exitosamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar la inspección: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Obtener inspecciones por cliente
   */
  async findByClient(clientId: number): Promise<Inspection[]> {
    try {
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Cliente con ID ${clientId} no encontrado`);
      }

      return await this.inspectionRepository.find({
        where: { client: { id: clientId } },
        relations: ['client', 'vehicle'],
        order: { inspectionDate: 'DESC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener inspecciones del cliente: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Obtener inspecciones por vehículo
   */
  async findByVehicle(vehicleId: number): Promise<Inspection[]> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          `Vehículo con ID ${vehicleId} no encontrado`,
        );
      }

      return await this.inspectionRepository.find({
        where: { vehicle: { id: vehicleId } },
        relations: ['client', 'vehicle'],
        order: { inspectionDate: 'DESC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener inspecciones del vehículo: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Calcular puntuación general de la inspección
   */
  async getInspectionScore(
    id: string,
  ): Promise<{ overallScore: number; details: object }> {
    try {
      const inspection = await this.findOne(id);

      const paintScore = inspection.paintAndBody || 0;
      const interiorScore = inspection.interiorCondition || 0;
      const tiresScore = Math.min(inspection.tiresPercentage / 10, 10) || 0;

      const overallScore = (paintScore + interiorScore + tiresScore) / 3;

      return {
        overallScore: Math.round(overallScore * 100) / 100,
        details: {
          paintAndBody: paintScore,
          interiorCondition: interiorScore,
          tiresPercentage: inspection.tiresPercentage,
          fullyOperational: inspection.fullyOperational,
          serviceUpToDate: inspection.serviceUpToDate,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al calcular puntuación: ${this.getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Obtener documentación pendiente
   */
  async getPendingDocumentation(
    id: string,
  ): Promise<{ pending: string[]; complete: boolean }> {
    try {
      const inspection = await this.findOne(id);

      const pending: string[] = [];

      if (!inspection.docRegistrationCard) pending.push('Cédula');
      if (!inspection.docTitle) pending.push('Título');
      if (!inspection.docVtv) pending.push('VTV');
      if (!inspection.docOwnerId) pending.push('DNI del titular');
      if (!inspection.docForm08) pending.push('Formulario 08');
      if (!inspection.docNoDebtCertificate)
        pending.push('Libre deuda de patentes');
      if (!inspection.docPoliceVerification)
        pending.push('Verificación policial');
      if (!inspection.docDomainReport) pending.push('Informe de dominio');

      return {
        pending,
        complete: pending.length === 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener documentación pendiente: ${this.getErrorMessage(error)}`,
      );
    }
  }
}
