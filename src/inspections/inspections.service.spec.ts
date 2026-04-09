import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InspectionsService } from './inspections.service';
import { Inspection } from './entities/inspection.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesService } from '../vehicles/vehicles.service';

describe('InspectionsService', () => {
  let service: InspectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionsService,
        { provide: getRepositoryToken(Inspection), useValue: {} },
        { provide: getRepositoryToken(Client), useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: {} },
        { provide: VehiclesService, useValue: {} },
      ],
    }).compile();

    service = module.get<InspectionsService>(InspectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
