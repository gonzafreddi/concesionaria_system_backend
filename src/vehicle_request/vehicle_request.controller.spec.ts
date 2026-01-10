import { Test, TestingModule } from '@nestjs/testing';
import { VehicleRequestController } from './vehicle_request.controller';
import { VehicleRequestService } from './vehicle_request.service';

describe('VehicleRequestController', () => {
  let controller: VehicleRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleRequestController],
      providers: [VehicleRequestService],
    }).compile();

    controller = module.get<VehicleRequestController>(VehicleRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
