import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { SaleAccountBalanceService } from './sale-account-balance.service';
import { SaleBalanceCalculatorService } from './sale-balance-calculator.service';
import { Sale } from './entities/sale.entity';
import { TradeIn } from './entities/trade-in.entity';
import { SalesService } from './sales.service';

describe('SalesService', () => {
  let service: SalesService;

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
          useValue: {
            // Se mockean solo los puntos necesarios para que el módulo compile
            transaction: jest.fn(),
            createQueryRunner: jest.fn(),
          },
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
});
