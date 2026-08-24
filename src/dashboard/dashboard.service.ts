import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import {
  Consignment,
  ConsignmentStatus,
} from '../consignment/entities/consignment.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { PreSaleStatus } from '../pre-sale/entities/pre-sale-status.enum';
import { PreSaleAesthetic } from '../pre-sale/entities/pre_sale_aesthetic.entity';
import { PreSaleBodywork } from '../pre-sale/entities/pre_sale_bodywork.entity';
import { PreSaleDocumentation } from '../pre-sale/entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from '../pre-sale/entities/pre_sale_mechanical.entity';
import {
  Sale,
  SaleStatus,
  TransferStatus,
} from '../sales/entities/sale.entity';
import {
  VehicleExpense,
  VehicleExpenseStatus,
} from '../vehicle-expenses/entities/vehicle-expense.entity';
import {
  RequestStatus,
  VehicleRequest,
} from '../vehicle_request/entities/vehicle_request.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import {
  DashboardRecentExpenseDto,
  DashboardRecentSaleDto,
  DashboardResponseDto,
  DashboardVehicleMarginDto,
} from './dto/dashboard-response.dto';

type CountItem = { key: string; count: number };

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleExpense)
    private readonly vehicleExpensesRepository: Repository<VehicleExpense>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Inspection)
    private readonly inspectionsRepository: Repository<Inspection>,
    @InjectRepository(Consignment)
    private readonly consignmentsRepository: Repository<Consignment>,
    @InjectRepository(VehicleRequest)
    private readonly vehicleRequestsRepository: Repository<VehicleRequest>,
    @InjectRepository(PreSaleDocumentation)
    private readonly preSaleDocumentationRepository: Repository<PreSaleDocumentation>,
    @InjectRepository(PreSaleMechanical)
    private readonly preSaleMechanicalRepository: Repository<PreSaleMechanical>,
    @InjectRepository(PreSaleAesthetic)
    private readonly preSaleAestheticRepository: Repository<PreSaleAesthetic>,
    @InjectRepository(PreSaleBodywork)
    private readonly preSaleBodyworkRepository: Repository<PreSaleBodywork>,
  ) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const [
      vehicles,
      expenses,
      sales,
      payments,
      clientsTotal,
      inspectionsTotal,
      activeConsignments,
      pendingVehicleRequests,
      pendingDocumentation,
      preSaleDocumentationDrafts,
      preSaleMechanicalDrafts,
      preSaleAestheticDrafts,
      preSaleBodyworkDrafts,
    ] = await Promise.all([
      this.vehiclesRepository.find({ relations: ['expenses'] }),
      this.vehicleExpensesRepository.find({
        relations: ['vehicle'],
        order: { expenseDate: 'DESC', id: 'DESC' },
      }),
      this.salesRepository.find({
        relations: ['client', 'vehicle', 'payments', 'tradeIns'],
        order: { id: 'DESC' },
      }),
      this.paymentsRepository.find(),
      this.clientsRepository.count(),
      this.inspectionsRepository.count(),
      this.consignmentsRepository.count({
        where: [
          { status: ConsignmentStatus.ACTIVE },
          { status: ConsignmentStatus.RESERVED },
        ],
      }),
      this.vehicleRequestsRepository.count({
        where: { status: RequestStatus.OPEN },
      }),
      this.preSaleDocumentationRepository.count({
        where: { status: PreSaleStatus.DRAFT },
      }),
      this.preSaleDocumentationRepository.find({
        where: { status: PreSaleStatus.DRAFT },
        relations: ['vehicle'],
      }),
      this.preSaleMechanicalRepository.find({
        where: { status: PreSaleStatus.DRAFT },
        relations: ['vehicle'],
      }),
      this.preSaleAestheticRepository.find({
        where: { status: PreSaleStatus.DRAFT },
        relations: ['vehicle'],
      }),
      this.preSaleBodyworkRepository.find({
        where: { status: PreSaleStatus.DRAFT },
        relations: ['vehicle'],
      }),
    ]);

    const vehicleMargins = vehicles.map((vehicle) =>
      this.getVehicleMargin(vehicle),
    );
    const availableVehicleMargins = vehicleMargins.filter(
      (vehicle) => String(vehicle.status) === String(VehicleStatus.AVAILABLE),
    );
    const activeExpenses = expenses.filter(
      (expense) =>
        String(expense.status) !== String(VehicleExpenseStatus.CANCELLED),
    );
    const activeSales = sales.filter(
      (sale) => sale.status !== SaleStatus.CANCELLED,
    );
    const confirmedSales = sales.filter(
      (sale) => String(sale.status) === String(SaleStatus.CONFIRMED),
    );
    const salesBalances = activeSales.map((sale) => ({
      sale,
      pendingBalance: this.getSalePendingBalance(sale),
    }));
    const preSaleVehicleIds = new Set<number>();

    for (const item of [
      ...preSaleDocumentationDrafts,
      ...preSaleMechanicalDrafts,
      ...preSaleAestheticDrafts,
      ...preSaleBodyworkDrafts,
    ]) {
      if (item.vehicle?.id) {
        preSaleVehicleIds.add(item.vehicle.id);
      }
    }

    const inventoryValue = this.sumBy(availableVehicleMargins, 'salePrice');
    const inventoryCost = this.sumBy(availableVehicleMargins, 'totalCost');
    const inventoryExpenses = this.sumBy(
      availableVehicleMargins,
      'expensesTotal',
    );
    const inventoryEstimatedProfit = inventoryValue - inventoryCost;
    const pendingBalanceAmount = salesBalances.reduce(
      (total, item) => total + item.pendingBalance,
      0,
    );
    const totalPaidAmount = payments
      .filter((payment) => payment.status === PaymentStatus.CONFIRMED)
      .reduce((total, payment) => total + Number(payment.amount ?? 0), 0);

    return {
      summary: {
        vehiclesTotal: vehicles.length,
        vehiclesAvailable: this.countVehiclesByStatus(
          vehicles,
          VehicleStatus.AVAILABLE,
        ),
        vehiclesReserved: this.countVehiclesByStatus(
          vehicles,
          VehicleStatus.RESERVED,
        ),
        vehiclesSold: this.countVehiclesByStatus(vehicles, VehicleStatus.SOLD),
        clientsTotal,
        salesTotal: sales.length,
        salesConfirmed: confirmedSales.length,
        pendingBalanceAmount,
        stockValue: inventoryValue,
        inventoryValue,
        inventoryCost,
        estimatedInventoryProfit: inventoryEstimatedProfit,
      },
      inventory: {
        byStatus: this.countBy(vehicles, (vehicle) => vehicle.status),
        byEntryType: this.countBy(vehicles, (vehicle) => vehicle.entryType),
        stockValue: inventoryValue,
        availableVehiclesValue: inventoryValue,
        availableVehiclesCost: inventoryCost,
        availableVehiclesExpenses: inventoryExpenses,
        availableVehiclesEstimatedProfit: inventoryEstimatedProfit,
        lowMarginVehicles: availableVehicleMargins
          .sort((a, b) => a.estimatedProfit - b.estimatedProfit)
          .slice(0, 5),
      },
      sales: {
        byStatus: this.countBy(sales, (sale) => sale.status),
        totalAmount: activeSales.reduce(
          (total, sale) => total + Number(sale.finalPrice ?? 0),
          0,
        ),
        confirmedAmount: confirmedSales.reduce(
          (total, sale) => total + Number(sale.finalPrice ?? 0),
          0,
        ),
        paidAmount: totalPaidAmount,
        pendingAmount: pendingBalanceAmount,
        recent: sales.slice(0, 5).map((sale) => this.mapRecentSale(sale)),
      },
      expenses: {
        total: activeExpenses.reduce(
          (total, expense) => total + Number(expense.amount ?? 0),
          0,
        ),
        byType: this.countAmountBy(activeExpenses, (expense) => expense.type),
        byStatus: this.countBy(expenses, (expense) => expense.status),
        recent: expenses
          .slice(0, 5)
          .map((expense) => this.mapRecentExpense(expense)),
        vehiclesWithHighestExpenses: vehicleMargins
          .sort((a, b) => b.expensesTotal - a.expensesTotal)
          .slice(0, 5),
      },
      operations: {
        inspectionsTotal,
        pendingInspections:
          this.countVehiclesByStatus(
            vehicles,
            VehicleStatus.PENDING_INSPECTION,
          ) + this.countVehiclesByStatus(vehicles, VehicleStatus.INSPECTION),
        preSaleInProgress: preSaleVehicleIds.size,
        pendingDocumentation,
        pendingTransfers: sales.filter(
          (sale) =>
            sale.status !== SaleStatus.CANCELLED &&
            sale.transferStatus !== TransferStatus.COMPLETED,
        ).length,
        activeConsignments,
        pendingVehicleRequests,
      },
    };
  }

  private getVehicleMargin(vehicle: Vehicle): DashboardVehicleMarginDto {
    const activeExpenses = (vehicle.expenses ?? []).filter(
      (expense) => expense.status !== VehicleExpenseStatus.CANCELLED,
    );
    const expensesTotal = activeExpenses.reduce(
      (total, expense) => total + Number(expense.amount ?? 0),
      0,
    );
    const acquisitionPrice = Number(vehicle.acquisitionPrice ?? 0);
    const totalCost = acquisitionPrice + expensesTotal;
    const listedSalePrice = Number(vehicle.price ?? 0);
    const salePrice = listedSalePrice > 0 ? listedSalePrice : totalCost;

    return {
      id: vehicle.id,
      label: this.getVehicleLabel(vehicle),
      status: vehicle.status,
      salePrice,
      acquisitionPrice,
      expensesTotal,
      totalCost,
      estimatedProfit: salePrice - totalCost,
    };
  }

  private mapRecentSale(sale: Sale): DashboardRecentSaleDto {
    return {
      id: sale.id,
      status: sale.status,
      finalPrice: Number(sale.finalPrice ?? 0),
      totalPaid: Number(sale.totalPaid ?? 0),
      pendingBalance: this.getSalePendingBalance(sale),
      clientName: sale.client
        ? `${sale.client.firstName} ${sale.client.lastName}`.trim()
        : null,
      vehicleLabel: sale.vehicle ? this.getVehicleLabel(sale.vehicle) : null,
      saleDate: this.toIsoString(sale.saleDate ?? null),
    };
  }

  private mapRecentExpense(expense: VehicleExpense): DashboardRecentExpenseDto {
    return {
      id: expense.id,
      vehicleId: expense.vehicleId,
      type: expense.type,
      status: expense.status,
      description: expense.description,
      amount: Number(expense.amount ?? 0),
      vehicleLabel: expense.vehicle
        ? this.getVehicleLabel(expense.vehicle)
        : null,
      expenseDate: this.toIsoString(expense.expenseDate) ?? '',
    };
  }

  private getSalePendingBalance(sale: Sale): number {
    if (sale.status === SaleStatus.CANCELLED) {
      return 0;
    }

    const tradeInsTotal = (sale.tradeIns ?? []).reduce(
      (total, tradeIn) => total + Number(tradeIn.tradeInValue ?? 0),
      0,
    );
    const confirmedPaymentsTotal = (sale.payments ?? [])
      .filter((payment) => payment.status === PaymentStatus.CONFIRMED)
      .reduce((total, payment) => total + Number(payment.amount ?? 0), 0);

    return Math.max(
      Number(sale.finalPrice ?? 0) - tradeInsTotal - confirmedPaymentsTotal,
      0,
    );
  }

  private getVehicleLabel(vehicle: Vehicle): string {
    return [vehicle.brand, vehicle.model, vehicle.vehiclePlate]
      .filter(Boolean)
      .join(' ');
  }

  private countVehiclesByStatus(
    vehicles: Vehicle[],
    status: VehicleStatus,
  ): number {
    return vehicles.filter((vehicle) => vehicle.status === status).length;
  }

  private countBy<T>(items: T[], getKey: (item: T) => string): CountItem[] {
    const counts = new Map<string, number>();

    for (const item of items) {
      const key = getKey(item);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()].map(([key, count]) => ({ key, count }));
  }

  private countAmountBy<T>(
    items: T[],
    getKey: (item: T) => string,
  ): Array<CountItem & { amount: number }> {
    const counts = new Map<string, { count: number; amount: number }>();

    for (const item of items) {
      const key = getKey(item);
      const current = counts.get(key) ?? { count: 0, amount: 0 };
      counts.set(key, {
        count: current.count + 1,
        amount:
          current.amount + Number((item as { amount?: number }).amount ?? 0),
      });
    }

    return [...counts.entries()].map(([key, value]) => ({
      key,
      count: value.count,
      amount: value.amount,
    }));
  }

  private sumBy<T>(items: T[], field: keyof T): number {
    return items.reduce((total, item) => total + Number(item[field] ?? 0), 0);
  }

  private toIsoString(date: Date | string | null): string | null {
    if (!date) {
      return null;
    }

    return date instanceof Date
      ? date.toISOString()
      : new Date(date).toISOString();
  }
}
