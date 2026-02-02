import { Test, TestingModule } from '@nestjs/testing';
import { PreSalesService } from './pre_sales.service';

describe('PreSalesService', () => {
  let service: PreSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreSalesService],
    }).compile();

    service = module.get<PreSalesService>(PreSalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
