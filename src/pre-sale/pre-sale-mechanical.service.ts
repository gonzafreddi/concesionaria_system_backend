import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreSaleMechanical } from './entities/pre_sale_mechanical.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { CreatePreSaleMechanicalDto } from './dto/create-pre-sale-mechanical.dto';
import { UpdatePreSaleMechanicalDto } from './dto/update-pre-sale-mechanical.dto';

@Injectable()
export class PreSaleMechanicalService {
  constructor(
    @InjectRepository(PreSaleMechanical)
    private repository: Repository<PreSaleMechanical>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(dto: CreatePreSaleMechanicalDto): Promise<PreSaleMechanical> {
    const vehicle = await this.vehicleRepository.findOneBy({
      id: dto.vehicleId,
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${dto.vehicleId} not found`);
    }
    const entity = this.repository.create({ ...dto, vehicle });
    return this.repository.save(entity);
  }

  async findAll(): Promise<PreSaleMechanical[]> {
    return this.repository.find({ relations: ['vehicle'] });
  }

  async findOneByVehicleId(id: number): Promise<PreSaleMechanical> {
    const entity = await this.repository.findOne({
      where: { vehicle: { id } },
      relations: ['vehicle'],
    });
    if (!entity)
      throw new NotFoundException(
        `PreSaleMechanical with vehicle id ${id} not found`,
      );
    return entity;
  }

  async update(
    id: number,
    dto: UpdatePreSaleMechanicalDto,
  ): Promise<PreSaleMechanical> {
    const entity = await this.repository.preload({ id, ...dto });
    if (!entity)
      throw new NotFoundException(`PreSaleMechanical with id ${id} not found`);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity)
      throw new NotFoundException(`PreSaleMechanical with id ${id} not found`);
    await this.repository.remove(entity);
  }

  async isCompleted(id: number): Promise<boolean> {
    const entity = await this.findOneByVehicleId(id);
    return entity.completed;
  }
}
