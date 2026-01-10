import { Test, TestingModule } from '@nestjs/testing';
import { VehicleRequestService } from './vehicle_request.service';

describe('VehicleRequestService', () => {
  let service: VehicleRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleRequestService],
    }).compile();

    service = module.get<VehicleRequestService>(VehicleRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
