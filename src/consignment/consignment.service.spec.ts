import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ConsignmentService } from './consignment.service';
import { Consignment, ConsignmentStatus } from './entities/consignment.entity';
import {
  Vehicle,
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
} from '../vehicles/entities/vehicle.entity';
import { Client } from '../clients/entities/client.entity';

describe('ConsignmentService', () => {
  let service: ConsignmentService;

  const consignmentRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const vehicleRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const clientRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsignmentService,
        {
          provide: getRepositoryToken(Consignment),
          useValue: consignmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: vehicleRepositoryMock,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: clientRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ConsignmentService>(ConsignmentService);
  });

  it('crea una consignacion y sincroniza el vehiculo', async () => {
    const vehicle = {
      id: 8,
      type: VehicleType.USED,
      brand: 'Toyota',
      model: 'Etios',
      status: VehicleStatus.PENDING_INSPECTION,
      price: 10000000,
      ownerClientId: null,
      entryType: VehicleEntryType.DIRECT_PURCHASE,
    } as Vehicle;

    vehicleRepositoryMock.findOne.mockResolvedValue(vehicle);
    clientRepositoryMock.findOne.mockResolvedValue({ id: 20 });
    consignmentRepositoryMock.findOne.mockResolvedValue(null);
    consignmentRepositoryMock.create.mockImplementation((payload) => payload);
    consignmentRepositoryMock.save.mockResolvedValue({ id: 3 });
    vehicleRepositoryMock.save.mockResolvedValue({});
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 3,
      vehicleId: 8,
      ownerClientId: 20,
    } as Consignment);

    const result = await service.create({
      vehicleId: 8,
      ownerClientId: 20,
      takePrice: 12000000,
      estimatedSalePrice: 13500000,
    });

    expect(vehicle.entryType).toBe(VehicleEntryType.CONSIGNMENT);
    expect(vehicle.ownerClientId).toBe(20);
    expect(Number(vehicle.price)).toBe(13500000);
    expect(result).toEqual({
      id: 3,
      vehicleId: 8,
      ownerClientId: 20,
    });
  });

  it('rechaza una consignacion si el precio estimado es menor al de toma', async () => {
    await expect(
      service.create({
        vehicleId: 8,
        ownerClientId: 20,
        takePrice: 15000000,
        estimatedSalePrice: 12000000,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'El precio estimado de venta no puede ser menor al precio de toma',
      ),
    );
  });

  it('rechaza una segunda consignacion activa para el mismo vehiculo', async () => {
    vehicleRepositoryMock.findOne.mockResolvedValue({
      id: 8,
      status: VehicleStatus.PENDING_INSPECTION,
    });
    clientRepositoryMock.findOne.mockResolvedValue({ id: 20 });
    consignmentRepositoryMock.findOne.mockResolvedValue({
      id: 11,
      status: ConsignmentStatus.ACTIVE,
    });

    await expect(
      service.create({
        vehicleId: 8,
        ownerClientId: 20,
        takePrice: 12000000,
        estimatedSalePrice: 13000000,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'El vehículo 8 ya tiene una consignación activa',
      ),
    );
  });

  it('considera RESERVED como consignacion activa para evitar duplicados', async () => {
    vehicleRepositoryMock.findOne.mockResolvedValue({
      id: 8,
      status: VehicleStatus.PENDING_INSPECTION,
    });
    clientRepositoryMock.findOne.mockResolvedValue({ id: 20 });
    consignmentRepositoryMock.findOne.mockResolvedValue({
      id: 11,
      status: ConsignmentStatus.RESERVED,
    });

    await expect(
      service.create({
        vehicleId: 8,
        ownerClientId: 20,
        takePrice: 12000000,
        estimatedSalePrice: 13000000,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'El vehículo 8 ya tiene una consignación activa',
      ),
    );
  });
});
