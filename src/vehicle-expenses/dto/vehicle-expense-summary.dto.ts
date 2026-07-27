import { ApiProperty } from '@nestjs/swagger';

export class VehicleExpenseSummaryDto {
  @ApiProperty({ example: 12 })
  vehicleId: number;

  @ApiProperty({ example: 10000000 })
  acquisitionPrice: number;

  @ApiProperty({ example: 850000 })
  expensesTotal: number;

  @ApiProperty({ example: 10850000 })
  totalCost: number;

  @ApiProperty({ example: 12500000 })
  salePrice: number;

  @ApiProperty({ example: 1650000 })
  estimatedProfit: number;
}
