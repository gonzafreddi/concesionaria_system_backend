import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStatus } from './entities/vehicle.entity';
import { PreSaleStatus } from '../pre-sale/entities/pre-sale-status.enum';
import { VehicleSaleOptionDto } from './dto/vehicle-sale-option.dto';
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  private static readonly SALE_ELIGIBLE_STATUSES = [VehicleStatus.AVAILABLE];

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

  async findOne(id: number) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`);
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: number) {
    const vehicle = await this.findOne(id);
    await this.vehiclesRepository.remove(vehicle);
    return { deleted: true };
  }

  async changeStatus(id: number, status: VehicleStatus) {
    const vehicle = await this.findOne(id);
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
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
      relations: [
        'preSaleAesthetic',
        'preSaleDocumentation',
        'preSaleMechanical',
      ],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
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
