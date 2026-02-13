import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleStatus } from './entities/vehicle.entity';
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create(createVehicleDto as any);
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
}
