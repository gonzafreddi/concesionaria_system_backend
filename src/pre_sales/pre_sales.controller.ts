import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreSalesService } from './pre_sales.service';
import { CreatePreSaleDto } from './dto/create-pre_sale.dto';
import { UpdatePreSaleDto } from './dto/update-pre_sale.dto';

@Controller('pre-sales')
export class PreSalesController {
  constructor(private readonly preSalesService: PreSalesService) {}

  @Post()
  create(@Body() createPreSaleDto: CreatePreSaleDto) {
    return this.preSalesService.create(createPreSaleDto);
  }

  @Get()
  findAll() {
    return this.preSalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preSalesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePreSaleDto: UpdatePreSaleDto) {
    return this.preSalesService.update(+id, updatePreSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preSalesService.remove(+id);
  }
}
