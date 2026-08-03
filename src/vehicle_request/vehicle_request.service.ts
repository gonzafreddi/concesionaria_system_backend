import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleRequestDto } from './dto/create-vehicle_request.dto';
import { UpdateVehicleRequestDto } from './dto/update-vehicle_request.dto';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { MailService } from '../mail/mail.service';

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
    private readonly mailService: MailService,
  ) {}

  async create(createVehicleRequestDto: CreateVehicleRequestDto) {
    const { clientId, userId, ...rest } = createVehicleRequestDto;
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    const vr = this.vrRepository.create({ ...rest, client, user });
    return this.vrRepository.save(vr);
  }

  findAll() {
    return this.vrRepository.find({
      relations: ['client', 'user', 'matchedVehicle'],
    });
  }

  async findOne(id: number) {
    const vr = await this.vrRepository.findOne({
      where: { id },
      relations: ['client', 'user', 'matchedVehicle'],
    });
    if (!vr) throw new NotFoundException(`VehicleRequest ${id} not found`);
    return vr;
  }

  async update(id: number, updateVehicleRequestDto: UpdateVehicleRequestDto) {
    const { clientId, userId, ...updateData } = updateVehicleRequestDto;
    const vr = await this.findOne(id);

    Object.assign(vr, updateData);

    if (clientId !== undefined) {
      const client = await this.clientRepository.findOne({
        where: { id: clientId },
      });
      if (!client) throw new NotFoundException(`Client ${clientId} not found`);
      vr.client = client;
    }

    if (userId !== undefined) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException(`User ${userId} not found`);
      vr.user = user;
    }

    return this.vrRepository.save(vr);
  }

  async notifyVehicleArrival(vehicleRequestId: number, vehicleId: number) {
    const vehicleRequest = await this.findOne(vehicleRequestId);
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }

    if (!vehicleRequest.client?.email) {
      throw new BadRequestException(
        'El cliente de la solicitud no tiene email cargado',
      );
    }

    const sent = await this.mailService.sendVehicleRequestMatchedEmail({
      to: vehicleRequest.client.email,
      clientName: [
        vehicleRequest.client.firstName,
        vehicleRequest.client.lastName,
      ]
        .filter(Boolean)
        .join(' '),
      requestedVehicle: [vehicleRequest.brand, vehicleRequest.model]
        .filter(Boolean)
        .join(' '),
      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        price: vehicle.price,
      },
    });

    return {
      sent,
      to: vehicleRequest.client.email,
      vehicleRequestId,
      vehicleId,
    };
  }

  async remove(id: number) {
    const vr = await this.findOne(id);
    await this.vrRepository.remove(vr);
    return { deleted: true };
  }
}
