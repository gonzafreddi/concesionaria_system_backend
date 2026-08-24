import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePreSaleDto } from './dto/create-pre-sale.dto';
import { UpdatePreSaleDto } from './dto/update-pre-sale.dto';
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { PreSaleStatus } from './entities/pre-sale-status.enum';
import { PreSaleBodywork } from './entities/pre_sale_bodywork.entity';
import { PreSaleAesthetic } from './entities/pre_sale_aesthetic.entity';
import { PreSaleDocumentation } from './entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from './entities/pre_sale_mechanical.entity';

@Injectable()
export class PreSaleService {
  constructor(
    private readonly bodyworkService: PreSaleBodyworkService,
    private readonly aestheticService: PreSaleAestheticService,
    private readonly documentationService: PreSaleDocumentationService,
    private readonly mechanicalService: PreSaleMechanicalService,
    private readonly vehiclesService: VehiclesService,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(PreSaleBodywork)
    private readonly bodyworkRepository: Repository<PreSaleBodywork>,
    @InjectRepository(PreSaleAesthetic)
    private readonly aestheticRepository: Repository<PreSaleAesthetic>,
    @InjectRepository(PreSaleDocumentation)
    private readonly documentationRepository: Repository<PreSaleDocumentation>,
    @InjectRepository(PreSaleMechanical)
    private readonly mechanicalRepository: Repository<PreSaleMechanical>,
  ) {}

  async create(dto: CreatePreSaleDto) {
    const vehicle = await this.vehiclesRepository.findOneBy({
      id: dto.vehicleId,
    });
    if (!vehicle) throw new NotFoundException('Vehiculo no encontrado');

    if (
      !(await this.bodyworkRepository.findOne({
        where: { vehicle: { id: dto.vehicleId } },
      }))
    ) {
      await this.bodyworkRepository.save(
        this.bodyworkRepository.create({
          vehicle,
          status: PreSaleStatus.DRAFT,
          completed: false,
        }),
      );
    }
    if (
      !(await this.aestheticRepository.findOne({
        where: { vehicle: { id: dto.vehicleId } },
      }))
    ) {
      await this.aestheticRepository.save(
        this.aestheticRepository.create({
          vehicle,
          status: PreSaleStatus.DRAFT,
          completed: false,
        }),
      );
    }
    if (
      !(await this.documentationRepository.findOne({
        where: { vehicle: { id: dto.vehicleId } },
      }))
    ) {
      await this.documentationRepository.save(
        this.documentationRepository.create({
          vehicle,
          status: PreSaleStatus.DRAFT,
          completed: false,
        }),
      );
    }
    if (
      !(await this.mechanicalRepository.findOne({
        where: { vehicle: { id: dto.vehicleId } },
      }))
    ) {
      await this.mechanicalRepository.save(
        this.mechanicalRepository.create({
          vehicle,
          status: PreSaleStatus.DRAFT,
          completed: false,
        }),
      );
    }

    return this.findOne(dto.vehicleId);
  }

  async findAll() {
    const vehicles = await this.vehiclesRepository.find({
      order: { id: 'DESC' },
    });
    return Promise.all(vehicles.map((vehicle) => this.findOne(vehicle.id)));
  }

  async findOne(id: number) {
    const vehicle = await this.vehiclesRepository.findOneBy({ id });
    if (!vehicle) throw new NotFoundException('Vehiculo no encontrado');

    const [bodywork, aesthetic, documentation, mechanical] = await Promise.all([
      this.bodyworkRepository.findOne({ where: { vehicle: { id } } }),
      this.aestheticRepository.findOne({ where: { vehicle: { id } } }),
      this.documentationRepository.findOne({ where: { vehicle: { id } } }),
      this.mechanicalRepository.findOne({ where: { vehicle: { id } } }),
    ]);

    return {
      vehicleId: id,
      completed: [bodywork, aesthetic, documentation, mechanical].every(
        (item) => item?.status === PreSaleStatus.COMPLETED,
      ),
      stages: {
        bodywork: bodywork ?? { status: PreSaleStatus.DRAFT, completed: false },
        aesthetic: aesthetic ?? {
          status: PreSaleStatus.DRAFT,
          completed: false,
        },
        documentation: documentation ?? {
          status: PreSaleStatus.DRAFT,
          completed: false,
        },
        mechanical: mechanical ?? {
          status: PreSaleStatus.DRAFT,
          completed: false,
        },
      },
    };
  }

  async update(id: number, _dto: UpdatePreSaleDto) {
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const bodywork = await this.bodyworkRepository.findOne({
      where: { vehicle: { id } },
    });
    const aesthetic = await this.aestheticRepository.findOne({
      where: { vehicle: { id } },
    });
    const documentation = await this.documentationRepository.findOne({
      where: { vehicle: { id } },
    });
    const mechanical = await this.mechanicalRepository.findOne({
      where: { vehicle: { id } },
    });
    if (bodywork) await this.bodyworkRepository.remove(bodywork);
    if (aesthetic) await this.aestheticRepository.remove(aesthetic);
    if (documentation) await this.documentationRepository.remove(documentation);
    if (mechanical) await this.mechanicalRepository.remove(mechanical);
    return { deleted: true };
  }

  async verifyCompletion(id: number) {
    const summary = await this.findOne(id);
    if (summary.completed)
      await this.vehiclesService.checkPreSaleCompletion(id);
    return summary.completed;
  }
}
