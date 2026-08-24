import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricCountDto {
  @ApiProperty({ example: 'AVAILABLE' })
  key: string;

  @ApiProperty({ example: 12 })
  count: number;
}

export class DashboardRecentSaleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CONFIRMED' })
  status: string;

  @ApiProperty({ example: 18500000 })
  finalPrice: number;

  @ApiProperty({ example: 10000000 })
  totalPaid: number;

  @ApiProperty({ example: 8500000 })
  pendingBalance: number;

  @ApiProperty({ example: 'Juan Perez', nullable: true })
  clientName: string | null;

  @ApiProperty({ example: 'Ford Focus AA123BB', nullable: true })
  vehicleLabel: string | null;

  @ApiProperty({ example: '2026-07-26T15:30:00.000Z', nullable: true })
  saleDate: string | null;
}

export class DashboardRecentExpenseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 7 })
  vehicleId: number;

  @ApiProperty({ example: 'MECHANICAL' })
  type: string;

  @ApiProperty({ example: 'PAID' })
  status: string;

  @ApiProperty({ example: 'Cambio de aceite y filtros' })
  description: string;

  @ApiProperty({ example: 150000 })
  amount: number;

  @ApiProperty({ example: 'Ford Focus AA123BB', nullable: true })
  vehicleLabel: string | null;

  @ApiProperty({ example: '2026-07-26T15:30:00.000Z' })
  expenseDate: string;
}

export class DashboardVehicleMarginDto {
  @ApiProperty({ example: 7 })
  id: number;

  @ApiProperty({ example: 'Ford Focus AA123BB' })
  label: string;

  @ApiProperty({ example: 'AVAILABLE' })
  status: string;

  @ApiProperty({ example: 12500000 })
  salePrice: number;

  @ApiProperty({ example: 10000000 })
  acquisitionPrice: number;

  @ApiProperty({ example: 850000 })
  expensesTotal: number;

  @ApiProperty({ example: 10850000 })
  totalCost: number;

  @ApiProperty({ example: 1650000 })
  estimatedProfit: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: 24 })
  vehiclesTotal: number;

  @ApiProperty({ example: 12 })
  vehiclesAvailable: number;

  @ApiProperty({ example: 3 })
  vehiclesReserved: number;

  @ApiProperty({ example: 9 })
  vehiclesSold: number;

  @ApiProperty({ example: 45 })
  clientsTotal: number;

  @ApiProperty({ example: 18 })
  salesTotal: number;

  @ApiProperty({ example: 14 })
  salesConfirmed: number;

  @ApiProperty({ example: 8500000 })
  pendingBalanceAmount: number;

  @ApiProperty({
    example: 12500000,
    description: 'Valor total del stock disponible',
  })
  stockValue: number;

  @ApiProperty({
    example: 12500000,
    description: 'Alias historico del valor total del stock disponible',
  })
  inventoryValue: number;

  @ApiProperty({ example: 10500000 })
  inventoryCost: number;

  @ApiProperty({ example: 2000000 })
  estimatedInventoryProfit: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;

  @ApiProperty({ type: Object })
  inventory: Record<string, unknown>;

  @ApiProperty({ type: Object })
  sales: Record<string, unknown>;

  @ApiProperty({ type: Object })
  expenses: Record<string, unknown>;

  @ApiProperty({ type: Object })
  operations: Record<string, number>;
}
