import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehicleRequestService } from './vehicle_request.service';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';

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
  findOne(@Param('id') id: string) {
    return this.vehicleRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleRequestDto: UpdateVehicleRequestDto) {
    return this.vehicleRequestService.update(+id, updateVehicleRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleRequestService.remove(+id);
  }
}
