import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import {
  VehicleExpense,
  VehicleExpenseStatus,
  VehicleExpenseType,
} from './entities/vehicle-expense.entity';
import { VehicleExpensesService } from './vehicle-expenses.service';

describe('VehicleExpensesService', () => {
  let service: VehicleExpensesService;

  const vehiclesRepositoryMock = {
    findOne: jest.fn(),
  };

  const vehicleExpensesRepositoryMock = {
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
        VehicleExpensesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: vehiclesRepositoryMock,
        },
        {
          provide: getRepositoryToken(VehicleExpense),
          useValue: vehicleExpensesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<VehicleExpensesService>(VehicleExpensesService);
  });

  it('crea un gasto para un vehiculo existente', async () => {
    vehiclesRepositoryMock.findOne.mockResolvedValue({ id: 7 });
    vehicleExpensesRepositoryMock.create.mockImplementation((payload) => payload);
    vehicleExpensesRepositoryMock.save.mockImplementation((payload) =>
      Promise.resolve({ id: 3, ...payload }),
    );

    const result = await service.create(7, {
      type: VehicleExpenseType.MECHANICAL,
      description: 'Cambio de aceite',
      amount: 150000,
      status: VehicleExpenseStatus.PAID,
      expenseDate: '2026-07-26T15:30:00.000Z',
      supplierName: 'Taller Central',
    });

    expect(vehiclesRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 7 },
    });
    expect(vehicleExpensesRepositoryMock.create).toHaveBeenCalledWith({
      vehicleId: 7,
      type: VehicleExpenseType.MECHANICAL,
      description: 'Cambio de aceite',
      amount: 150000,
      status: VehicleExpenseStatus.PAID,
      expenseDate: new Date('2026-07-26T15:30:00.000Z'),
      supplierName: 'Taller Central',
      notes: null,
    });
    expect(result.id).toBe(3);
  });

  it('calcula el resumen excluyendo gastos cancelados', async () => {
    vehiclesRepositoryMock.findOne.mockResolvedValue({
      id: 7,
      acquisitionPrice: '10000000',
      price: '12500000',
    });
    vehicleExpensesRepositoryMock.find.mockResolvedValue([
      { amount: '500000', status: VehicleExpenseStatus.PAID },
      { amount: '250000', status: VehicleExpenseStatus.PENDING },
      { amount: '100000', status: VehicleExpenseStatus.CANCELLED },
    ]);

    const result = await service.getSummary(7);

    expect(result).toEqual({
      vehicleId: 7,
      acquisitionPrice: 10000000,
      expensesTotal: 750000,
      totalCost: 10750000,
      salePrice: 12500000,
      estimatedProfit: 1750000,
    });
  });

  it('rechaza una fecha de gasto invalida', async () => {
    vehiclesRepositoryMock.findOne.mockResolvedValue({ id: 7 });

    await expect(
      service.create(7, {
        type: VehicleExpenseType.OTHER,
        description: 'Gasto sin fecha valida',
        amount: 1000,
        expenseDate: 'fecha-mala',
      }),
    ).rejects.toThrow(new BadRequestException('Fecha de gasto inválida'));
  });

  it('rechaza operaciones sobre vehiculos inexistentes', async () => {
    vehiclesRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findAll(99)).rejects.toThrow(
      new NotFoundException('Vehículo 99 no encontrado'),
    );
  });
});
