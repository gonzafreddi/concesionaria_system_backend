import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

describe('VehiclesController', () => {
  let controller: VehiclesController;

  const vehiclesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    getVehicleForSale: jest.fn(),
    getPendingInspectionVehicles: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    checkPreSaleCompletion: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: vehiclesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('expone un endpoint dedicado para vehiculos disponibles para venta', async () => {
    vehiclesServiceMock.getVehicleForSale.mockResolvedValue([
      { id: 1, brand: 'Toyota' },
    ]);

    await expect(controller.getAvailableForSaleVehicles()).resolves.toEqual([
      { id: 1, brand: 'Toyota' },
    ]);
    expect(vehiclesServiceMock.getVehicleForSale).toHaveBeenCalled();
  });

  it('expone purchaseDate en el detalle del vehiculo', async () => {
    vehiclesServiceMock.findOne.mockResolvedValue({
      id: 7,
      purchaseDate: '2026-03-24T15:30:00.000Z',
    });

    await expect(controller.findOne(7)).resolves.toEqual({
      id: 7,
      purchaseDate: '2026-03-24T15:30:00.000Z',
    });
    expect(vehiclesServiceMock.findOne).toHaveBeenCalledWith(7);
  });
});
