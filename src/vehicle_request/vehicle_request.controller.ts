import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleRequestService } from './vehicle_request.service';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';
import { NotifyVehicleArrivalDto } from './dto/notify-vehicle-arrival.dto';

@ApiTags('vehicle-requests')
@Controller('vehicle-request')
export class VehicleRequestController {
  constructor(private readonly vehicleRequestService: VehicleRequestService) {}

  @Post()
  create(@Body() createVehicleRequestDto: CreateVehicleRequestDto) {
    return this.vehicleRequestService.create(createVehicleRequestDto);
  }

  @Get()
  findAll() {
    return this.vehicleRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleRequestService.findOne(id);
  }

  @Post(':id/notify-vehicle-arrival')
  @ApiOperation({
    summary: 'Notificar ingreso de vehiculo para una solicitud',
    description:
      'Envia manualmente un mail al cliente de la solicitud avisando que ingreso un vehiculo que coincide con su busqueda.',
  })
  notifyVehicleArrival(
    @Param('id', ParseIntPipe) id: number,
    @Body() notifyVehicleArrivalDto: NotifyVehicleArrivalDto,
  ) {
    return this.vehicleRequestService.notifyVehicleArrival(
      id,
      notifyVehicleArrivalDto.vehicleId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleRequestDto: UpdateVehicleRequestDto,
  ) {
    return this.vehicleRequestService.update(id, updateVehicleRequestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleRequestService.remove(id);
  }
}
