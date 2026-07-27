import { Test, TestingModule } from '@nestjs/testing';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import {
  VehicleExpenseStatus,
  VehicleExpenseType,
} from './entities/vehicle-expense.entity';
import { VehicleExpensesController } from './vehicle-expenses.controller';
import { VehicleExpensesService } from './vehicle-expenses.service';

describe('VehicleExpensesController', () => {
  let controller: VehicleExpensesController;

  const vehicleExpensesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    getSummary: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleExpensesController],
      providers: [
        {
          provide: VehicleExpensesService,
          useValue: vehicleExpensesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<VehicleExpensesController>(
      VehicleExpensesController,
    );
  });

  it('delega la creacion de gastos al service', async () => {
    const dto: CreateVehicleExpenseDto = {
      type: VehicleExpenseType.CLEANING,
      description: 'Limpieza integral',
      amount: 50000,
      status: VehicleExpenseStatus.PAID,
    };
    vehicleExpensesServiceMock.create.mockResolvedValue({ id: 2, ...dto });

    const result = await controller.create(7, dto);

    expect(vehicleExpensesServiceMock.create).toHaveBeenCalledWith(7, dto);
    expect(result).toEqual({ id: 2, ...dto });
  });

  it('delega el summary al service', async () => {
    vehicleExpensesServiceMock.getSummary.mockResolvedValue({
      vehicleId: 7,
      expensesTotal: 50000,
    });

    const result = await controller.getSummary(7);

    expect(vehicleExpensesServiceMock.getSummary).toHaveBeenCalledWith(7);
    expect(result).toEqual({ vehicleId: 7, expensesTotal: 50000 });
  });

  it('delega la actualizacion al service', async () => {
    const dto: UpdateVehicleExpenseDto = {
      status: VehicleExpenseStatus.CANCELLED,
    };
    vehicleExpensesServiceMock.update.mockResolvedValue({ id: 2, ...dto });

    const result = await controller.update(7, 2, dto);

    expect(vehicleExpensesServiceMock.update).toHaveBeenCalledWith(7, 2, dto);
    expect(result).toEqual({ id: 2, ...dto });
  });
});
