import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Location, LocationType } from './entities/location.entity';
import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;

  const locationsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const vehiclesRepositoryMock = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Location),
          useValue: locationsRepositoryMock,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: vehiclesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('crea una ubicacion activa con tipo por defecto', async () => {
    const createdLocation = {
      name: 'Deposito Central',
      type: LocationType.DEPOSIT,
      address: null,
      description: null,
      isActive: true,
    };
    locationsRepositoryMock.create.mockReturnValue(createdLocation);
    locationsRepositoryMock.save.mockResolvedValue({
      id: 1,
      ...createdLocation,
    });

    await expect(service.create({ name: 'Deposito Central' })).resolves.toEqual(
      { id: 1, ...createdLocation },
    );
    expect(locationsRepositoryMock.create).toHaveBeenCalledWith(
      createdLocation,
    );
  });

  it('no elimina ubicaciones con vehiculos asignados', async () => {
    locationsRepositoryMock.findOne.mockResolvedValue({ id: 2 });
    vehiclesRepositoryMock.count.mockResolvedValue(1);

    await expect(service.remove(2)).rejects.toBeInstanceOf(BadRequestException);
    expect(locationsRepositoryMock.remove).not.toHaveBeenCalled();
  });
});
