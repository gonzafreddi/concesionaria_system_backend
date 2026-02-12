import { Test, TestingModule } from '@nestjs/testing';
import { PreSaleService } from './pre-sale.service';

describe('PreSaleService', () => {
  let service: PreSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreSaleService],
    }).compile();

    service = module.get<PreSaleService>(PreSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
