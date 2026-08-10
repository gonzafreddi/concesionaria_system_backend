import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencySettingsController } from './agency-settings.controller';
import { AgencySettingsService } from './agency-settings.service';
import { AgencySetting } from './entities/agency-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgencySetting])],
  controllers: [AgencySettingsController],
  providers: [AgencySettingsService],
  exports: [AgencySettingsService],
})
export class AgencySettingsModule {}
