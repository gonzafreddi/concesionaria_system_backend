import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehicleRequestService } from './vehicle_request.service';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';

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

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVehicleRequestDto: UpdateVehicleRequestDto) {
    return this.vehicleRequestService.update(id, updateVehicleRequestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleRequestService.remove(id);
  }
}
