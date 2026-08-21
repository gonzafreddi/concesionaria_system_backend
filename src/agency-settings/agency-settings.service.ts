import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAgencySettingDto } from './dto/update-agency-setting.dto';
import { AgencySetting } from './entities/agency-setting.entity';

const AGENCY_SETTINGS_ID = 1;

@Injectable()
export class AgencySettingsService {
  constructor(
    @InjectRepository(AgencySetting)
    private readonly agencySettingsRepository: Repository<AgencySetting>,
  ) {}

  async findOne(): Promise<AgencySetting> {
    const settings = await this.agencySettingsRepository.findOne({
      where: { id: AGENCY_SETTINGS_ID },
    });

    return settings ?? this.createEmptySettings();
  }

  async update(
    updateAgencySettingDto: UpdateAgencySettingDto,
  ): Promise<AgencySetting> {
    const currentSettings = await this.agencySettingsRepository.findOne({
      where: { id: AGENCY_SETTINGS_ID },
    });

    const settings = this.agencySettingsRepository.create({
      ...(currentSettings ?? { id: AGENCY_SETTINGS_ID }),
      ...updateAgencySettingDto,
    });

    return this.agencySettingsRepository.save(settings);
  }

  private createEmptySettings(): AgencySetting {
    return this.agencySettingsRepository.create({
      id: AGENCY_SETTINGS_ID,
      legalName: null,
      tradeName: null,
      taxId: null,
      address: null,
      city: null,
      province: null,
      phone: null,
      email: null,
      representativeName: null,
      representativeDocument: null,
      logoUrl: null,
      taxCondition: null,
      postalCode: null,
      website: null,
      consignmentEarlyTerminationFee: null,
    });
  }
}
