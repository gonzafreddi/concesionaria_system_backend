import { Injectable } from '@nestjs/common';
import { CreatePreSaleDto } from './dto/create-pre-sale.dto';
import { UpdatePreSaleDto } from './dto/update-pre-sale.dto';

@Injectable()
export class PreSaleService {
  create(createPreSaleDto: CreatePreSaleDto) {
    return 'This action adds a new preSale';
  }

  findAll() {
    return `This action returns all preSale`;
  }

  findOne(id: number) {
    return `This action returns a #${id} preSale`;
  }

  update(id: number, updatePreSaleDto: UpdatePreSaleDto) {
    return `This action updates a #${id} preSale`;
  }

  remove(id: number) {
    return `This action removes a #${id} preSale`;
  }
}
