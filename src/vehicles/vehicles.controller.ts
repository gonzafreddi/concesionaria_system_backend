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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleSaleOptionDto } from './dto/vehicle-sale-option.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }
  @ApiOperation({
    summary: 'Listar vehículos habilitados para ser ofrecidos en una venta',
  })
  @ApiOkResponse({
    description:
      'Retorna exclusivamente los vehículos elegibles para venta según la regla de negocio vigente',
    type: VehicleSaleOptionDto,
    isArray: true,
  })
  @Get('available-for-sale')
  getAvailableForSaleVehicles() {
    return this.vehiclesService.getVehicleForSale();
  }

  @ApiOperation({ summary: 'Get vehicles pending inspection' })
  @Get('pending-inspection')
  getPendingInspectionVehicles() {
    return this.vehiclesService.getPendingInspectionVehicles();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.remove(id);
  }
  @ApiOperation({
    summary: 'Check if pre-sale process is completed for a vehicle',
  })
  @Get('/:id/check-presale')
  async checkPreSaleCompletion(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.checkPreSaleCompletion(id);
  }
}
