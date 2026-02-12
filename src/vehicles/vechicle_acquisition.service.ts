import { Injectable } from '@nestjs/common';
import { VehicleAcquisitionTypes } from './entities/vehicle_acquisition_types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class VehicleAcquisitionService {
  constructor(
    @InjectRepository(VehicleAcquisitionTypes)
    private acquisitionRepo: Repository<VehicleAcquisitionTypes>,
  ) {}

  create(name: string) {
    const acquisitionType = this.acquisitionRepo.create({ name, active: true });
    return this.acquisitionRepo.save(acquisitionType);
  }

  findAll() {
    return this.acquisitionRepo.find();
  }

  async findOne(id: number) {
    return this.acquisitionRepo.findOne({ where: { id } });
  }

  async update(id: number, name: string, active: boolean) {
    const acquisitionType = await this.findOne(id);
    if (!acquisitionType) {
      throw new Error(`Acquisition Type with id ${id} not found`);
    }
    acquisitionType.name = name;
    acquisitionType.active = active;
    return this.acquisitionRepo.save(acquisitionType);
  }
}
