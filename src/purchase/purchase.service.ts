import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase, PurchaseStatus } from './entities/purchase.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  private async findPurchaseByVehiclePlate(
    vehiclePlate: string,
    excludedPurchaseId?: number,
  ): Promise<Purchase | null> {
    const query = this.purchaseRepository
      .createQueryBuilder('purchase')
      .innerJoinAndSelect('purchase.vehicle', 'vehicle')
      .where('LOWER(vehicle.vehiclePlate) = LOWER(:vehiclePlate)', {
        vehiclePlate,
      });

    if (excludedPurchaseId !== undefined) {
      query.andWhere('purchase.id != :excludedPurchaseId', {
        excludedPurchaseId,
      });
    }

    return query.getOne();
  }

  /**
   * Crea una compra validando que cliente y vehículo existan
   * y que el vehículo no esté ya asociado a otra compra.
   */
  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const client = await this.clientRepository.findOne({
      where: { id: createPurchaseDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Cliente ${createPurchaseDto.clientId} no encontrado`,
      );
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createPurchaseDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehículo ${createPurchaseDto.vehicleId} no encontrado`,
      );
    }

    const existingPurchase = await this.findPurchaseByVehiclePlate(
      vehicle.vehiclePlate,
    );

    if (existingPurchase) {
      throw new BadRequestException(
        `El vehículo con patente ${vehicle.vehiclePlate} ya está asociado a la compra ${existingPurchase.id}`,
      );
    }

    const purchaseDate = createPurchaseDto.purchaseDate
      ? new Date(createPurchaseDto.purchaseDate)
      : new Date();

    if (Number.isNaN(purchaseDate.getTime())) {
      throw new BadRequestException('La fecha de compra es inválida');
    }

    const purchase = this.purchaseRepository.create({
      clientId: client.id,
      vehicleId: vehicle.id,
      agreedPrice: createPurchaseDto.agreedPrice,
      status: createPurchaseDto.status ?? PurchaseStatus.DRAFT,
      purchaseDate,
      notes: createPurchaseDto.notes ?? null,
    });

    // La compra incorpora el vehículo al inventario y sincroniza
    // el precio de adquisición visible en la ficha del vehículo.
    vehicle.acquisitionPrice = createPurchaseDto.agreedPrice;
    vehicle.entryDate = purchaseDate;
    vehicle.status = VehicleStatus.PRESALE;
    await this.vehicleRepository.save(vehicle);

    const savedPurchase = await this.purchaseRepository.save(purchase);
    return this.findOne(savedPurchase.id);
  }

  /**
   * Devuelve el listado completo de compras con sus relaciones principales.
   */
  findAll(): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      relations: ['client', 'vehicle', 'documents'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  /**
   * Busca una compra puntual por ID.
   */
  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['client', 'vehicle', 'documents'],
    });

    if (!purchase) {
      throw new NotFoundException(`Compra ${id} no encontrada`);
    }

    return purchase;
  }

  /**
   * Actualiza parcialmente una compra y sincroniza cambios relevantes
   * sobre el vehículo cuando corresponde.
   */
  async update(
    id: number,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (
      updatePurchaseDto.clientId !== undefined &&
      updatePurchaseDto.clientId !== purchase.clientId
    ) {
      const client = await this.clientRepository.findOne({
        where: { id: updatePurchaseDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(
          `Cliente ${updatePurchaseDto.clientId} no encontrado`,
        );
      }

      purchase.clientId = client.id;
    }

    if (
      updatePurchaseDto.vehicleId !== undefined &&
      updatePurchaseDto.vehicleId !== purchase.vehicleId
    ) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: updatePurchaseDto.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(
          `Vehículo ${updatePurchaseDto.vehicleId} no encontrado`,
        );
      }

      const existingPurchase = await this.findPurchaseByVehiclePlate(
        vehicle.vehiclePlate,
        id,
      );

      if (existingPurchase) {
        throw new BadRequestException(
          `El vehículo con patente ${vehicle.vehiclePlate} ya pertenece a otra compra`,
        );
      }

      purchase.vehicleId = vehicle.id;
    }

    if (updatePurchaseDto.purchaseDate !== undefined) {
      const purchaseDate = new Date(updatePurchaseDto.purchaseDate);

      if (Number.isNaN(purchaseDate.getTime())) {
        throw new BadRequestException('La fecha de compra es inválida');
      }

      purchase.purchaseDate = purchaseDate;
    }

    if (updatePurchaseDto.agreedPrice !== undefined) {
      if (updatePurchaseDto.agreedPrice <= 0) {
        throw new BadRequestException(
          'El monto acordado debe ser mayor a cero',
        );
      }

      purchase.agreedPrice = updatePurchaseDto.agreedPrice;
    }

    if (updatePurchaseDto.status !== undefined) {
      purchase.status = updatePurchaseDto.status;
    }

    if (updatePurchaseDto.notes !== undefined) {
      purchase.notes = updatePurchaseDto.notes ?? null;
    }

    const savedPurchase = await this.purchaseRepository.save(purchase);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: savedPurchase.vehicleId },
    });

    if (vehicle) {
      vehicle.acquisitionPrice = savedPurchase.agreedPrice;
      vehicle.entryDate = savedPurchase.purchaseDate;
      vehicle.status =
        savedPurchase.status === PurchaseStatus.CANCELLED
          ? VehicleStatus.INSPECTION
          : VehicleStatus.AVAILABLE;
      await this.vehicleRepository.save(vehicle);
    }

    return this.findOne(savedPurchase.id);
  }

  /**
   * Elimina una compra solo si no tiene documentos asociados.
   */
  async remove(id: number): Promise<{ deleted: true }> {
    const purchase = await this.findOne(id);

    const relatedDocuments = await this.documentRepository.count({
      where: { purchaseId: id },
    });

    if (relatedDocuments > 0) {
      throw new BadRequestException(
        'No se puede eliminar la compra porque tiene documentos asociados',
      );
    }

    await this.purchaseRepository.remove(purchase);
    return { deleted: true };
  }
}
