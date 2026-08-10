import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PreSaleService } from './pre-sale.service';
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { PreSaleBodywork } from './entities/pre_sale_bodywork.entity';
import { PreSaleAesthetic } from './entities/pre_sale_aesthetic.entity';
import { PreSaleDocumentation } from './entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from './entities/pre_sale_mechanical.entity';

describe('PreSaleService', () => {
  let service: PreSaleService;
  const repository = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSaleService,
        { provide: PreSaleBodyworkService, useValue: {} },
        { provide: PreSaleAestheticService, useValue: {} },
        { provide: PreSaleDocumentationService, useValue: {} },
        { provide: PreSaleMechanicalService, useValue: {} },
        { provide: VehiclesService, useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: repository },
        { provide: getRepositoryToken(PreSaleBodywork), useValue: repository },
        { provide: getRepositoryToken(PreSaleAesthetic), useValue: repository },
        {
          provide: getRepositoryToken(PreSaleDocumentation),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(PreSaleMechanical),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<PreSaleService>(PreSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
