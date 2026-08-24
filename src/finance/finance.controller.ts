import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FinanceSummaryQueryDto } from './dto/finance-summary-query.dto';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Resumen financiero: ingresos, egresos, ventas, stock y capital en stock',
  })
  getSummary(@Query() query: FinanceSummaryQueryDto) {
    return this.financeService.getSummary(query);
  }
}
