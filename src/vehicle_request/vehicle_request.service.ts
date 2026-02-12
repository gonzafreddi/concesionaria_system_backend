import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class VehicleRequestService {
  constructor(
    @InjectRepository(VehicleRequest)
    private vrRepository: Repository<VehicleRequest>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleRequestDto: CreateVehicleRequestDto) {
    const { clientId, userId, ...rest } = createVehicleRequestDto as any;
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    const vr = this.vrRepository.create({ ...rest, client, user });
    return this.vrRepository.save(vr);
  }

  findAll() {
    return this.vrRepository.find({ relations: ['client', 'user', 'matchedVehicle'] });
  }

  async findOne(id: number) {
    const vr = await this.vrRepository.findOne({ where: { id }, relations: ['client', 'user', 'matchedVehicle'] });
    if (!vr) throw new NotFoundException(`VehicleRequest ${id} not found`);
    return vr;
  }

  async update(id: number, updateVehicleRequestDto: UpdateVehicleRequestDto) {
    const vr = await this.findOne(id);
    Object.assign(vr, updateVehicleRequestDto);
    return this.vrRepository.save(vr);
  }

  async remove(id: number) {
    const vr = await this.findOne(id);
    await this.vrRepository.remove(vr);
    return { deleted: true };
  }
}
