import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  Vehicle,
  VehicleEntryType,
  VehicleStatus,
} from './entities/vehicle.entity';
import { PreSaleStatus } from '../pre-sale/entities/pre-sale-status.enum';
import { VehicleSaleOptionDto } from './dto/vehicle-sale-option.dto';
import { VehicleDetailDto } from './dto/vehicle-detail.dto';
import { PurchaseStatus } from '../purchase/entities/purchase.entity';
import { ConsignmentStatus } from '../consignment/entities/consignment.entity';
import { SaleStatus } from '../sales/entities/sale.entity';
import { VehicleImage } from '../vehicle-images/entities/vehicle-image.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  private static readonly SALE_ELIGIBLE_STATUSES = [VehicleStatus.AVAILABLE];

  private hasInventoryAcquisition(vehicle: Vehicle): boolean {
    const hasPurchase = vehicle.purchases?.some(
      (purchase) => purchase.status !== PurchaseStatus.CANCELLED,
    );
    const hasConsignment = vehicle.consignments?.some(
      (consignment) =>
        consignment.status !== ConsignmentStatus.CANCELLED &&
        consignment.status !== ConsignmentStatus.RETURNED,
    );
    const hasTradeIn = vehicle.tradeIns?.some(
      (tradeIn) => tradeIn.sale?.status !== SaleStatus.CANCELLED,
    );

    return Boolean(hasPurchase || hasConsignment || hasTradeIn);
  }

  private async getVehicleEntityById(
    id: number,
    relations?: string[],
  ): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations,
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }

    return vehicle;
  }

  private mapToVehicleDetail(vehicle: Vehicle): VehicleDetailDto {
    const purchaseDate =
      vehicle.purchases?.[0]?.purchaseDate instanceof Date
        ? vehicle.purchases[0].purchaseDate.toISOString()
        : vehicle.purchases?.[0]?.purchaseDate
          ? new Date(vehicle.purchases[0].purchaseDate).toISOString()
          : null;

    return {
      id: vehicle.id,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      vehiclePlate: vehicle.vehiclePlate,
      year: vehicle.year,
      color: vehicle.color,
      price: Number(vehicle.price),
      acquisitionPrice:
        vehicle.acquisitionPrice !== null &&
        vehicle.acquisitionPrice !== undefined
          ? Number(vehicle.acquisitionPrice)
          : null,
      mileage: vehicle.mileage ?? null,
      technicalSpecifications: vehicle.technicalSpecifications ?? null,
      purchaseDate,
      status: vehicle.status,
      entryType: vehicle.entryType,
      ownerClientId: vehicle.ownerClientId ?? null,
      images: this.sortVehicleImages(vehicle.images).map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        isCover: image.isCover,
        order: image.order,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
      })),
    };
  }

  private sortVehicleImages(images?: VehicleImage[]): VehicleImage[] {
    return [...(images ?? [])].sort((a, b) => a.order - b.order || a.id - b.id);
  }

  private mapToVehicleSaleOption(vehicle: Vehicle): VehicleSaleOptionDto {
    return {
      id: vehicle.id,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehiclePlate: vehicle.vehiclePlate,
      price: Number(vehicle.price),
      mileage: vehicle.mileage ?? null,
      technicalSpecifications: vehicle.technicalSpecifications ?? null,
      status: vehicle.status,
      entryType: vehicle.entryType,
      ownerClientId: vehicle.ownerClientId ?? null,
      aquisitionPrice: vehicle.acquisitionPrice,
    };
  }

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      status: createVehicleDto.status ?? VehicleStatus.PENDING_INSPECTION,
      entryType: createVehicleDto.entryType ?? VehicleEntryType.DIRECT_PURCHASE,
      ownerClientId: createVehicleDto.ownerClientId ?? null,
    } as any);
    return this.vehiclesRepository.save(vehicle);
  }

  async findAll() {
    const vehicles = await this.vehiclesRepository.find({
      relations: [
        'purchases',
        'consignments',
        'tradeIns',
        'tradeIns.sale',
        'images',
      ],
      order: { id: 'DESC' },
    });

    return vehicles
      .filter((vehicle) => this.hasInventoryAcquisition(vehicle))
      .map(({ purchases, consignments, tradeIns, ...vehicle }) => ({
        ...vehicle,
        images: this.sortVehicleImages(vehicle.images),
      }));
  }

  async findOne(id: number): Promise<VehicleDetailDto> {
    const vehicle = await this.getVehicleEntityById(id, ['purchases', 'images']);
    return this.mapToVehicleDetail(vehicle);
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.getVehicleEntityById(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: number) {
    const vehicle = await this.getVehicleEntityById(id);
    await this.vehiclesRepository.remove(vehicle);
    return { deleted: true };
  }

  async changeStatus(id: number, status: VehicleStatus) {
    const vehicle = await this.getVehicleEntityById(id);
    vehicle.status = status;
    return this.vehiclesRepository.save(vehicle);
  }

  async getVehicleForSale(): Promise<VehicleSaleOptionDto[]> {
    const vehicles = await this.vehiclesRepository.find({
      where: {
        status: In(VehiclesService.SALE_ELIGIBLE_STATUSES),
      },
    });

    return vehicles.map((vehicle) => this.mapToVehicleSaleOption(vehicle));
  }

  async getVehiclesAvailableForPurchase(): Promise<VehicleSaleOptionDto[]> {
    const vehicles = await this.vehiclesRepository.find({
      relations: ['purchases'],
      order: { id: 'DESC' },
    });

    return vehicles
      .filter((vehicle) => !vehicle.purchases?.length)
      .map((vehicle) => this.mapToVehicleSaleOption(vehicle));
  }

  async getPendingInspectionVehicles() {
    return this.vehiclesRepository.find({
      where: {
        status: VehicleStatus.PENDING_INSPECTION,
      },
    });
  }

  async checkPreSaleCompletion(vehicleId: number) {
    const vehicle = await this.getVehicleEntityById(vehicleId, [
      'preSaleAesthetic',
      'preSaleDocumentation',
      'preSaleMechanical',
    ]);
    const allCompleted =
      vehicle?.preSaleAesthetic?.status === PreSaleStatus.COMPLETED &&
      vehicle?.preSaleDocumentation?.status === PreSaleStatus.COMPLETED &&
      vehicle?.preSaleMechanical?.status === PreSaleStatus.COMPLETED;

    if (allCompleted) {
      vehicle.status = VehicleStatus.AVAILABLE;
      await this.vehiclesRepository.save(vehicle);
    }
    return allCompleted;
  }
}
