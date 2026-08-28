import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import {
  VehicleCategory,
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
  Vehicle,
} from './entities/vehicle.entity';
import { VehiclesService } from './vehicles.service';
import { PurchaseStatus } from '../purchase/entities/purchase.entity';
import { ConsignmentStatus } from '../consignment/entities/consignment.entity';
import { SaleStatus } from '../sales/entities/sale.entity';
import { Location, LocationType } from '../locations/entities/location.entity';
import { VehicleLocationMovement } from './entities/vehicle-location-movement.entity';

describe('VehiclesService', () => {
  let service: VehiclesService;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const locationsRepositoryMock = {
    findOne: jest.fn(),
  };

  const vehicleLocationMovementsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
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
        {
          provide: getRepositoryToken(Location),
          useValue: locationsRepositoryMock,
        },
        {
          provide: getRepositoryToken(VehicleLocationMovement),
          useValue: vehicleLocationMovementsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crea un alta manual como stock propio sin dueño anterior', async () => {
    const dto = {
      type: VehicleType.USED,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      color: 'Gris',
      price: 0,
      vehiclePlate: 'AB123CD',
      ownerClientId: 42,
    };
    repositoryMock.create.mockImplementation((payload) => payload);
    repositoryMock.save.mockImplementation((vehicle) =>
      Promise.resolve(vehicle),
    );

    const result = await service.create(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entryType: VehicleEntryType.MANUAL_ENTRY,
        ownerClientId: null,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        entryType: VehicleEntryType.MANUAL_ENTRY,
        ownerClientId: null,
      }),
    );
  });

  it('lista solo los vehiculos elegibles para venta con el contrato esperado', async () => {
    repositoryMock.find.mockResolvedValue([
      {
        id: 7,
        category: VehicleCategory.MOTORCYCLE,
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
        locationId: null,
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
        category: VehicleCategory.MOTORCYCLE,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Focus',
        year: 2020,
        color: 'Gris',
        vehiclePlate: 'AA123BB',
        chassisNumber: null,
        engineNumber: null,
        price: 18500000,
        mileage: 87500,
        technicalSpecifications: 'Motor 2.0 AT',
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        aquisitionPrice: undefined,
        ownerClientId: null,
        locationId: null,
      },
    ]);
  });

  it('incluye purchaseDate, mileage y technicalSpecifications al obtener el detalle del vehiculo', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 7,
      category: VehicleCategory.PICKUP,
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
      images: [],
      locationId: 3,
      location: {
        id: 3,
        name: 'Showroom Centro',
        type: LocationType.SHOWROOM,
        address: 'Av. Centro 100',
      },
    });

    const result = await service.findOne(7);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
      relations: ['purchases', 'images', 'location'],
    });
    expect(result.purchaseDate).toBe('2026-03-24T15:30:00.000Z');
    expect(result.category).toBe(VehicleCategory.PICKUP);
    expect(result.mileage).toBe(87500);
    expect(result.technicalSpecifications).toBe('Motor 1.6 manual');
    expect(result.entryType).toBe(VehicleEntryType.CONSIGNMENT);
    expect(result.ownerClientId).toBe(18);
    expect(result.locationId).toBe(3);
    expect(result.location).toEqual({
      id: 3,
      name: 'Showroom Centro',
      type: LocationType.SHOWROOM,
      address: 'Av. Centro 100',
    });
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
      {
        id: 16,
        vehiclePlate: 'AE123FG',
        entryType: VehicleEntryType.MANUAL_ENTRY,
        purchases: [],
        consignments: [],
        tradeIns: [],
      },
    ]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      relations: [
        'purchases',
        'consignments',
        'tradeIns',
        'tradeIns.sale',
        'images',
        'location',
      ],
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
        location: null,
      },
      {
        id: 13,
        vehiclePlate: 'AC456EF',
        entryType: VehicleEntryType.CONSIGNMENT,
        images: [],
        location: null,
      },
      {
        id: 14,
        vehiclePlate: 'AD789GH',
        entryType: VehicleEntryType.TRADE_IN,
        images: [],
        location: null,
      },
      {
        id: 16,
        vehiclePlate: 'AE123FG',
        entryType: VehicleEntryType.MANUAL_ENTRY,
        images: [],
        location: null,
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
        locationId: null,
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
        locationId: null,
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
        chassisNumber: null,
        engineNumber: null,
        year: 2022,
        color: 'Rojo',
        vehiclePlate: 'AB123CD',
        price: 14350000,
        mileage: 92000,
        aquisitionPrice: undefined,
        technicalSpecifications: '1.5 manual',
        status: VehicleStatus.PENDING_INSPECTION,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
        locationId: null,
      },
    ]);
  });

  it('mueve un vehiculo y registra el historial con usuario autenticado', async () => {
    locationsRepositoryMock.findOne.mockResolvedValue({
      id: 2,
      isActive: true,
    });
    repositoryMock.findOne
      .mockResolvedValueOnce({ id: 7, locationId: 1 })
      .mockResolvedValueOnce({
        id: 7,
        category: VehicleCategory.MOTORCYCLE,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Focus',
        year: 2020,
        color: 'Gris',
        vehiclePlate: 'AA123BB',
        price: '18500000',
        acquisitionPrice: null,
        mileage: null,
        technicalSpecifications: null,
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        ownerClientId: null,
        locationId: 2,
        purchases: [],
        images: [],
        location: {
          id: 2,
          name: 'Deposito Norte',
          type: LocationType.DEPOSIT,
          address: null,
        },
      });
    repositoryMock.save.mockResolvedValue({ id: 7, locationId: 2 });
    vehicleLocationMovementsRepositoryMock.create.mockImplementation(
      (payload) => payload,
    );
    vehicleLocationMovementsRepositoryMock.save.mockResolvedValue({ id: 10 });

    const result = await service.moveLocation(
      7,
      { locationId: 2, reason: ' Traslado a deposito ', userId: 99 },
      5,
    );

    expect(repositoryMock.save).toHaveBeenCalledWith({ id: 7, locationId: 2 });
    expect(vehicleLocationMovementsRepositoryMock.create).toHaveBeenCalledWith({
      vehicleId: 7,
      fromLocationId: 1,
      toLocationId: 2,
      reason: 'Traslado a deposito',
      userId: 5,
    });
    expect(result.locationId).toBe(2);
  });
});
