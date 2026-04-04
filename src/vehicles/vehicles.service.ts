import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStatus } from './entities/vehicle.entity';
import { PreSaleStatus } from '../pre-sale/entities/pre-sale-status.enum';
import { VehicleSaleOptionDto } from './dto/vehicle-sale-option.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  private static readonly SALE_ELIGIBLE_STATUSES = [VehicleStatus.AVAILABLE];

  private async getVehicleEntityById(
    id: number,
    relations?: string[],
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }

    return vehicle;
  }

  private mapToVehicleDetail(vehicle: Vehicle): VehicleDetailDto {
    const purchaseDate =
      vehicle.purchases?.[0]?.purchaseDate instanceof Date
        ? vehicle.purchases[0].purchaseDate.toISOString()
        : vehicle.purchases?.[0]?.purchaseDate
          ? new Date(vehicle.purchases[0].purchaseDate).toISOString()
          : null;

    return {
      id: vehicle.id,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      vehiclePlate: vehicle.vehiclePlate,
      year: vehicle.year,
      color: vehicle.color,
      price: Number(vehicle.price),
      acquisitionPrice:
        vehicle.acquisitionPrice !== null &&
        vehicle.acquisitionPrice !== undefined
          ? Number(vehicle.acquisitionPrice)
          : null,
      purchaseDate,
      status: vehicle.status,
    };
  }

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      status:
        createVehicleDto.status ?? VehicleStatus.PENDING_INSPECTION,
    } as any);
    return this.vehiclesRepository.save(vehicle);
  }

  findAll() {
    return this.vehiclesRepository.find();
  }

  async findOne(id: number): Promise<VehicleDetailDto> {
    const vehicle = await this.getVehicleEntityById(id, ['purchases']);
    return this.mapToVehicleDetail(vehicle);
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.getVehicleEntityById(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: number) {
    const vehicle = await this.getVehicleEntityById(id);
    await this.vehiclesRepository.remove(vehicle);
    return { deleted: true };
  }

  async changeStatus(id: number, status: VehicleStatus) {
    const vehicle = await this.getVehicleEntityById(id);
    vehicle.status = status;
    return this.vehiclesRepository.save(vehicle);
  }

  async getVehicleForSale(): Promise<VehicleSaleOptionDto[]> {
    const vehicles = await this.vehiclesRepository.find({
      where: {
        status: In(VehiclesService.SALE_ELIGIBLE_STATUSES),
      },
    });

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehiclePlate: vehicle.vehiclePlate,
      price: Number(vehicle.price),
      status: vehicle.status,
    }));
  }

  async getPendingInspectionVehicles() {
    return this.vehiclesRepository.find({
      where: {
        status: VehicleStatus.PENDING_INSPECTION,
      },
    });
  }

  async checkPreSaleCompletion(vehicleId: number) {
    const vehicle = await this.getVehicleEntityById(vehicleId, [
      'preSaleAesthetic',
      'preSaleDocumentation',
      'preSaleMechanical',
    ]);
    const allCompleted =
      vehicle?.preSaleAesthetic?.status === PreSaleStatus.COMPLETED &&
      vehicle?.preSaleDocumentation?.status === PreSaleStatus.COMPLETED &&
      vehicle?.preSaleMechanical?.status === PreSaleStatus.COMPLETED;

    if (allCompleted) {
      vehicle.status = VehicleStatus.AVAILABLE;
      await this.vehiclesRepository.save(vehicle);
    }
    return allCompleted;
  }
}
