import { Test, TestingModule } from '@nestjs/testing';
import { PreSaleController } from './pre-sale.controller';
import { PreSaleService } from './pre-sale.service';

describe('PreSaleController', () => {
  let controller: PreSaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreSaleController],
      providers: [PreSaleService],
    }).compile();

    controller = module.get<PreSaleController>(PreSaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
