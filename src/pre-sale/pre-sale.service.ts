import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePreSaleDto } from './dto/create-pre-sale.dto';
import { UpdatePreSaleDto } from './dto/update-pre-sale.dto';
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
@Injectable()
export class PreSaleService {
  constructor(
    private readonly bodyworkService: PreSaleBodyworkService,
    private readonly aestheticService: PreSaleAestheticService,
    private readonly documentationService: PreSaleDocumentationService,
    private readonly mechanicalService: PreSaleMechanicalService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  create(createPreSaleDto: CreatePreSaleDto) {
    return 'This action adds a new preSale';
  }

  findAll() {
    return `This action returns all preSale`;
  }

  findOne(id: number) {
    return `This action returns a #${id} preSale`;
  }

  update(id: number, updatePreSaleDto: UpdatePreSaleDto) {
    return `This action updates a #${id} preSale`;
  }

  remove(id: number) {
    return `This action removes a #${id} preSale`;
  }

  async verifyCompletion(id: number) {
    const vehicle = await this.vehiclesService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found`);
    }

    const bodywork = this.bodyworkService.isCompleted(id);
    const aesthetic = this.aestheticService.isCompleted(id);
    const documentation = this.documentationService.isCompleted(id);
    const mechanical = this.mechanicalService.isCompleted(id);

    return Promise.all([bodywork, aesthetic, documentation, mechanical]).then(
      (results) => results.every((completed) => completed),
    );
  }
}
