import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationType } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationsRepository.create({
      name: createLocationDto.name,
      type: createLocationDto.type ?? LocationType.DEPOSIT,
      address: createLocationDto.address ?? null,
      description: createLocationDto.description ?? null,
      isActive: createLocationDto.isActive ?? true,
    });

    return this.locationsRepository.save(location);
  }

  findAll(): Promise<Location[]> {
    return this.locationsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Location> {
    return this.getLocationOrFail(id);
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.getLocationOrFail(id);

    if (updateLocationDto.name !== undefined) {
      location.name = updateLocationDto.name;
    }

    if (updateLocationDto.type !== undefined) {
      location.type = updateLocationDto.type;
    }

    if (updateLocationDto.address !== undefined) {
      location.address = updateLocationDto.address ?? null;
    }

    if (updateLocationDto.description !== undefined) {
      location.description = updateLocationDto.description ?? null;
    }

    if (updateLocationDto.isActive !== undefined) {
      location.isActive = updateLocationDto.isActive;
    }

    return this.locationsRepository.save(location);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const location = await this.getLocationOrFail(id);
    const vehiclesCount = await this.vehiclesRepository.count({
      where: { locationId: id },
    });

    if (vehiclesCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una ubicacion con vehiculos asignados',
      );
    }

    await this.locationsRepository.remove(location);
    return { deleted: true };
  }

  private async getLocationOrFail(id: number): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });

    if (!location) {
      throw new NotFoundException(`Ubicacion ${id} no encontrada`);
    }

    return location;
  }
}
