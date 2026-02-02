import { Test, TestingModule } from '@nestjs/testing';
import { PreSalesController } from './pre_sales.controller';
import { PreSalesService } from './pre_sales.service';

describe('PreSalesController', () => {
  let controller: PreSalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreSalesController],
      providers: [PreSalesService],
    }).compile();

    controller = module.get<PreSalesController>(PreSalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
