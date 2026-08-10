import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import {
  ServiceOrder,
  ServiceOrderStatus,
} from './entities/service-order.entity';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @InjectRepository(ServiceOrder)
    private readonly ordersRepository: Repository<ServiceOrder>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateServiceOrderDto) {
    await this.ensureReferences(
      dto.clientId,
      dto.vehicleId,
      dto.assignedUserId,
    );
    const order = this.ordersRepository.create({
      ...dto,
      diagnosis: dto.diagnosis?.trim() || null,
      notes: dto.notes?.trim() || null,
      estimatedDeliveryDate: dto.estimatedDeliveryDate
        ? new Date(dto.estimatedDeliveryDate)
        : null,
    });
    return this.ordersRepository.save(order);
  }

  findAll() {
    return this.ordersRepository.find({
      relations: ['client', 'vehicle', 'assignedUser'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['client', 'vehicle', 'assignedUser'],
    });
    if (!order)
      throw new NotFoundException(`Orden de servicio ${id} no encontrada`);
    return order;
  }

  async update(id: number, dto: UpdateServiceOrderDto) {
    const order = await this.findOne(id);
    await this.ensureReferences(
      dto.clientId,
      dto.vehicleId,
      dto.assignedUserId,
    );
    if (
      order.status === ServiceOrderStatus.DELIVERED ||
      order.status === ServiceOrderStatus.CANCELLED
    ) {
      throw new BadRequestException('La orden ya no admite modificaciones');
    }
    Object.assign(order, {
      ...dto,
      diagnosis:
        dto.diagnosis === undefined
          ? order.diagnosis
          : dto.diagnosis?.trim() || null,
      notes: dto.notes === undefined ? order.notes : dto.notes?.trim() || null,
      estimatedDeliveryDate:
        dto.estimatedDeliveryDate === undefined
          ? order.estimatedDeliveryDate
          : new Date(dto.estimatedDeliveryDate),
    });
    return this.ordersRepository.save(order);
  }

  async updateStatus(id: number, dto: UpdateServiceOrderStatusDto) {
    const order = await this.findOne(id);
    this.validateTransition(order.status, dto.status);
    order.status = dto.status;
    if (dto.status === ServiceOrderStatus.DELIVERED)
      order.deliveredAt = new Date();
    return this.ordersRepository.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    if (order.status === ServiceOrderStatus.DELIVERED) {
      throw new BadRequestException('No se puede eliminar una orden entregada');
    }
    await this.ordersRepository.remove(order);
    return { deleted: true };
  }

  private async ensureReferences(
    clientId?: number,
    vehicleId?: number,
    assignedUserId?: number,
  ) {
    if (
      clientId !== undefined &&
      !(await this.clientsRepository.exist({ where: { id: clientId } }))
    ) {
      throw new NotFoundException(`Cliente ${clientId} no encontrado`);
    }
    if (
      vehicleId !== undefined &&
      !(await this.vehiclesRepository.exist({ where: { id: vehicleId } }))
    ) {
      throw new NotFoundException(`Vehiculo ${vehicleId} no encontrado`);
    }
    if (
      assignedUserId !== undefined &&
      !(await this.usersRepository.exist({
        where: { id: assignedUserId, isActive: true },
      }))
    ) {
      throw new NotFoundException(
        `Usuario responsable ${assignedUserId} no encontrado o inactivo`,
      );
    }
  }

  private validateTransition(
    current: ServiceOrderStatus,
    next: ServiceOrderStatus,
  ) {
    const transitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
      OPEN: [ServiceOrderStatus.IN_PROGRESS, ServiceOrderStatus.CANCELLED],
      IN_PROGRESS: [
        ServiceOrderStatus.WAITING_PARTS,
        ServiceOrderStatus.READY,
        ServiceOrderStatus.CANCELLED,
      ],
      WAITING_PARTS: [
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.CANCELLED,
      ],
      READY: [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.IN_PROGRESS],
      DELIVERED: [],
      CANCELLED: [],
    };
    if (!transitions[current].includes(next)) {
      throw new BadRequestException(
        `Transicion invalida: ${current} -> ${next}`,
      );
    }
  }
}
