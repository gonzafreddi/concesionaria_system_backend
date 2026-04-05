import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import { SaleBalanceCalculatorService } from '../sales/sale-balance-calculator.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

/**
 * PAYMENTS SERVICE - Gestión de pagos
 *
 * Maneja la creación, consulta y actualización de pagos asociados a ventas.
 * Asegura la integridad de los datos y actualiza automáticamente el estado de las ventas.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly dataSource: DataSource,
    private readonly saleBalanceCalculatorService: SaleBalanceCalculatorService,
  ) {}

  /**
   * CREAR PAGO - Registra un nuevo pago para una venta
   *
   * Validaciones:
   * - La venta debe existir
   * - La venta no debe estar cancelada ni confirmada
   * - El monto debe ser positivo
   *
   * El pago respeta el status recibido; si no se envía, inicia PENDING.
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { saleId, amount, method, notes, currency, status } =
      createPaymentDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id: saleId },
        relations: ['tradeIns', 'payments'],
      });
      if (!sale) {
        throw new NotFoundException(`Venta ${saleId} no encontrada`);
      }

      if (
        sale.status === SaleStatus.CONFIRMED ||
        sale.status === SaleStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'No se pueden agregar pagos a una venta cerrada',
        );
      }

      if (amount <= 0) {
        throw new BadRequestException('El monto del pago debe ser mayor a 0');
      }

      const resolvedStatus = status ?? PaymentStatus.PENDING;
      const balance = this.saleBalanceCalculatorService.calculate({
        finalPrice: Number(sale.finalPrice ?? 0),
        tradeInValues: Array.isArray(sale.tradeIns)
          ? sale.tradeIns.map((tradeIn) => Number(tradeIn.tradeInValue ?? 0))
          : [],
        paymentValues: Array.isArray(sale.payments)
          ? sale.payments
              .filter((payment) => payment.status === PaymentStatus.CONFIRMED)
              .map((payment) => Number(payment.amount ?? 0))
          : [],
      });

      if (balance.pendingBalance <= 0) {
        sale.status = SaleStatus.CONFIRMED;
        await queryRunner.manager.save(sale);
        throw new BadRequestException('La venta ya no tiene saldo pendiente');
      }

      const nextCoveredAmount =
        balance.tradeInsTotal +
        balance.paymentsTotal +
        (resolvedStatus === PaymentStatus.CONFIRMED ? Number(amount) : 0);

      if (nextCoveredAmount > Number(sale.finalPrice)) {
        throw new BadRequestException(
          'El monto del pago excede el saldo pendiente',
        );
      }

      const payment = queryRunner.manager.create(Payment, {
        sale,
        amount,
        method,
        notes: notes || null,
        status: resolvedStatus,
        currency,
        paidAt: resolvedStatus === PaymentStatus.CONFIRMED ? new Date() : null,
      });
      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
      return this.getPaymentById(payment.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * OBTENER PAGOS POR VENTA - Lista todos los pagos de una venta específica
   */
  async getPaymentsBySale(saleId: number): Promise<Payment[]> {
    // Validar que la venta existe
    const sale = await this.saleRepository.findOne({ where: { id: saleId } });
    if (!sale) {
      throw new NotFoundException(`Venta ${saleId} no encontrada`);
    }

    return await this.paymentRepository.find({
      where: { sale: { id: saleId } },
      relations: ['sale'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * OBTENER PAGO POR ID - Obtiene un pago específico
   */
  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['sale'],
    });

    if (!payment) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }

    return payment;
  }

  /**
   * CONFIRMAR PAGO - Cambia el estado del pago a CONFIRMED
   *
   * Actualiza paidAt y recalcula el total pagado de la venta.
   * Solo se permite si el pago está en PENDING.
   */
  async confirmPayment(id: number): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id },
        relations: ['sale'],
      });

      if (!payment) {
        throw new NotFoundException(`Pago ${id} no encontrado`);
      }

      // Validar que no esté ya confirmado
      if (payment.status === PaymentStatus.CONFIRMED) {
        throw new BadRequestException('El pago ya está confirmado');
      }

      // Validar que no esté rechazado
      if (payment.status === PaymentStatus.REJECTED) {
        throw new BadRequestException(
          'No se puede confirmar un pago rechazado',
        );
      }

      const sale = payment.sale;

      if (sale.status === SaleStatus.CONFIRMED) {
        throw new BadRequestException(
          'No se pueden confirmar pagos de una venta cerrada',
        );
      }

      const saleWithTradeIns = await queryRunner.manager.findOne(Sale, {
        where: { id: sale.id },
        relations: ['tradeIns'],
      });

      if (!saleWithTradeIns) {
        throw new NotFoundException(`Venta ${sale.id} no encontrada`);
      }

      const tradeInsTotal =
        saleWithTradeIns.tradeIns?.reduce(
          (total, tradeIn) => total + Number(tradeIn.tradeInValue ?? 0),
          0,
        ) ?? 0;
      const nextCoveredAmount =
        Number(sale.totalPaid ?? 0) +
        tradeInsTotal +
        Number(payment.amount ?? 0);

      // Evita confirmar pagos pendientes que excedan el saldo real restante.
      if (nextCoveredAmount > Number(sale.finalPrice ?? 0)) {
        throw new BadRequestException(
          'El pago excede el saldo pendiente de la venta',
        );
      }

      // Confirmar el pago
      payment.status = PaymentStatus.CONFIRMED;
      payment.paidAt = new Date();

      // Recalcular totalPaid de la venta
      await this.recalculateSaleTotalPaid(sale, queryRunner);
      // Reflejar inmediatamente si el vehículo pasa de reservado a vendido.
      await this.syncVehicleStatusWithSale(sale, queryRunner);

      await queryRunner.manager.save(payment);
      await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * RECHAZAR PAGO - Cambia el estado del pago a REJECTED
   *
   * Solo se permite si el pago está en PENDING.
   * Si estaba confirmado, resta del total pagado de la venta.
   */
  async rejectPayment(id: number): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id },
        relations: ['sale'],
      });

      if (!payment) {
        throw new NotFoundException(`Pago ${id} no encontrado`);
      }

      // Validar que no esté ya rechazado
      if (payment.status === PaymentStatus.REJECTED) {
        throw new BadRequestException('El pago ya está rechazado');
      }

      const wasConfirmed = payment.status === PaymentStatus.CONFIRMED;

      // Rechazar el pago
      payment.status = PaymentStatus.REJECTED;

      // Si estaba confirmado, recalcular totalPaid
      if (wasConfirmed) {
        const sale = payment.sale;
        await this.recalculateSaleTotalPaid(sale, queryRunner);
        // Si se rechaza un pago confirmado, el vehículo vuelve al estado coherente.
        await this.syncVehicleStatusWithSale(sale, queryRunner);
        await queryRunner.manager.save(sale);
      }

      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ELIMINAR PAGO - Elimina un pago solo si no está confirmado
   */
  async deletePayment(id: number): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['sale'],
    });

    if (!payment) {
      throw new NotFoundException(`Pago ${id} no encontrado`);
    }

    // No permitir eliminar pagos confirmados
    if (payment.status === PaymentStatus.CONFIRMED) {
      throw new BadRequestException('No se puede eliminar un pago confirmado');
    }

    await this.paymentRepository.delete(id);
  }

  /**
   * RECALCULAR TOTAL PAGADO DE VENTA - Método auxiliar
   *
   * Suma todos los pagos CONFIRMED de la venta y actualiza el totalPaid.
   * También recalcula el estado financiero de la venta.
   */
  private async recalculateSaleTotalPaid(
    sale: Sale,
    queryRunner: QueryRunner,
  ): Promise<void> {
    // Obtener todos los pagos confirmados de la venta
    const confirmedPayments = await queryRunner.manager.find(Payment, {
      where: { sale: { id: sale.id }, status: PaymentStatus.CONFIRMED },
    });
    const validPayments = await queryRunner.manager.find(Payment, {
      where: { sale: { id: sale.id } },
    });

    // Calcular nuevo totalPaid
    sale.totalPaid = confirmedPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );

    if (sale.status === SaleStatus.CANCELLED) {
      return;
    }

    const saleWithTradeIns = await queryRunner.manager.findOne(Sale, {
      where: { id: sale.id },
      relations: ['tradeIns'],
    });

    const tradeInValues =
      saleWithTradeIns?.tradeIns?.map((tradeIn) =>
        Number(tradeIn.tradeInValue ?? 0),
      ) ?? [];

    const balance = this.saleBalanceCalculatorService.calculate({
      finalPrice: Number(sale.finalPrice ?? 0),
      tradeInValues,
      paymentValues: [Number(sale.totalPaid ?? 0)],
    });
    const coveredAmount = balance.tradeInsTotal + balance.paymentsTotal;
    const hasValidPayments = validPayments.some(
      (payment) => payment.status !== PaymentStatus.REJECTED,
    );

    if (coveredAmount <= 0 && !hasValidPayments) {
      sale.status = SaleStatus.DRAFT;
      return;
    }

    sale.status =
      balance.pendingBalance <= 0
        ? SaleStatus.CONFIRMED
        : SaleStatus.PARTIALLY_PAID;
  }

  private async syncVehicleStatusWithSale(
    sale: Sale,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const saleWithVehicle = await queryRunner.manager.findOne(Sale, {
      where: { id: sale.id },
      relations: ['vehicle'],
    });

    if (!saleWithVehicle?.vehicle) {
      return;
    }

    // Venta saldada: vehículo vendido. Venta aún abierta: vehículo reservado.
    saleWithVehicle.vehicle.status =
      sale.status === SaleStatus.CONFIRMED
        ? VehicleStatus.SOLD
        : VehicleStatus.RESERVED;
    sale.vehicle = saleWithVehicle.vehicle;

    await queryRunner.manager.save(saleWithVehicle.vehicle);
  }
}
