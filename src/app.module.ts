import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleRequestModule } from './vehicle_request/vehicle_request.module';
import { QuotesModule } from './quotes/quotes.module';
import { SalesModule } from './sales/sales.module';
import { PaymentsModule } from './payments/payments.module';
import { ClientsModule } from './clients/clients.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import 'dotenv/config';
// import { VehicleAcquisitionTypes } from './vehicles/entities/vehicle_acquisition_types';
import { InspectionsModule } from './inspections/inspections.module';
import { AuthModule } from './auth/auth.module';
import { PreSaleModule } from './pre-sale/pre-sale.module';
import { DocumentsModule } from './documents/documents.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ConsignmentModule } from './consignment/consignment.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { VehicleImagesModule } from './vehicle-images/vehicle-images.module';
import {
  getDatabaseConfig,
  shouldSynchronizeSchema,
} from './config/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...getDatabaseConfig(),
      synchronize: shouldSynchronizeSchema(),
      autoLoadEntities: true,
    }),
    VehicleRequestModule,
    QuotesModule,
    SalesModule,
    PaymentsModule,
    ClientsModule,
    UsersModule,
    VehiclesModule,
    // VehicleAcquisitionTypes,
    InspectionsModule,
    AuthModule,
    PreSaleModule,
    DocumentsModule,
    PurchaseModule,
    ConsignmentModule,
    CloudinaryModule,
    VehicleImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
