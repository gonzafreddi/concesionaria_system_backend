/* eslint-disable no-useless-catch */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePreSaleAestheticDto } from './dto/create-pre-sale-aesthetic.dto';
import { UpdatePreSaleAestheticDto } from './dto/update-pre-sale-aesthetic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreSaleAesthetic } from './entities/pre_sale_aesthetic.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { PreSaleStatus } from './entities/pre-sale-status.enum';

@Injectable()
export class PreSaleAestheticService {
  constructor(
    @InjectRepository(PreSaleAesthetic)
    private repository: Repository<PreSaleAesthetic>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    createPreSaleAestheticDto: CreatePreSaleAestheticDto,
  ): Promise<PreSaleAesthetic> {
    try {
      const vehicle = await this.vehicleRepository.findOneBy({
        id: createPreSaleAestheticDto.vehicleId,
      });
      if (!vehicle) {
        throw new NotFoundException(
          `Vehicle with id ${createPreSaleAestheticDto.vehicleId} not found`,
        );
      }

      const entity = this.repository.create({
        ...createPreSaleAestheticDto,
        completed:
          createPreSaleAestheticDto.completed ??
          createPreSaleAestheticDto.status === PreSaleStatus.COMPLETED,
        status: this.resolveStatus(
          createPreSaleAestheticDto.completed,
          createPreSaleAestheticDto.status,
        ),
        vehicle,
      });
      return await this.repository.save(entity);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<PreSaleAesthetic[]> {
    return this.repository.find({ relations: ['vehicle'] });
  }

  async findOneByVehicleId(id: number): Promise<PreSaleAesthetic> {
    const entity = await this.repository.findOne({
      where: { vehicle: { id } },
      relations: ['vehicle'],
    });
    if (!entity)
      throw new NotFoundException(`PreSaleAesthetic with id ${id} not found`);
    return entity;
  }

  async update(
    id: number,
    updatePreSaleAestheticDto: UpdatePreSaleAestheticDto,
  ): Promise<PreSaleAesthetic> {
    const current = await this.repository.findOneBy({ id });
    if (!current)
      throw new NotFoundException(`PreSaleAesthetic with id ${id} not found`);

    const completed = this.resolveCompleted(
      updatePreSaleAestheticDto.completed,
      updatePreSaleAestheticDto.status,
      current.completed,
    );

    const entity = await this.repository.preload({
      id,
      ...updatePreSaleAestheticDto,
      completed,
      status: this.resolveStatus(completed, updatePreSaleAestheticDto.status),
    });
    if (!entity)
      throw new NotFoundException(`PreSaleAesthetic with id ${id} not found`);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity)
      throw new NotFoundException(`PreSaleAesthetic with id ${id} not found`);
    await this.repository.remove(entity);
  }

  async isCompleted(id: number): Promise<boolean> {
    const entity = await this.findOneByVehicleId(id);
    return entity.status === PreSaleStatus.COMPLETED;
  }

  private resolveStatus(
    completed?: boolean,
    status?: PreSaleStatus,
  ): PreSaleStatus {
    if (status) return status;
    return completed ? PreSaleStatus.COMPLETED : PreSaleStatus.DRAFT;
  }

  private resolveCompleted(
    completed: boolean | undefined,
    status: PreSaleStatus | undefined,
    current: boolean,
  ): boolean {
    if (typeof completed === 'boolean') return completed;
    if (status) return status === PreSaleStatus.COMPLETED;
    return current;
  }
}
