import { Test, TestingModule } from '@nestjs/testing';
import { PreSaleService } from './pre-sale.service';
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { VehiclesService } from '../vehicles/vehicles.service';

describe('PreSaleService', () => {
  let service: PreSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreSaleService,
        { provide: PreSaleBodyworkService, useValue: {} },
        { provide: PreSaleAestheticService, useValue: {} },
        { provide: PreSaleDocumentationService, useValue: {} },
        { provide: PreSaleMechanicalService, useValue: {} },
        { provide: VehiclesService, useValue: {} },
      ],
    }).compile();

    service = module.get<PreSaleService>(PreSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
