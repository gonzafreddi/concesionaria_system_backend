import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PreSaleService } from './pre-sale.service';
import { CreatePreSaleDto } from './dto/create-pre-sale.dto';
import { UpdatePreSaleDto } from './dto/update-pre-sale.dto';

@ApiTags('pre-sale')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('pre-sale')
export class PreSaleController {
  constructor(private readonly preSaleService: PreSaleService) {}

  @Post()
  create(@Body() createPreSaleDto: CreatePreSaleDto) {
    return this.preSaleService.create(createPreSaleDto);
  }

  @Get()
  findAll() {
    return this.preSaleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preSaleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePreSaleDto: UpdatePreSaleDto) {
    return this.preSaleService.update(+id, updatePreSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preSaleService.remove(+id);
  }

  @Get(':id/verify-completion')
  verifyCompletion(@Param('id') id: string) {
    return this.preSaleService.verifyCompletion(+id);
  }
}
//TODO: acomodar verificacion de completion
