import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Purchase, PurchaseStatus } from './entities/purchase.entity';
import { Client } from '../clients/entities/client.entity';
import {
  Vehicle,
  VehicleEntryType,
  VehicleStatus,
} from '../vehicles/entities/vehicle.entity';
import { Consignment, ConsignmentStatus } from '../consignment/entities/consignment.entity';
import { GeneratedDocument } from '../documents/entities/generated-document.entity';

describe('PurchaseService', () => {
  let service: PurchaseService;
  let purchaseRepository: any;
  let clientRepository: any;
  let vehicleRepository: any;
  let documentRepository: any;
  let consignmentRepository: any;

  const createQueryBuilderMock = () => {
    const builder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    return builder;
  };

  beforeEach(async () => {
    purchaseRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    clientRepository = {
      findOne: jest.fn(),
    };

    vehicleRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    documentRepository = {
      count: jest.fn(),
    };

    consignmentRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: purchaseRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: clientRepository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: vehicleRepository,
        },
        {
          provide: getRepositoryToken(GeneratedDocument),
          useValue: documentRepository,
        },
        {
          provide: getRepositoryToken(Consignment),
          useValue: consignmentRepository,
        },
      ],
    }).compile();

    service = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rechaza crear una compra si ya existe otra compra para la misma patente', async () => {
    const purchaseByPlateQuery = createQueryBuilderMock();
    purchaseByPlateQuery.getOne.mockResolvedValue({ id: 77 });
    purchaseRepository.createQueryBuilder.mockReturnValue(purchaseByPlateQuery);

    clientRepository.findOne.mockResolvedValue({ id: 5 });
    vehicleRepository.findOne.mockResolvedValue({
      id: 12,
      vehiclePlate: 'AB123CD',
      status: VehicleStatus.PENDING_INSPECTION,
    });

    await expect(
      service.create({
        clientId: 5,
        vehicleId: 12,
        agreedPrice: 15000000,
        purchaseDate: '2026-04-07T10:00:00.000Z',
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'El vehículo con patente AB123CD ya está asociado a la compra 77',
      ),
    );

    expect(purchaseByPlateQuery.where).toHaveBeenCalledWith(
      'LOWER(vehicle.vehiclePlate) = LOWER(:vehiclePlate)',
      { vehiclePlate: 'AB123CD' },
    );
  });

  it('crea una compra cuando la patente no tiene compras previas', async () => {
    const purchaseByPlateQuery = createQueryBuilderMock();
    purchaseByPlateQuery.getOne.mockResolvedValue(null);
    purchaseRepository.createQueryBuilder.mockReturnValue(purchaseByPlateQuery);
    consignmentRepository.findOne.mockResolvedValue(null);

    clientRepository.findOne.mockResolvedValue({ id: 3 });
    vehicleRepository.findOne.mockResolvedValue({
      id: 9,
      vehiclePlate: 'ZZ999YY',
      status: VehicleStatus.PENDING_INSPECTION,
    });

    const createdPurchase = {
      clientId: 3,
      vehicleId: 9,
      agreedPrice: 12300000,
      status: PurchaseStatus.DRAFT,
      purchaseDate: new Date('2026-04-07T11:00:00.000Z'),
      notes: null,
    };

    purchaseRepository.create.mockReturnValue(createdPurchase);
    purchaseRepository.save.mockResolvedValue({ id: 44 });
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 44,
    } as Purchase);

    const result = await service.create({
      clientId: 3,
      vehicleId: 9,
      agreedPrice: 12300000,
      purchaseDate: '2026-04-07T11:00:00.000Z',
    });

    expect(vehicleRepository.save).toHaveBeenCalledWith({
      id: 9,
      vehiclePlate: 'ZZ999YY',
      status: VehicleStatus.PRESALE,
      acquisitionPrice: 12300000,
      entryDate: new Date('2026-04-07T11:00:00.000Z'),
      entryType: VehicleEntryType.DIRECT_PURCHASE,
    });
    expect(result).toEqual({ id: 44 });
  });

  it('rechaza una compra si el vehiculo no existe', async () => {
    clientRepository.findOne.mockResolvedValue({ id: 1 });
    vehicleRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        clientId: 1,
        vehicleId: 999,
        agreedPrice: 1000,
      }),
    ).rejects.toThrow(new NotFoundException('Vehículo 999 no encontrado'));
  });

  it('rechaza una compra directa si el vehiculo tiene una consignacion activa', async () => {
    clientRepository.findOne.mockResolvedValue({ id: 1 });
    vehicleRepository.findOne.mockResolvedValue({
      id: 44,
      vehiclePlate: 'AC123ZZ',
      status: VehicleStatus.AVAILABLE,
    });
    consignmentRepository.findOne.mockResolvedValue({
      id: 8,
      vehicleId: 44,
      status: ConsignmentStatus.ACTIVE,
    });

    await expect(
      service.create({
        clientId: 1,
        vehicleId: 44,
        agreedPrice: 12000000,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'El vehículo 44 tiene una consignación activa y no puede registrarse como compra directa',
      ),
    );
  });
});
