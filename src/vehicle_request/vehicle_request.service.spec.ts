import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehicleRequestService } from './vehicle_request.service';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

describe('VehicleRequestService', () => {
  let service: VehicleRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleRequestService,
        { provide: getRepositoryToken(VehicleRequest), useValue: {} },
        { provide: getRepositoryToken(Client), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: {} },
      ],
    }).compile();

    service = module.get<VehicleRequestService>(VehicleRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
