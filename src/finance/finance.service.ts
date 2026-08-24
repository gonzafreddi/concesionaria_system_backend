import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from '../expenses/entities/expense.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Purchase, PurchaseStatus } from '../purchase/entities/purchase.entity';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import {
  VehicleExpense,
  VehicleExpenseStatus,
} from '../vehicle-expenses/entities/vehicle-expense.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { FinanceSummaryQueryDto } from './dto/finance-summary-query.dto';

type DateRange = {
  from: Date | null;
  to: Date | null;
};

type AmountByKey = {
  key: string;
  count: number;
  amount: number;
};

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleExpense)
    private readonly vehicleExpensesRepository: Repository<VehicleExpense>,
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
  ) {}

  async getSummary(query: FinanceSummaryQueryDto) {
    const range = this.getDateRange(query);
    const [payments, sales, vehicles, vehicleExpenses, expenses, purchases] =
      await Promise.all([
        this.paymentsRepository.find(),
        this.salesRepository.find({ relations: ['payments', 'tradeIns'] }),
        this.vehiclesRepository.find({ relations: ['expenses', 'purchases'] }),
        this.vehicleExpensesRepository.find({ relations: ['vehicle'] }),
        this.expensesRepository.find({ relations: ['category'] }),
        this.purchasesRepository.find({ relations: ['vehicle'] }),
      ]);

    const confirmedPayments = payments.filter(
      (payment) =>
        payment.status === PaymentStatus.CONFIRMED &&
        this.isWithinRange(payment.paidAt ?? payment.createdAt, range),
    );
    const activeSales = sales.filter(
      (sale) =>
        sale.status !== SaleStatus.CANCELLED &&
        this.isWithinRange(sale.saleDate ?? sale.createdAt, range),
    );
    const confirmedSales = activeSales.filter(
      (sale) => sale.status === SaleStatus.CONFIRMED,
    );
    const paidGeneralExpenses = expenses.filter(
      (expense) =>
        expense.status === ExpenseStatus.PAID &&
        this.isWithinRange(expense.expenseDate, range),
    );
    const activeGeneralExpenses = expenses.filter(
      (expense) =>
        expense.status !== ExpenseStatus.CANCELLED &&
        this.isWithinRange(expense.expenseDate, range),
    );
    const paidVehicleExpenses = vehicleExpenses.filter(
      (expense) =>
        expense.status === VehicleExpenseStatus.PAID &&
        this.isWithinRange(expense.expenseDate, range),
    );
    const activeVehicleExpenses = vehicleExpenses.filter(
      (expense) =>
        expense.status !== VehicleExpenseStatus.CANCELLED &&
        this.isWithinRange(expense.expenseDate, range),
    );
    const completedPurchases = purchases.filter(
      (purchase) =>
        purchase.status === PurchaseStatus.COMPLETED &&
        this.isWithinRange(purchase.purchaseDate, range),
    );
    const stockVehicles = vehicles.filter(
      (vehicle) => vehicle.status !== VehicleStatus.SOLD,
    );
    const stockVehicleMargins = stockVehicles.map((vehicle) =>
      this.getVehicleStockMetrics(vehicle),
    );
    const stockCapital = stockVehicleMargins.reduce(
      (total, vehicle) => total + vehicle.totalCost,
      0,
    );
    const stockSaleValue = stockVehicleMargins.reduce(
      (total, vehicle) => total + vehicle.salePrice,
      0,
    );
    const incomeTotal = this.sumAmounts(confirmedPayments);
    const paidGeneralExpensesTotal = this.sumAmounts(paidGeneralExpenses);
    const paidVehicleExpensesTotal = this.sumAmounts(paidVehicleExpenses);
    const purchasesTotal = completedPurchases.reduce(
      (total, purchase) => total + Number(purchase.agreedPrice ?? 0),
      0,
    );
    const totalOutflows =
      paidGeneralExpensesTotal + paidVehicleExpensesTotal + purchasesTotal;

    return {
      range: {
        dateFrom: query.dateFrom ?? null,
        dateTo: query.dateTo ?? null,
      },
      cashFlow: {
        incomeTotal,
        outflowTotal: totalOutflows,
        netTotal: incomeTotal - totalOutflows,
        incomeByMethod: this.amountBy(confirmedPayments, (payment) =>
          String(payment.method),
        ),
        outflowBreakdown: {
          generalExpenses: paidGeneralExpensesTotal,
          vehicleExpenses: paidVehicleExpensesTotal,
          purchases: purchasesTotal,
        },
      },
      sales: {
        totalCount: activeSales.length,
        confirmedCount: confirmedSales.length,
        totalAmount: activeSales.reduce(
          (total, sale) => total + Number(sale.finalPrice ?? 0),
          0,
        ),
        confirmedAmount: confirmedSales.reduce(
          (total, sale) => total + Number(sale.finalPrice ?? 0),
          0,
        ),
        paidAmount: incomeTotal,
        pendingAmount: activeSales.reduce(
          (total, sale) => total + this.getSalePendingBalance(sale),
          0,
        ),
      },
      expenses: {
        paidGeneralExpensesTotal,
        activeGeneralExpensesTotal: this.sumAmounts(activeGeneralExpenses),
        paidVehicleExpensesTotal,
        activeVehicleExpensesTotal: this.sumAmounts(activeVehicleExpenses),
        byCategory: this.amountBy(
          activeGeneralExpenses,
          (expense) => expense.category?.name ?? 'Sin categoria',
        ),
        vehicleExpensesByType: this.amountBy(activeVehicleExpenses, (expense) =>
          String(expense.type),
        ),
      },
      purchases: {
        completedCount: completedPurchases.length,
        completedAmount: purchasesTotal,
      },
      inventory: {
        vehiclesTotal: vehicles.length,
        vehiclesInStock: stockVehicles.length,
        vehiclesAvailable: stockVehicles.filter(
          (vehicle) => vehicle.status === VehicleStatus.AVAILABLE,
        ).length,
        capitalInStock: stockCapital,
        stockSaleValue,
        stockVehicleExpenses: stockVehicleMargins.reduce(
          (total, vehicle) => total + vehicle.expensesTotal,
          0,
        ),
        estimatedStockProfit: stockSaleValue - stockCapital,
        byStatus: this.countBy(stockVehicles, (vehicle) => vehicle.status),
      },
    };
  }

  private getVehicleStockMetrics(vehicle: Vehicle) {
    const activeExpenses = (vehicle.expenses ?? []).filter(
      (expense) => expense.status !== VehicleExpenseStatus.CANCELLED,
    );
    const expensesTotal = this.sumAmounts(activeExpenses);
    const purchaseCost = (vehicle.purchases ?? [])
      .filter((purchase) => purchase.status !== PurchaseStatus.CANCELLED)
      .reduce(
        (total, purchase) => total + Number(purchase.agreedPrice ?? 0),
        0,
      );
    const acquisitionPrice = Number(vehicle.acquisitionPrice ?? 0);
    const baseCost = acquisitionPrice > 0 ? acquisitionPrice : purchaseCost;
    const salePrice = Number(vehicle.price ?? 0);

    return {
      id: vehicle.id,
      salePrice,
      acquisitionPrice: baseCost,
      expensesTotal,
      totalCost: baseCost + expensesTotal,
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

  private getDateRange(query: FinanceSummaryQueryDto): DateRange {
    const from = query.dateFrom ? this.parseDate(query.dateFrom) : null;
    const to = query.dateTo ? this.parseDate(query.dateTo) : null;

    if (from && to && from.getTime() > to.getTime()) {
      throw new BadRequestException('dateFrom no puede ser mayor que dateTo');
    }

    return { from, to };
  }

  private parseDate(value: string): Date {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha invalida');
    }

    return parsedDate;
  }

  private isWithinRange(
    date: Date | string | null | undefined,
    range: DateRange,
  ) {
    if (!date) {
      return true;
    }

    const value = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(value.getTime())) {
      return false;
    }

    if (range.from && value.getTime() < range.from.getTime()) {
      return false;
    }

    if (range.to && value.getTime() > range.to.getTime()) {
      return false;
    }

    return true;
  }

  private sumAmounts(
    items: Array<{ amount?: number | string | null }>,
  ): number {
    return items.reduce((total, item) => total + Number(item.amount ?? 0), 0);
  }

  private amountBy<T>(items: T[], getKey: (item: T) => string): AmountByKey[] {
    const totals = new Map<string, AmountByKey>();

    for (const item of items) {
      const key = getKey(item);
      const current = totals.get(key) ?? { key, count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(
        (item as { amount?: number | string }).amount ?? 0,
      );
      totals.set(key, current);
    }

    return [...totals.values()];
  }

  private countBy<T>(items: T[], getKey: (item: T) => string) {
    const totals = new Map<string, number>();

    for (const item of items) {
      const key = getKey(item);
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }

    return [...totals.entries()].map(([key, count]) => ({ key, count }));
  }
}
