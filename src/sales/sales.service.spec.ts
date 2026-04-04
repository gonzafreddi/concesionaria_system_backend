import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

jest.mock('../vehicles/vehicles.service', () => ({
  VehiclesService: class VehiclesService {},
}));

import { Client } from '../clients/entities/client.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { SaleAccountBalanceService } from './sale-account-balance.service';
import { SaleBalanceCalculatorService } from './sale-balance-calculator.service';
import { DocumentationStatus, Sale, SaleStatus, SaleType, TransferStatus } from './entities/sale.entity';
import { TradeIn } from './entities/trade-in.entity';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;
  let dataSource: { transaction: jest.Mock; createQueryRunner: jest.Mock };

  // Mock base para cubrir las dependencias inyectadas por TypeORM
  const repositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    dataSource = {
      transaction: jest.fn(),
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(Sale),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(TradeIn),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Quote),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: VehiclesService,
          useValue: {},
        },
        {
          provide: SaleAccountBalanceService,
          useValue: {
            getPendingBalance: jest.fn(),
          },
        },
        {
          provide: SaleBalanceCalculatorService,
          useValue: {
            calculate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('preserva el estado previo del vehiculo trade-in al crear una venta', async () => {
    const availableVehicle = {
      id: 1,
      price: 100000,
      status: VehicleStatus.AVAILABLE,
      vehiclePlate: 'AAA111',
    } as Vehicle;

    const tradeInVehicle = {
      id: 2,
      price: 20000,
      status: VehicleStatus.PRESALE,
      vehiclePlate: 'BBB222',
    } as Vehicle;

    const client = { id: 1 } as Client;
    const user = { id: 1 } as User;

    const saleEntity = {
      id: 10,
      status: SaleStatus.DRAFT,
      documentationStatus: DocumentationStatus.PENDING,
      transferStatus: TransferStatus.NOT_STARTED,
      type: SaleType.SALE,
    } as Sale;

    const tradeInEntity = {} as TradeIn;

    const manager = {
      findOne: jest
        .fn()
        .mockImplementation((entity, options) => {
          if (entity === Vehicle && options.where.id === 1) {
            return Promise.resolve(availableVehicle);
          }
          if (entity === Vehicle && options.where.id === 2) {
            return Promise.resolve(tradeInVehicle);
          }
          if (entity === Client) {
            return Promise.resolve(client);
          }
          if (entity === User) {
            return Promise.resolve(user);
          }
          if (entity === TradeIn) {
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        }),
      create: jest
        .fn()
        .mockImplementation((entity, payload) => {
          if (entity === Sale) {
            return { ...saleEntity, ...payload };
          }
          if (entity === TradeIn) {
            return { ...tradeInEntity, ...payload };
          }
          return payload;
        }),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };

    dataSource.transaction.mockImplementation(async (callback) => callback(manager));

    await service.create({
      clientId: 1,
      vehicleId: 1,
      userId: 1,
      basePrice: 100000,
      tradeIns: 2,
      discount: 0,
      transferPercentage: 0,
      adminExpenses: 0,
    } as any);

    expect(tradeInVehicle.status).toBe(VehicleStatus.PRESALE);
  });
});
