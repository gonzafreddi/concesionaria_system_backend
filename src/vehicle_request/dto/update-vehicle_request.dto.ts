import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleRequestDto } from './create-vehicle_request.dto';

export class UpdateVehicleRequestDto extends PartialType(CreateVehicleRequestDto) {}
