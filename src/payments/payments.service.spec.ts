import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleBalanceCalculatorService } from '../sales/sale-balance-calculator.service';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import {
  Currency,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let dataSourceMock: { createQueryRunner: jest.Mock };
  let saleBalanceCalculatorServiceMock: { calculate: jest.Mock };

  const paymentRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const saleRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    dataSourceMock = {
      createQueryRunner: jest.fn(),
    };

    saleBalanceCalculatorServiceMock = {
      calculate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Sale),
          useValue: saleRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: SaleBalanceCalculatorService,
          useValue: saleBalanceCalculatorServiceMock,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('marca la venta como CONFIRMED cuando un pago confirmado cancela la deuda', async () => {
    const sale = {
      id: 17,
      status: SaleStatus.DRAFT,
      totalPaid: 0,
      finalPrice: 12000,
      tradeIns: [],
      payments: [],
    } as Sale;

    const createdPayment = {
      id: 101,
      sale,
      amount: 12000,
      status: PaymentStatus.CONFIRMED,
      currency: Currency.ARS,
      paidAt: new Date(),
    } as Payment;

    const manager = {
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === Sale) {
          return Promise.resolve(sale);
        }
        if (entity === Payment) {
          return Promise.resolve({ ...createdPayment, sale });
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((_entity, payload) => ({
        ...createdPayment,
        ...payload,
      })),
      save: jest.fn().mockImplementation(async (entity) => entity),
      find: jest.fn().mockResolvedValue([createdPayment]),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    dataSourceMock.createQueryRunner.mockReturnValue(queryRunner);
    saleBalanceCalculatorServiceMock.calculate
      .mockReturnValueOnce({
        tradeInsTotal: 0,
        paymentsTotal: 0,
        pendingBalance: 12000,
      })
      .mockReturnValueOnce({
        tradeInsTotal: 0,
        paymentsTotal: 12000,
        pendingBalance: 0,
      });
    paymentRepositoryMock.findOne.mockResolvedValue({
      ...createdPayment,
      sale,
    });

    const result = await service.createPayment({
      saleId: 17,
      amount: 12000,
      method: PaymentMethod.CASH,
      currency: Currency.ARS,
      status: PaymentStatus.CONFIRMED,
      notes: 'probando validacion',
    });

    expect(result.status).toBe(PaymentStatus.CONFIRMED);
    expect(result.sale.id).toBe(17);
    expect(sale.totalPaid).toBe(12000);
    expect(sale.status).toBe(SaleStatus.CONFIRMED);
  });

  it('bloquea nuevos pagos si la venta ya no tiene saldo pendiente real', async () => {
    const sale = {
      id: 17,
      status: SaleStatus.PARTIALLY_PAID,
      totalPaid: 0,
      finalPrice: 12000,
      tradeIns: [],
      payments: [],
    } as Sale;

    const manager = {
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === Sale) {
          return Promise.resolve(sale);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn(),
      save: jest.fn().mockImplementation(async (entity) => entity),
      find: jest.fn(),
    };

    const queryRunner = {
      manager,
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    dataSourceMock.createQueryRunner.mockReturnValue(queryRunner);
    saleBalanceCalculatorServiceMock.calculate.mockReturnValue({
      tradeInsTotal: 0,
      paymentsTotal: 12000,
      pendingBalance: 0,
    });

    await expect(
      service.createPayment({
        saleId: 17,
        amount: 1,
        method: PaymentMethod.CASH,
        currency: Currency.ARS,
        status: PaymentStatus.PENDING,
      }),
    ).rejects.toThrow(
      new BadRequestException('La venta ya no tiene saldo pendiente'),
    );
    expect(sale.status).toBe(SaleStatus.CONFIRMED);
    expect(manager.save).toHaveBeenCalledWith(sale);
  });
});
