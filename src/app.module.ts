import { Module } from '@nestjs/common';
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
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'concesionaria',
      synchronize: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
