import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehicleRequestController } from './vehicle_request.controller';
import { VehicleRequestService } from './vehicle_request.service';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

describe('VehicleRequestController', () => {
  let controller: VehicleRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleRequestController],
      providers: [
        VehicleRequestService,
        { provide: getRepositoryToken(VehicleRequest), useValue: {} },
        { provide: getRepositoryToken(Client), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: {} },
      ],
    }).compile();

    controller = module.get<VehicleRequestController>(VehicleRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
