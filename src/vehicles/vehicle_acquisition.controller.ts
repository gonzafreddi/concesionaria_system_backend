import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VehicleAcquisitionService } from './vechicle_acquisition.service';
import { create } from 'domain';
import { CreateVehicleAcquisitionDto } from './dto/vehicle-acquisition.dto';

@ApiTags('vehicle-acquisition')
@Controller('vehicleAcquisition')
export class VehicleAcquisitionController {
  constructor(
    private readonly vehicleAcquisitionService: VehicleAcquisitionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle acquisition' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle acquisition created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createVehicleAcquisitionDto: CreateVehicleAcquisitionDto) {
    return this.vehicleAcquisitionService.create(
      createVehicleAcquisitionDto.name,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicle acquisitions' })
  @ApiResponse({ status: 200, description: 'List of all vehicle acquisitions' })
  findAll() {
    return this.vehicleAcquisitionService.findAll();
  }
}
