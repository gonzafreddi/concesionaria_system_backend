import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgencySettingsService } from './agency-settings.service';
import { UpdateAgencySettingDto } from './dto/update-agency-setting.dto';
import { AgencySetting } from './entities/agency-setting.entity';

@ApiTags('agency-settings')
@Controller('agency-settings')
export class AgencySettingsController {
  constructor(private readonly agencySettingsService: AgencySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuracion de agencia/concesionaria' })
  @ApiResponse({ status: 200, type: AgencySetting })
  findOne(): Promise<AgencySetting> {
    return this.agencySettingsService.findOne();
  }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar configuracion de agencia/concesionaria',
  })
  @ApiBody({ type: UpdateAgencySettingDto })
  @ApiResponse({ status: 200, type: AgencySetting })
  update(
    @Body() updateAgencySettingDto: UpdateAgencySettingDto,
  ): Promise<AgencySetting> {
    return this.agencySettingsService.update(updateAgencySettingDto);
  }
}
