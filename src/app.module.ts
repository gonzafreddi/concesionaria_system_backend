import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleRequestModule } from './vehicle_request/vehicle_request.module';
import { QuotesModule } from './quotes/quotes.module';
import { SalesModule } from './sales/sales.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [VehicleRequestModule, QuotesModule, SalesModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
