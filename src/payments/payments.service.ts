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
  ) {}

  /**
   * CREAR PAGO - Registra un nuevo pago para una venta
   *
   * Validaciones:
   * - La venta debe existir
   * - La venta no debe estar cerrada (status SOLD o DELIVERED)
   * - El monto debe ser positivo
   *
   * El pago se crea con status PENDING.
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { saleId, amount, method, notes } = createPaymentDto;

    // Validar que la venta existe
    const sale = await this.saleRepository.findOne({ where: { id: saleId } });
    if (!sale) {
      throw new NotFoundException(`Venta ${saleId} no encontrada`);
    }

    // Validar que la venta no esté cerrada
    if (
      sale.status === SaleStatus.SOLD ||
      sale.status === SaleStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'No se pueden agregar pagos a una venta cerrada',
      );
    }
    //Si la venta esta en DRAFT, se cambia a RESERVED al agregar un pago

    // Validar monto positivo
    if (amount <= 0) {
      throw new BadRequestException('El monto del pago debe ser mayor a 0');
    }

    // Crear el pago
    const payment = this.paymentRepository.create({
      sale,
      amount,
      method,
      notes: notes || null,
      status: PaymentStatus.PENDING,
    });

    return await this.paymentRepository.save(payment);
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

      // Confirmar el pago
      payment.status = PaymentStatus.CONFIRMED;
      payment.paidAt = new Date();

      // Recalcular totalPaid de la venta
      const sale = payment.sale;
      await this.recalculateSaleTotalPaid(sale, queryRunner);

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
   * También recalcula el estado de la venta basado en el progreso del pago.
   */
  private async recalculateSaleTotalPaid(
    sale: Sale,
    queryRunner: QueryRunner,
  ): Promise<void> {
    // Obtener todos los pagos confirmados de la venta
    const confirmedPayments = await queryRunner.manager.find(Payment, {
      where: { sale: { id: sale.id }, status: PaymentStatus.CONFIRMED },
    });

    // Calcular nuevo totalPaid
    sale.totalPaid = confirmedPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );

    // Recalcular estado de la venta
    if (sale.totalPaid >= sale.finalPrice) {
      if (
        sale.status === SaleStatus.DRAFT ||
        sale.status === SaleStatus.RESERVED
      ) {
        sale.status = SaleStatus.SOLD;
      }
    } else if (sale.totalPaid > 0 && sale.status === SaleStatus.DRAFT) {
      sale.status = SaleStatus.RESERVED;
    }
  }
}
