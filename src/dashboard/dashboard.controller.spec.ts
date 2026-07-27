import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  const dashboardServiceMock = {
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('expone el dashboard centralizado', async () => {
    dashboardServiceMock.getDashboard.mockResolvedValue({
      summary: { vehiclesAvailable: 3 },
      inventory: {},
      sales: {},
      expenses: {},
      operations: {},
    });

    const result = await controller.getDashboard();

    expect(dashboardServiceMock.getDashboard).toHaveBeenCalled();
    expect(result.summary).toEqual({ vehiclesAvailable: 3 });
  });
});
