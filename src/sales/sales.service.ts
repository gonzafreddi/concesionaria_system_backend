import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CreateTradeInDto } from './dto/create-trade-in.dto';
import { UpdateSaleWorkflowStatusDto } from './dto/update-sale-workflow-status.dto';
import {
  Sale,
  SaleType,
  SaleStatus,
  DocumentationStatus,
  TransferStatus,
} from './entities/sale.entity';
import { TradeIn } from './entities/trade-in.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { SaleAccountBalanceService } from './sale-account-balance.service';
import { SaleBalanceCalculatorService } from './sale-balance-calculator.service';

/**
 * SALES SERVICE - Lógica centralizada
 *
 * Flujo unificado para SALE y PURCHASE usando una única entidad.
 *
 * SALE (Venta):
 *   - Cliente compra vehículo
 *   - Stock disminuye
 *   - Vehicle.status: AVAILABLE → RESERVED → SOLD
 *
 * PURCHASE (Compra):
 *   - Concesionaria compra vehículo a cliente
 *   - Stock aumenta (nuevo vehículo en inventario)
 *   - Vehicle.status: no aplica (es vehículo de entrada)
 *
 * TRANSICIONES DE ESTADO FINANCIERO (validadas automáticamente):
 *   DRAFT → PARTIALLY_PAID: Hay pagos confirmados o trade-ins, pero resta saldo
 *   PARTIALLY_PAID → CONFIRMED: La cuenta quedó cubierta
 *   * → CANCELLED: Cambio manual si la operación se anula
 *
 * NO se permiten cambios de estado desde frontend.
 * El estado financiero se actualiza automáticamente según:
 *   1. Pagos confirmados (totalPaid)
 *   2. Trade-ins agregados (descuentos)
 *   3. Validaciones de negocio
 */

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(TradeIn)
    private tradeInRepository: Repository<TradeIn>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private vehiclesService: VehiclesService,
    private readonly saleAccountBalanceService: SaleAccountBalanceService,
    private readonly saleBalanceCalculatorService: SaleBalanceCalculatorService,
  ) {}

  /**
   * CREATE - Crea nueva operación (SALE o PURCHASE)
   *
   * Inicia en DRAFT.
   * finalPrice representa el total de la operación y los trade-ins se descuentan
   * luego del lado del balance pendiente, sin modificar ese valor base.
   */

  async create(createSaleDto: CreateSaleDto) {
    const {
      clientId,
      vehicleId,
      userId,
      saleDate,
      type,
      tradeIns,
      transferPercentage,
      adminExpenses,
    } = createSaleDto;

    return this.dataSource.transaction(async (manager) => {
      // 🔒 Buscar vehículo principal
      const vehicle = await manager.findOne(Vehicle, {
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);
      }

      let basePrice = Number(createSaleDto.basePrice);

      if (!basePrice || basePrice <= 0) {
        basePrice = Number(vehicle.price);
      }

      if (vehicle.status !== VehicleStatus.AVAILABLE) {
        throw new BadRequestException(
          `El vehículo ${vehicle.vehiclePlate} no está disponible`,
        );
      }

      // 👤 Cliente
      const client = await manager.findOne(Client, {
        where: { id: clientId },
      });
      if (!client) {
        throw new NotFoundException(`Cliente ${clientId} no encontrado`);
      }

      // 👨‍💼 Usuario
      const user = await manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(`Usuario ${userId} no encontrado`);
      }

      // 📅 Fecha
      const parsedDate = saleDate ? new Date(saleDate) : new Date();
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Fecha inválida');
      }

      // 💸 Descuento
      const discount = Number(createSaleDto.discount ?? 0);
      if (discount < 0) {
        throw new BadRequestException('El descuento no puede ser negativo');
      }

      // 🧾 Transferencia
      const parsedTransferPercentage = Number(transferPercentage ?? 0);
      if (parsedTransferPercentage < 0) {
        throw new BadRequestException(
          'El porcentaje de transferencia no puede ser negativo',
        );
      }

      // ⚠️ Se calcula sobre basePrice - discount (más realista)
      const transferAmount =
        ((basePrice - discount) * parsedTransferPercentage) / 100;

      // 🏢 Gastos administrativos
      const parsedAdminExpenses = Number(adminExpenses ?? 0);
      if (parsedAdminExpenses < 0) {
        throw new BadRequestException(
          'Los gastos administrativos no pueden ser negativos',
        );
      }

      // 💰 Precio final
      const finalPrice =
        basePrice - discount + transferAmount + parsedAdminExpenses;

      if (finalPrice <= 0) {
        throw new BadRequestException(
          'El precio final no puede ser menor o igual a 0',
        );
      }

      // totalPaid representa solo pagos monetarios confirmados
      const totalPaid = 0;
      let tradeInVehicle: Vehicle | null = null;

      // 🚘 Trade-in
      if (tradeIns) {
        tradeInVehicle = await manager.findOne(Vehicle, {
          where: { id: tradeIns },
        });

        if (!tradeInVehicle) {
          throw new NotFoundException(
            `Vehículo de trade-in ${tradeIns} no encontrado`,
          );
        }

        const existingTradeIn = await manager.findOne(TradeIn, {
          where: { vehicle: { id: tradeIns } },
          relations: ['sale'],
        });

        if (
          existingTradeIn &&
          existingTradeIn.sale.status !== SaleStatus.CANCELLED
        ) {
          throw new BadRequestException(
            `Vehículo de trade-in ya está en otra operación activa`,
          );
        }

        if (Number(tradeInVehicle.price) > finalPrice) {
          throw new BadRequestException(
            `El valor del vehículo entregado no puede exceder el precio final`,
          );
        }
      }

      // 🧾 Crear venta
      const sale = manager.create(Sale, {
        client,
        vehicle,
        user,
        type: type || SaleType.SALE,
        status: SaleStatus.DRAFT,
        documentationStatus: DocumentationStatus.PENDING,
        basePrice,
        finalPrice,
        totalPaid,
        saleDate: parsedDate,
        discount,
        transferPercentage: parsedTransferPercentage,
        transferAmount,
        adminExpenses: parsedAdminExpenses,
        transferStatus: TransferStatus.NOT_STARTED,
      });

      await manager.save(sale);

      // 🚘 Crear TradeIn
      if (tradeInVehicle) {
        const tradeIn = manager.create(TradeIn, {
          vehicle: tradeInVehicle,
          sale,
          tradeInValue: tradeInVehicle.price,
        });

        await manager.save(tradeIn);
        sale.tradeIns = [tradeIn];
        sale.status = this.calculateSaleStatus(sale);
        await manager.save(sale);

        tradeInVehicle.status = VehicleStatus.INSPECTION;
        await manager.save(tradeInVehicle);
      }

      // 🚗 Reservar vehículo principal
      if (sale.type === SaleType.SALE) {
        vehicle.status = VehicleStatus.RESERVED;
        await manager.save(vehicle);
      }

      return sale;
    });
  }

  /**
   * FIND ALL - Lista todas las operaciones
   */
  async findAll() {
    const sales = await this.salesRepository.find({
      relations: ['client', 'vehicle', 'user', 'quote', 'payments', 'tradeIns'],
      order: { id: 'DESC' },
    });

    return Promise.all(sales.map((sale) => this.mapToResponse(sale)));
  }

  async mapToResponse(sale: Sale) {
    return {
      ...sale,
      pendingBalance: await this.saleAccountBalanceService.getPendingBalance(
        sale.id,
      ),
    };
  }

  /**
   * FIND ONE - Obtiene detalle completo de una operación
   */
  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: [
        'client',
        'vehicle',
        'user',
        'quote',
        'payments',
        'tradeIns',
        'tradeIns.vehicle',
      ],
    });
    if (!sale) throw new NotFoundException(`Operación ${id} no encontrada`);
    const pendingBalance =
      await this.saleAccountBalanceService.getPendingBalance(id);
    return {
      ...sale,
      pendingBalance,
    };
  }

  async getPendingBalance(id: number) {
    // SalesService actúa como orquestador y delega la lógica específica
    return this.saleAccountBalanceService.getPendingBalance(id);
  }

  async updateWorkflowStatus(
    id: number,
    updateSaleWorkflowStatusDto: UpdateSaleWorkflowStatusDto,
  ) {
    const sale = await this.findOne(id);
    const { status, documentationStatus, transferStatus } =
      updateSaleWorkflowStatusDto;

    if (
      status === undefined &&
      documentationStatus === undefined &&
      transferStatus === undefined
    ) {
      throw new BadRequestException(
        'Debe enviar al menos un estado para actualizar',
      );
    }

    if (status !== undefined) {
      if (status !== SaleStatus.CANCELLED) {
        throw new BadRequestException(
          'Solo se permite cambiar manualmente el estado financiero a CANCELLED',
        );
      }

      if (sale.status === SaleStatus.CONFIRMED) {
        throw new BadRequestException(
          'No se puede cancelar una operación ya confirmada',
        );
      }

      sale.status = SaleStatus.CANCELLED;

      if (
        sale.type === SaleType.SALE &&
        sale.vehicle?.status === VehicleStatus.RESERVED
      ) {
        sale.vehicle.status = VehicleStatus.AVAILABLE;
        await this.vehicleRepository.save(sale.vehicle);
      }
    }

    if (documentationStatus !== undefined) {
      sale.documentationStatus = documentationStatus;
    }

    if (transferStatus !== undefined) {
      sale.transferStatus = transferStatus;
    }

    return this.salesRepository.save(sale);
  }

  /**
   * UPDATE - Actualiza solo basePrice si está en DRAFT
   */
  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const sale = await this.findOne(id);

    // Solo permitir cambiar basePrice en DRAFT
    if (updateSaleDto.basePrice !== undefined) {
      if (sale.status !== SaleStatus.DRAFT) {
        throw new BadRequestException(
          'Solo se puede modificar precio en estado DRAFT',
        );
      }
      sale.basePrice = updateSaleDto.basePrice;
      sale.finalPrice = updateSaleDto.basePrice; // Reset finalPrice
    }

    if (updateSaleDto.saleDate !== undefined) {
      sale.saleDate = new Date(updateSaleDto.saleDate);
    }

    return this.salesRepository.save(sale);
  }

  /**
   * DELETE - Elimina solo si está en DRAFT
   */
  async remove(id: number) {
    const sale = await this.findOne(id);
    if (sale.status !== SaleStatus.DRAFT) {
      throw new BadRequestException(
        'Solo se pueden eliminar operaciones en estado DRAFT',
      );
    }
    await this.salesRepository.remove(sale);
    return { deleted: true };
  }

  /**
   * ADD PAYMENT - Registra un nuevo pago y recalcula estado
   *
   * Validaciones:
   * - Sale no debe estar cancelada ni confirmada
   * - Monto no puede ser negativo
   * - pagos confirmados + trade-ins + amount no puede exceder finalPrice
   *
   * El estado financiero no cambia con pagos pendientes.
   */
  async addPayment(createPaymentDto: CreatePaymentDto) {
    const { saleId, amount, method, notes } = createPaymentDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener sale con lock para transacción
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id: saleId },
        relations: ['payments', 'tradeIns'],
      });

      if (!sale)
        throw new NotFoundException(`Operación ${saleId} no encontrada`);

      // No permitir pagos en operaciones cerradas financieramente o canceladas
      if (
        sale.status === SaleStatus.CANCELLED ||
        sale.status === SaleStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          'No se pueden agregar pagos a una operación cerrada',
        );
      }

      if (amount <= 0) {
        throw new BadRequestException('El monto debe ser mayor a 0');
      }

      const tradeInsTotal = this.getTradeInsTotal(sale.tradeIns);

      // No permitir registrar un pago que supere el saldo restante
      if (sale.totalPaid + tradeInsTotal + amount > sale.finalPrice) {
        throw new BadRequestException(
          `Monto excede el precio final. Restante: ${sale.finalPrice - sale.totalPaid - tradeInsTotal}`,
        );
      }

      // Crear payment (inicia PENDING)
      const payment = queryRunner.manager.create(Payment, {
        sale,
        amount,
        method,
        notes: notes || null,
        status: PaymentStatus.PENDING,
      });

      await queryRunner.manager.save(payment);

      const updatedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return { payment, sale: updatedSale };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ADD TRADE-IN - Agrega un vehículo como parte de pago
   *
   * Validaciones:
   * - Vehicle no debe estar en otra SALE activa
   * - tradeInValue no puede exceder finalPrice
   * - Sale no debe estar cancelada ni confirmada
   *
   * Efecto:
   * - Afecta el saldo pendiente
   * - Recalcula estado financiero automáticamente
   */
  async addTradeIn(createTradeInDto: CreateTradeInDto) {
    const { saleId, vehicleId, tradeInValue } = createTradeInDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id: saleId },
        relations: ['tradeIns'],
      });

      if (!sale)
        throw new NotFoundException(`Operación ${saleId} no encontrada`);

      if (
        sale.status === SaleStatus.CANCELLED ||
        sale.status === SaleStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          'No se pueden agregar trade-ins a una operación cerrada',
        );
      }

      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: { id: vehicleId },
      });

      if (!vehicle)
        throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);

      // Validar que no esté en otra SALE activa
      const existingTradeIn = await queryRunner.manager.findOne(TradeIn, {
        where: { vehicle: { id: vehicleId } },
        relations: ['sale'],
      });

      if (
        existingTradeIn &&
        existingTradeIn.sale.id !== saleId &&
        existingTradeIn.sale.status !== SaleStatus.CANCELLED
      ) {
        throw new BadRequestException(
          `Vehículo ya está en trade-in de otra operación activa`,
        );
      }

      const tradeInsTotal = this.getTradeInsTotal(sale.tradeIns);
      if (tradeInValue + tradeInsTotal + sale.totalPaid > sale.finalPrice) {
        throw new BadRequestException(
          `Valuación excede precio final. Máximo: ${sale.finalPrice - sale.totalPaid - tradeInsTotal}`,
        );
      }

      // Crear trade-in
      const tradeIn = queryRunner.manager.create(TradeIn, {
        sale,
        vehicle,
        tradeInValue,
      });

      await queryRunner.manager.save(tradeIn);

      // El finalPrice no cambia; recalculamos solo el estado financiero
      sale.tradeIns = [...sale.tradeIns, tradeIn];
      sale.status = this.calculateSaleStatus(sale);
      vehicle.status = VehicleStatus.INSPECTION;
      await queryRunner.manager.save(vehicle);

      const updatedSale = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return { tradeIn, sale: updatedSale };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * CONFIRM PAYMENT - Cambia estado de pago a CONFIRMED o REJECTED
   *
   * Actualiza totalPaid y recalcula el estado financiero.
   */
  async confirmPayment(paymentId: number, status: PaymentStatus) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id: paymentId },
        relations: ['sale'],
      });

      if (!payment)
        throw new NotFoundException(`Pago ${paymentId} no encontrado`);

      const sale = payment.sale;
      const saleWithTradeIns = await queryRunner.manager.findOne(Sale, {
        where: { id: sale.id },
        relations: ['tradeIns'],
      });
      const wasConfirmed = payment.status === PaymentStatus.CONFIRMED;

      if (!saleWithTradeIns) {
        throw new NotFoundException(`Operación ${sale.id} no encontrada`);
      }

      if (saleWithTradeIns.status === SaleStatus.CANCELLED) {
        throw new BadRequestException(
          'No se puede modificar un pago de una operación cancelada',
        );
      }

      // Aplicar cambio de estado
      if (status === PaymentStatus.CONFIRMED) {
        payment.status = PaymentStatus.CONFIRMED;
        payment.paidAt = new Date();
        saleWithTradeIns.totalPaid += Number(payment.amount);
      } else if (status === PaymentStatus.REJECTED) {
        payment.status = PaymentStatus.REJECTED;
        // Si fue confirmado antes, revertir el totalPaid
        if (wasConfirmed) {
          saleWithTradeIns.totalPaid -= Number(payment.amount);
        }
      }

      saleWithTradeIns.status = this.calculateSaleStatus(saleWithTradeIns);

      await queryRunner.manager.save(payment);
      await queryRunner.manager.save(saleWithTradeIns);

      await queryRunner.commitTransaction();
      return { payment, sale: saleWithTradeIns };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * DELIVER SALE - Completa la operación a nivel operativo
   *
   * Precondición: operación confirmada financieramente
   * Actualiza stock del vehículo según tipo de operación y completa
   * documentación y transferencia.
   */
  async deliverSale(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id },
        relations: ['vehicle', 'payments', 'tradeIns'],
      });

      if (!sale) throw new NotFoundException(`Operación ${id} no encontrada`);

      sale.totalPaid = sale.payments
        .filter((p) => p.status === PaymentStatus.CONFIRMED)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      sale.status = this.calculateSaleStatus(sale);

      if (sale.status !== SaleStatus.CONFIRMED) {
        throw new BadRequestException(
          'No se puede completar la operación sin saldo cubierto',
        );
      }

      // Actualizar vehículo según tipo de operación
      const vehicle = sale.vehicle;

      if (sale.type === SaleType.SALE) {
        // SALE: Vehículo vendido, sale del inventario
        vehicle.status = VehicleStatus.SOLD;
      } else if (sale.type === SaleType.PURCHASE) {
        // PURCHASE: Vehículo nuevo en inventario, status = AVAILABLE
        vehicle.status = VehicleStatus.AVAILABLE;
      }

      sale.documentationStatus = DocumentationStatus.COMPLETED;
      sale.transferStatus = TransferStatus.COMPLETED;

      await queryRunner.manager.save(vehicle);
      await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return sale;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * CALCULATE SALE STATUS - Determina el estado financiero automáticamente
   *
   * Lógica:
   * - DRAFT: Sin pagos confirmados ni trade-ins
   * - PARTIALLY_PAID: Hay cobertura parcial
   * - CONFIRMED: El total quedó cubierto
   * - CANCELLED: Se preserva si fue seteado manualmente
   */
  private calculateSaleStatus(sale: Sale): SaleStatus {
    // Si ya está cancelada, no se recalcula automáticamente
    if (sale.status === SaleStatus.CANCELLED) {
      return sale.status;
    }

    const balance = this.saleBalanceCalculatorService.calculate({
      finalPrice: Number(sale.finalPrice ?? 0),
      tradeInValues: Array.isArray(sale.tradeIns)
        ? sale.tradeIns.map((tradeIn) => Number(tradeIn.tradeInValue ?? 0))
        : [],
      paymentValues: [Number(sale.totalPaid ?? 0)],
    });
    const coveredAmount = balance.tradeInsTotal + balance.paymentsTotal;

    if (coveredAmount <= 0) {
      return SaleStatus.DRAFT;
    }

    if (balance.pendingBalance <= 0) {
      return SaleStatus.CONFIRMED;
    }

    return SaleStatus.PARTIALLY_PAID;
  }

  /**
   * RESERVE - Reserva operativa del vehículo principal
   *
   * No altera el estado financiero de la venta.
   */
  async reserve(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id },
        relations: ['vehicle'],
      });

      if (!sale) throw new NotFoundException(`Operación ${id} no encontrada`);

      if (sale.status === SaleStatus.CANCELLED) {
        throw new BadRequestException(
          'No se puede reservar una operación cancelada',
        );
      }

      // Solo reservar vehículos en SALE
      if (sale.type === SaleType.SALE) {
        sale.vehicle.status = VehicleStatus.RESERVED;
        await queryRunner.manager.save(sale.vehicle);
      }

      const updated = await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private getTradeInsTotal(tradeIns: TradeIn[] = []): number {
    return tradeIns.reduce(
      (total, tradeIn) => total + Number(tradeIn.tradeInValue ?? 0),
      0,
    );
  }
}
