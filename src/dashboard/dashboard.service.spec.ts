import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import {
  Consignment,
  ConsignmentStatus,
} from '../consignment/entities/consignment.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { PreSaleStatus } from '../pre-sale/entities/pre-sale-status.enum';
import { PreSaleAesthetic } from '../pre-sale/entities/pre_sale_aesthetic.entity';
import { PreSaleBodywork } from '../pre-sale/entities/pre_sale_bodywork.entity';
import { PreSaleDocumentation } from '../pre-sale/entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from '../pre-sale/entities/pre_sale_mechanical.entity';
import {
  Sale,
  SaleStatus,
  TransferStatus,
} from '../sales/entities/sale.entity';
import {
  VehicleExpense,
  VehicleExpenseStatus,
  VehicleExpenseType,
} from '../vehicle-expenses/entities/vehicle-expense.entity';
import {
  RequestStatus,
  VehicleRequest,
} from '../vehicle_request/entities/vehicle_request.entity';
import {
  Vehicle,
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
} from '../vehicles/entities/vehicle.entity';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const createRepositoryMock = () => ({
    find: jest.fn(),
    count: jest.fn(),
  });

  const repositories = {
    vehicles: createRepositoryMock(),
    expenses: createRepositoryMock(),
    sales: createRepositoryMock(),
    payments: createRepositoryMock(),
    clients: createRepositoryMock(),
    inspections: createRepositoryMock(),
    consignments: createRepositoryMock(),
    vehicleRequests: createRepositoryMock(),
    preSaleDocumentation: createRepositoryMock(),
    preSaleMechanical: createRepositoryMock(),
    preSaleAesthetic: createRepositoryMock(),
    preSaleBodywork: createRepositoryMock(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: repositories.vehicles,
        },
        {
          provide: getRepositoryToken(VehicleExpense),
          useValue: repositories.expenses,
        },
        { provide: getRepositoryToken(Sale), useValue: repositories.sales },
        {
          provide: getRepositoryToken(Payment),
          useValue: repositories.payments,
        },
        { provide: getRepositoryToken(Client), useValue: repositories.clients },
        {
          provide: getRepositoryToken(Inspection),
          useValue: repositories.inspections,
        },
        {
          provide: getRepositoryToken(Consignment),
          useValue: repositories.consignments,
        },
        {
          provide: getRepositoryToken(VehicleRequest),
          useValue: repositories.vehicleRequests,
        },
        {
          provide: getRepositoryToken(PreSaleDocumentation),
          useValue: repositories.preSaleDocumentation,
        },
        {
          provide: getRepositoryToken(PreSaleMechanical),
          useValue: repositories.preSaleMechanical,
        },
        {
          provide: getRepositoryToken(PreSaleAesthetic),
          useValue: repositories.preSaleAesthetic,
        },
        {
          provide: getRepositoryToken(PreSaleBodywork),
          useValue: repositories.preSaleBodywork,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('arma un dashboard centralizado con stock, ventas, gastos y operaciones', async () => {
    repositories.vehicles.find.mockResolvedValue([
      {
        id: 1,
        type: VehicleType.USED,
        brand: 'Ford',
        model: 'Focus',
        vehiclePlate: 'AA123BB',
        status: VehicleStatus.AVAILABLE,
        entryType: VehicleEntryType.DIRECT_PURCHASE,
        price: '12500000',
        acquisitionPrice: '10000000',
        expenses: [
          { amount: '500000', status: VehicleExpenseStatus.PAID },
          { amount: '100000', status: VehicleExpenseStatus.CANCELLED },
        ],
      },
      {
        id: 2,
        type: VehicleType.USED,
        brand: 'Toyota',
        model: 'Etios',
        vehiclePlate: 'AB456CD',
        status: VehicleStatus.RESERVED,
        entryType: VehicleEntryType.CONSIGNMENT,
        price: '9000000',
        acquisitionPrice: '8000000',
        expenses: [],
      },
    ] as Vehicle[]);
    repositories.expenses.find.mockResolvedValue([
      {
        id: 10,
        vehicleId: 1,
        type: VehicleExpenseType.MECHANICAL,
        status: VehicleExpenseStatus.PAID,
        description: 'Service',
        amount: '500000',
        expenseDate: new Date('2026-07-26T15:30:00.000Z'),
        vehicle: { brand: 'Ford', model: 'Focus', vehiclePlate: 'AA123BB' },
      },
    ] as unknown as VehicleExpense[]);
    repositories.sales.find.mockResolvedValue([
      {
        id: 20,
        status: SaleStatus.PARTIALLY_PAID,
        transferStatus: TransferStatus.IN_PROGRESS,
        finalPrice: '12500000',
        totalPaid: '4000000',
        saleDate: new Date('2026-07-26T16:00:00.000Z'),
        payments: [{ amount: '4000000', status: PaymentStatus.CONFIRMED }],
        tradeIns: [{ tradeInValue: '1000000' }],
        client: { firstName: 'Juan', lastName: 'Perez' },
        vehicle: { brand: 'Ford', model: 'Focus', vehiclePlate: 'AA123BB' },
      },
    ] as unknown as Sale[]);
    repositories.payments.find.mockResolvedValue([
      { amount: '4000000', status: PaymentStatus.CONFIRMED },
      { amount: '1000000', status: PaymentStatus.PENDING },
    ] as Payment[]);
    repositories.clients.count.mockResolvedValue(8);
    repositories.inspections.count.mockResolvedValue(3);
    repositories.consignments.count.mockResolvedValue(2);
    repositories.vehicleRequests.count.mockResolvedValue(1);
    repositories.preSaleDocumentation.count.mockResolvedValue(1);
    repositories.preSaleDocumentation.find.mockResolvedValue([
      { status: PreSaleStatus.DRAFT, vehicle: { id: 1 } },
    ]);
    repositories.preSaleMechanical.find.mockResolvedValue([
      { status: PreSaleStatus.DRAFT, vehicle: { id: 1 } },
    ]);
    repositories.preSaleAesthetic.find.mockResolvedValue([]);
    repositories.preSaleBodywork.find.mockResolvedValue([]);

    const result = await service.getDashboard();

    expect(repositories.vehicles.find).toHaveBeenCalledWith({
      relations: ['expenses'],
    });
    expect(repositories.consignments.count).toHaveBeenCalledWith({
      where: [
        { status: ConsignmentStatus.ACTIVE },
        { status: ConsignmentStatus.RESERVED },
      ],
    });
    expect(repositories.vehicleRequests.count).toHaveBeenCalledWith({
      where: { status: RequestStatus.OPEN },
    });
    expect(result.summary).toEqual({
      vehiclesTotal: 2,
      vehiclesAvailable: 1,
      vehiclesReserved: 1,
      vehiclesSold: 0,
      clientsTotal: 8,
      salesTotal: 1,
      salesConfirmed: 0,
      pendingBalanceAmount: 7500000,
      stockValue: 12500000,
      inventoryValue: 12500000,
      inventoryCost: 10500000,
      estimatedInventoryProfit: 2000000,
    });
    expect(result.inventory.stockValue).toBe(12500000);
    expect(result.sales.pendingAmount).toBe(7500000);
    expect(result.expenses.total).toBe(500000);
    expect(result.operations.preSaleInProgress).toBe(1);
  });
});
