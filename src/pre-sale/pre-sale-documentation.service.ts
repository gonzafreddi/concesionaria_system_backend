import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreSaleDocumentation } from './entities/pre_sale_documentation.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { CreatePreSaleDocumentationDto } from './dto/create-pre-sale-documentation.dto';
import { UpdatePreSaleDocumentationDto } from './dto/update-pre-sale-documentation.dto';
import { PreSaleStatus } from './entities/pre-sale-status.enum';

@Injectable()
export class PreSaleDocumentationService {
  constructor(
    @InjectRepository(PreSaleDocumentation)
    private repository: Repository<PreSaleDocumentation>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(
    dto: CreatePreSaleDocumentationDto,
  ): Promise<PreSaleDocumentation> {
    const vehicle = await this.vehicleRepository.findOneBy({
      id: dto.vehicleId,
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${dto.vehicleId} not found`);
    }
    const completed =
      dto.completed ?? dto.status === PreSaleStatus.COMPLETED;
    const entity = this.repository.create({
      ...dto,
      completed,
      status: this.resolveStatus(completed, dto.status),
      vehicle,
    });
    return this.repository.save(entity);
  }

  async findAll(): Promise<PreSaleDocumentation[]> {
    return this.repository.find({ relations: ['vehicle'] });
  }

  async findOneByVehicleId(id: number): Promise<PreSaleDocumentation> {
    const entity = await this.repository.findOne({
      where: { vehicle: { id } },
      relations: ['vehicle'],
    });
    if (!entity)
      throw new NotFoundException(
        `PreSaleDocumentation with vehicle id ${id} not found`,
      );
    return entity;
  }

  async update(
    id: number,
    dto: UpdatePreSaleDocumentationDto,
  ): Promise<PreSaleDocumentation> {
    const current = await this.repository.findOneBy({ id });
    if (!current)
      throw new NotFoundException(
        `PreSaleDocumentation with id ${id} not found`,
      );

    const completed = this.resolveCompleted(dto.completed, dto.status, current.completed);
    const entity = await this.repository.preload({
      id,
      ...dto,
      completed,
      status: this.resolveStatus(completed, dto.status),
    });
    if (!entity)
      throw new NotFoundException(
        `PreSaleDocumentation with id ${id} not found`,
      );
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity)
      throw new NotFoundException(
        `PreSaleDocumentation with id ${id} not found`,
      );
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
