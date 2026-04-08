import { Test, TestingModule } from '@nestjs/testing';
import { ConsignmentController } from './consignment.controller';
import { ConsignmentService } from './consignment.service';

describe('ConsignmentController', () => {
  let controller: ConsignmentController;

  const consignmentServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsignmentController],
      providers: [
        {
          provide: ConsignmentService,
          useValue: consignmentServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ConsignmentController>(ConsignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('expone el endpoint de alta de consignacion', async () => {
    consignmentServiceMock.create.mockResolvedValue({ id: 5 });

    await expect(
      controller.create({
        vehicleId: 1,
        ownerClientId: 2,
        takePrice: 100,
        estimatedSalePrice: 150,
      }),
    ).resolves.toEqual({ id: 5 });
  });
});
