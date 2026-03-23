import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UpdateSaleWorkflowStatusDto } from './dto/update-sale-workflow-status.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }

  @Get(':id/pending-balance')
  getPendingBalance(@Param('id', ParseIntPipe) id: number) {
    // Endpoint dedicado para consultar el saldo pendiente de una venta
    return this.salesService.getPendingBalance(id);
  }

  @Patch(':id/workflow-status')
  updateWorkflowStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleWorkflowStatusDto: UpdateSaleWorkflowStatusDto,
  ) {
    return this.salesService.updateWorkflowStatus(id, updateSaleWorkflowStatusDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.remove(id);
  }
}
