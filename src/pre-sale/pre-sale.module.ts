import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreSaleService } from './pre-sale.service';
import { PreSaleController } from './pre-sale.controller';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { PreSaleMechanicalController } from './pre-sale-mechanical.controller';
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { PreSaleBodyworkController } from './pre-sale-bodywork.controller';
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { PreSaleDocumentationController } from './pre-sale-documentation.controller';
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { PreSaleAestheticController } from './pre-sale-aesthetic.controller';
import { PreSaleDocumentation } from './entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from './entities/pre_sale_mechanical.entity';
import { PreSaleAesthetic } from './entities/pre_sale_aesthetic.entity';
import { PreSaleBodywork } from './entities/pre_sale_bodywork.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PreSaleMechanical,
      PreSaleAesthetic,
      PreSaleDocumentation,
      PreSaleBodywork,
      Vehicle,
    ]),
    VehiclesModule,
  ],
  controllers: [
    PreSaleController,
    PreSaleMechanicalController,
    PreSaleBodyworkController,
    PreSaleDocumentationController,
    PreSaleAestheticController,
  ],
  providers: [
    PreSaleService,
    PreSaleMechanicalService,
    PreSaleBodyworkService,
    PreSaleDocumentationService,
    PreSaleAestheticService,
  ],
})
export class PreSaleModule {}
