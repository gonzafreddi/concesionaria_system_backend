import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinanceSummaryQueryDto } from './dto/finance-summary-query.dto';
import { FinanceService } from './finance.service';

@ApiTags('finance')
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
