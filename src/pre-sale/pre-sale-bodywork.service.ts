import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreSaleBodywork } from './entities/pre_sale_bodywork.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { CreatePreSaleBodyworkDto } from './dto/create-pre-sale-bodywork.dto';
import { UpdatePreSaleBodyworkDto } from './dto/update-pre-sale-bodywork.dto';

@Injectable()
export class PreSaleBodyworkService {
  constructor(
    @InjectRepository(PreSaleBodywork)
    private repository: Repository<PreSaleBodywork>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(dto: CreatePreSaleBodyworkDto): Promise<PreSaleBodywork> {
    const vehicle = await this.vehicleRepository.findOneBy({
      id: dto.vehicleId,
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${dto.vehicleId} not found`);
    }
    const entity = this.repository.create({ ...dto, vehicle });
    return this.repository.save(entity);
  }

  async findAll(): Promise<PreSaleBodywork[]> {
    return this.repository.find({ relations: ['vehicle'] });
  }

  async findOneByVehicleId(id: number): Promise<PreSaleBodywork> {
    const entity = await this.repository.findOne({
      where: { vehicle: { id } },
      relations: ['vehicle'],
    });
    if (!entity)
      throw new NotFoundException(
        `PreSaleBodywork with vehicle id ${id} not found`,
      );
    return entity;
  }

  async update(
    id: number,
    dto: UpdatePreSaleBodyworkDto,
  ): Promise<PreSaleBodywork> {
    const entity = await this.repository.preload({ id, ...dto });
    if (!entity)
      throw new NotFoundException(`PreSaleBodywork with id ${id} not found`);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity)
      throw new NotFoundException(`PreSaleBodywork with id ${id} not found`);
    await this.repository.remove(entity);
  }

  async isCompleted(id: number): Promise<boolean> {
    const entity = await this.findOneByVehicleId(id);
    return entity.completed;
  }
}
