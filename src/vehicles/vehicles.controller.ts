import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleSaleOptionDto } from './dto/vehicle-sale-option.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
import { MoveVehicleLocationDto } from './dto/move-vehicle-location.dto';

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
};

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  findAll(@Query('locationId') locationId?: string) {
    if (locationId === undefined) {
      return this.vehiclesService.findAll();
    }

    const parsedLocationId = Number(locationId);
    if (!Number.isInteger(parsedLocationId) || parsedLocationId <= 0) {
      throw new BadRequestException('locationId debe ser un entero positivo');
    }

    return this.vehiclesService.findAll(parsedLocationId);
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

  @ApiOperation({
    summary: 'Listar vehículos disponibles para registrar una compra',
  })
  @ApiOkResponse({
    description:
      'Retorna vehículos que todavía no fueron comprados por la concesionaria',
    type: VehicleSaleOptionDto,
    isArray: true,
  })
  @Get('available-for-purchase')
  getAvailableForPurchaseVehicles() {
    return this.vehiclesService.getVehiclesAvailableForPurchase();
  }

  @ApiOperation({ summary: 'Get vehicles pending inspection' })
  @Get('pending-inspection')
  getPendingInspectionVehicles() {
    return this.vehiclesService.getPendingInspectionVehicles();
  }

  @ApiOkResponse({
    description:
      'Retorna el detalle del vehículo, incluyendo fecha de compra si existe',
    type: VehicleDetailDto,
  })
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

  @ApiOperation({ summary: 'Mover un vehiculo a otra ubicacion' })
  @Patch(':id/location')
  moveLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveVehicleLocationDto: MoveVehicleLocationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.vehiclesService.moveLocation(
      id,
      moveVehicleLocationDto,
      request.user?.id ?? null,
    );
  }

  @ApiOperation({ summary: 'Listar historial de movimientos del vehiculo' })
  @Get(':id/location-movements')
  findLocationMovements(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findLocationMovements(id);
  }

  @ApiOperation({
    summary: 'Check if pre-sale process is completed for a vehicle',
  })
  @Get('/:id/check-presale')
  async checkPreSaleCompletion(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.checkPreSaleCompletion(id);
  }
}
