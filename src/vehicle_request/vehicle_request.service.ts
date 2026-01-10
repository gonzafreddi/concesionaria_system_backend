import { Injectable } from '@nestjs/common';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';

@Injectable()
export class VehicleRequestService {
  create(createVehicleRequestDto: CreateVehicleRequestDto) {
    return 'This action adds a new vehicleRequest';
  }

  findAll() {
    return `This action returns all vehicleRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vehicleRequest`;
  }

  update(id: number, updateVehicleRequestDto: UpdateVehicleRequestDto) {
    return `This action updates a #${id} vehicleRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} vehicleRequest`;
  }
}
