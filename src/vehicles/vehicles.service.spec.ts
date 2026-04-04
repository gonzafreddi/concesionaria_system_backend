import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { VehicleStatus, VehicleType, Vehicle } from './entities/vehicle.entity';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  let service: VehiclesService;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lista solo los vehiculos elegibles para venta con el contrato esperado', async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 7,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Focus',
        year: 2020,
        color: 'Gris',
        vehiclePlate: 'AA123BB',
        price: '18500000',
        status: VehicleStatus.AVAILABLE,
      },
    ]);

    const result = await service.getVehicleForSale();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: {
        status: In([VehicleStatus.AVAILABLE]),
      },
    });
    expect(result).toEqual([
      {
        id: 7,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Focus',
        year: 2020,
        color: 'Gris',
        vehiclePlate: 'AA123BB',
        price: 18500000,
        status: VehicleStatus.AVAILABLE,
      },
    ]);
  });

  it('incluye purchaseDate en formato ISO al obtener el detalle del vehiculo', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 7,
      type: VehicleType.USED,
      brand: 'Ford',
      model: 'Focus',
      year: 2020,
      color: 'Gris',
      vehiclePlate: 'AA123BB',
      price: '18500000',
      acquisitionPrice: '15000000',
      status: VehicleStatus.AVAILABLE,
      purchases: [
        {
          purchaseDate: new Date('2026-03-24T15:30:00.000Z'),
        },
      ],
    });

    const result = await service.findOne(7);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
      relations: ['purchases'],
    });
    expect(result.purchaseDate).toBe('2026-03-24T15:30:00.000Z');
  });
});
