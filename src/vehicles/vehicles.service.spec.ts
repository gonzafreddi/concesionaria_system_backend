import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import {
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
  Vehicle,
} from './entities/vehicle.entity';
import { VehiclesService } from './vehicles.service';
import { PurchaseStatus } from '../purchase/entities/purchase.entity';
import { ConsignmentStatus } from '../consignment/entities/consignment.entity';
import { SaleStatus } from '../sales/entities/sale.entity';

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
        mileage: 87500,
        technicalSpecifications: 'Motor 2.0 AT',
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
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
        mileage: 87500,
        technicalSpecifications: 'Motor 2.0 AT',
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
      },
    ]);
  });

  it('incluye purchaseDate, mileage y technicalSpecifications al obtener el detalle del vehiculo', async () => {
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
      mileage: 87500,
      technicalSpecifications: 'Motor 1.6 manual',
      status: VehicleStatus.AVAILABLE,
      entryType: VehicleEntryType.CONSIGNMENT,
      ownerClientId: 18,
      purchases: [
        {
          purchaseDate: new Date('2026-03-24T15:30:00.000Z'),
        },
      ],
    });

    const result = await service.findOne(7);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
      relations: ['purchases', 'images'],
    });
    expect(result.purchaseDate).toBe('2026-03-24T15:30:00.000Z');
    expect(result.mileage).toBe(87500);
    expect(result.technicalSpecifications).toBe('Motor 1.6 manual');
    expect(result.entryType).toBe(VehicleEntryType.CONSIGNMENT);
    expect(result.ownerClientId).toBe(18);
  });

  it('lista en el get general solo vehiculos que ingresaron al stock', async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 12,
        vehiclePlate: 'AB123CD',
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        mileage: 100000,
        technicalSpecifications: '1.4 nafta',
        purchases: [{ id: 1, status: PurchaseStatus.DRAFT }],
        consignments: [],
        tradeIns: [],
      },
      {
        id: 13,
        vehiclePlate: 'AC456EF',
        entryType: VehicleEntryType.CONSIGNMENT,
        purchases: [],
        consignments: [{ id: 2, status: ConsignmentStatus.ACTIVE }],
        tradeIns: [],
      },
      {
        id: 14,
        vehiclePlate: 'AD789GH',
        entryType: VehicleEntryType.TRADE_IN,
        purchases: [],
        consignments: [],
        tradeIns: [{ id: 3, sale: { status: SaleStatus.DRAFT } }],
      },
      {
        id: 15,
        vehiclePlate: 'ZZ111ZZ',
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        purchases: [],
        consignments: [],
        tradeIns: [],
      },
    ]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      relations: ['purchases', 'consignments', 'tradeIns', 'tradeIns.sale', 'images'],
      order: { id: 'DESC' },
    });
    expect(result).toEqual([
      {
        id: 12,
        vehiclePlate: 'AB123CD',
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        mileage: 100000,
        technicalSpecifications: '1.4 nafta',
        images: [],
      },
      {
        id: 13,
        vehiclePlate: 'AC456EF',
        entryType: VehicleEntryType.CONSIGNMENT,
        images: [],
      },
      {
        id: 14,
        vehiclePlate: 'AD789GH',
        entryType: VehicleEntryType.TRADE_IN,
        images: [],
      },
    ]);
  });

  it('lista solo los vehiculos disponibles para compra cuando no tienen compras asociadas', async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 9,
        type: VehicleType.USED,
        brand: 'Toyota',
        model: 'Etios',
        year: 2022,
        color: 'Rojo',
        vehiclePlate: 'AB123CD',
        price: '14350000',
        mileage: 92000,
        technicalSpecifications: '1.5 manual',
        status: VehicleStatus.PENDING_INSPECTION,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
        purchases: [],
      },
      {
        id: 10,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Ka',
        year: 2019,
        color: 'Azul',
        vehiclePlate: 'AC456EF',
        price: '11900000',
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.TRADE_IN,
        ownerClientId: 22,
        purchases: [{ id: 4 }],
      },
    ]);

    const result = await service.getVehiclesAvailableForPurchase();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      relations: ['purchases'],
      order: { id: 'DESC' },
    });
    expect(result).toEqual([
      {
        id: 9,
        type: VehicleType.USED,
        brand: 'Toyota',
        model: 'Etios',
        year: 2022,
        color: 'Rojo',
        vehiclePlate: 'AB123CD',
        price: 14350000,
        mileage: 92000,
        technicalSpecifications: '1.5 manual',
        status: VehicleStatus.PENDING_INSPECTION,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
      },
    ]);
  });
});
