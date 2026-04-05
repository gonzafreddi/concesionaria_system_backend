import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

jest.mock('../vehicles/vehicles.service', () => ({
  VehiclesService: class VehiclesService {},
}));

import { Client } from '../clients/entities/client.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
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
  let saleBalanceCalculatorServiceMock: { calculate: jest.Mock };

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

    saleBalanceCalculatorServiceMock = {
      calculate: jest.fn(),
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
          useValue: saleBalanceCalculatorServiceMock,
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
    saleBalanceCalculatorServiceMock.calculate.mockReturnValue({
      tradeInsTotal: 20000,
      paymentsTotal: 0,
      pendingBalance: 80000,
    });

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

  it('marca el vehiculo principal como vendido cuando un pago completa la venta', async () => {
    const vehicle = {
      id: 1,
      status: VehicleStatus.RESERVED,
    } as Vehicle;
    const sale = {
      id: 10,
      status: SaleStatus.PARTIALLY_PAID,
      totalPaid: 70000,
      finalPrice: 100000,
      vehicle,
      tradeIns: [],
    } as Sale;
    const payment = {
      id: 20,
      amount: 30000,
      status: PaymentStatus.PENDING,
      sale,
    } as Payment;

    const manager = {
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === Payment) {
          return Promise.resolve(payment);
        }
        if (entity === Sale) {
          return Promise.resolve(sale);
        }
        return Promise.resolve(null);
      }),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    dataSource.createQueryRunner.mockReturnValue(queryRunner);
    saleBalanceCalculatorServiceMock.calculate.mockReturnValue({
      tradeInsTotal: 0,
      paymentsTotal: 100000,
      pendingBalance: 0,
    });

    const result = await service.confirmPayment(20, PaymentStatus.CONFIRMED);

    expect(result.sale.status).toBe(SaleStatus.CONFIRMED);
    expect(vehicle.status).toBe(VehicleStatus.SOLD);
  });

  it('bloquea confirmar un pago extra si la venta ya quedo cerrada', async () => {
    const sale = {
      id: 10,
      status: SaleStatus.CONFIRMED,
      totalPaid: 100000,
      finalPrice: 100000,
      vehicle: { id: 1, status: VehicleStatus.SOLD } as Vehicle,
      tradeIns: [],
    } as Sale;
    const payment = {
      id: 21,
      amount: 5000,
      status: PaymentStatus.PENDING,
      sale,
    } as Payment;

    const manager = {
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === Payment) {
          return Promise.resolve(payment);
        }
        if (entity === Sale) {
          return Promise.resolve(sale);
        }
        return Promise.resolve(null);
      }),
      save: jest.fn(),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    dataSource.createQueryRunner.mockReturnValue(queryRunner);

    await expect(
      service.confirmPayment(21, PaymentStatus.CONFIRMED),
    ).rejects.toThrow(
      new BadRequestException(
        'No se pueden confirmar pagos de una operación cerrada',
      ),
    );
  });
});
