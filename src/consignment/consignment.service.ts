import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  Consignment,
  ConsignmentStatus,
} from './entities/consignment.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import {
  Vehicle,
  VehicleEntryType,
  VehicleStatus,
} from '../vehicles/entities/vehicle.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class ConsignmentService {
  constructor(
    @InjectRepository(Consignment)
    private readonly consignmentRepository: Repository<Consignment>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  private async getVehicle(vehicleId: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);
    }

    return vehicle;
  }

  private async getOwnerClient(ownerClientId: number): Promise<Client> {
    const ownerClient = await this.clientRepository.findOne({
      where: { id: ownerClientId },
    });

    if (!ownerClient) {
      throw new NotFoundException(
        `Cliente dueño ${ownerClientId} no encontrado`,
      );
    }

    return ownerClient;
  }

  private async validateVehicleAvailabilityForConsignment(
    vehicleId: number,
    excludedConsignmentId?: number,
  ): Promise<void> {
    const existingConsignment = await this.consignmentRepository.findOne({
      where: {
        vehicleId,
        status: Not(ConsignmentStatus.CANCELLED),
      },
      order: { id: 'DESC' },
    });

    if (
      existingConsignment &&
      existingConsignment.status !== ConsignmentStatus.RETURNED &&
      existingConsignment.id !== excludedConsignmentId
    ) {
      throw new BadRequestException(
        `El vehículo ${vehicleId} ya tiene una consignación activa`,
      );
    }
  }

  private async syncVehicleWithConsignment(
    vehicle: Vehicle,
    ownerClientId: number,
    estimatedSalePrice: number,
  ): Promise<void> {
    vehicle.entryType = VehicleEntryType.CONSIGNMENT;
    vehicle.ownerClientId = ownerClientId;
    vehicle.price = estimatedSalePrice;

    if (vehicle.status === VehicleStatus.SOLD) {
      throw new BadRequestException(
        `El vehículo ${vehicle.id} ya fue vendido y no puede consignarse`,
      );
    }

    if (vehicle.status === VehicleStatus.RESERVED) {
      throw new BadRequestException(
        `El vehículo ${vehicle.id} está reservado y no puede consignarse`,
      );
    }

    await this.vehicleRepository.save(vehicle);
  }

  async create(createConsignmentDto: CreateConsignmentDto): Promise<Consignment> {
    if (createConsignmentDto.estimatedSalePrice < createConsignmentDto.takePrice) {
      throw new BadRequestException(
        'El precio estimado de venta no puede ser menor al precio de toma',
      );
    }

    const vehicle = await this.getVehicle(createConsignmentDto.vehicleId);
    await this.getOwnerClient(createConsignmentDto.ownerClientId);
    await this.validateVehicleAvailabilityForConsignment(
      createConsignmentDto.vehicleId,
    );

    const consignment = this.consignmentRepository.create({
      ...createConsignmentDto,
      status: createConsignmentDto.status ?? ConsignmentStatus.ACTIVE,
      notes: createConsignmentDto.notes ?? null,
    });

    await this.syncVehicleWithConsignment(
      vehicle,
      createConsignmentDto.ownerClientId,
      createConsignmentDto.estimatedSalePrice,
    );

    const savedConsignment = await this.consignmentRepository.save(consignment);
    return this.findOne(savedConsignment.id);
  }

  findAll(): Promise<Consignment[]> {
    return this.consignmentRepository.find({
      relations: ['vehicle', 'ownerClient'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Consignment> {
    const consignment = await this.consignmentRepository.findOne({
      where: { id },
      relations: ['vehicle', 'ownerClient'],
    });

    if (!consignment) {
      throw new NotFoundException(`Consignación ${id} no encontrada`);
    }

    return consignment;
  }

  async update(
    id: number,
    updateConsignmentDto: UpdateConsignmentDto,
  ): Promise<Consignment> {
    const consignment = await this.findOne(id);

    const nextVehicleId = updateConsignmentDto.vehicleId ?? consignment.vehicleId;
    const nextOwnerClientId =
      updateConsignmentDto.ownerClientId ?? consignment.ownerClientId;
    const nextTakePrice = Number(
      updateConsignmentDto.takePrice ?? consignment.takePrice,
    );
    const nextEstimatedSalePrice = Number(
      updateConsignmentDto.estimatedSalePrice ?? consignment.estimatedSalePrice,
    );

    if (nextEstimatedSalePrice < nextTakePrice) {
      throw new BadRequestException(
        'El precio estimado de venta no puede ser menor al precio de toma',
      );
    }

    const vehicle = await this.getVehicle(nextVehicleId);
    await this.getOwnerClient(nextOwnerClientId);
    await this.validateVehicleAvailabilityForConsignment(nextVehicleId, id);

    Object.assign(consignment, updateConsignmentDto);
    consignment.notes = updateConsignmentDto.notes ?? consignment.notes ?? null;

    await this.syncVehicleWithConsignment(
      vehicle,
      nextOwnerClientId,
      nextEstimatedSalePrice,
    );

    await this.consignmentRepository.save(consignment);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const consignment = await this.findOne(id);
    await this.consignmentRepository.remove(consignment);
    return { deleted: true };
  }
}
