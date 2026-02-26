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
import { Sale, SaleType, SaleStatus } from './entities/sale.entity';
import { TradeIn } from './entities/trade-in.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle, VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { VehiclesService } from 'src/vehicles/vehicles.service';

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
 * TRANSICIONES DE ESTADO (validadas automáticamente):
 *   DRAFT → RESERVED: Cliente reserva vehículo
 *   RESERVED → SOLD: Primer pago confirmado
 *   SOLD → DELIVERED: Entrega completada
 *
 * NO se permiten cambios de estado desde frontend.
 * El status se actualiza automáticamente según:
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
  ) {}

  /**
   * CREATE - Crea nueva operación (SALE o PURCHASE)
   *
   * Inicia en DRAFT, sin cambiar stock hasta RESERVED.
   * finalPrice = basePrice (se actualiza con trade-ins)
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

      let totalPaid = 0;
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
          existingTradeIn.sale.status !== SaleStatus.DELIVERED
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

        totalPaid += Number(tradeInVehicle.price);
      }

      // 🧾 Crear venta
      const sale = manager.create(Sale, {
        client,
        vehicle,
        user,
        type: type || SaleType.SALE,
        status: SaleStatus.DRAFT,
        basePrice,
        finalPrice,
        totalPaid,
        saleDate: parsedDate,
        discount,
        transferPercentage: parsedTransferPercentage,
        transferAmount,
        adminExpenses: parsedAdminExpenses,
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

        tradeInVehicle.status = VehicleStatus.INSPECTION;
        await manager.save(tradeInVehicle);
      }

      // 🚗 Reservar vehículo principal
      vehicle.status = VehicleStatus.RESERVED;
      await manager.save(vehicle);

      return sale;
    });
  }

  /**
   * FIND ALL - Lista todas las operaciones
   */
  findAll() {
    return this.salesRepository.find({
      relations: ['client', 'vehicle', 'user', 'quote', 'payments', 'tradeIns'],
      order: { id: 'DESC' },
    });
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
    return sale;
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
   * - Sale no debe estar cerrada (DELIVERED)
   * - Monto no puede ser negativo
   * - totalPaid + amount no puede exceder finalPrice
   *
   * Actualización automática de estado:
   * - DRAFT → RESERVED: Primer pago confirmado
   * - RESERVED → SOLD: Si totalPaid >= finalPrice (100% pagado)
   * - SOLD → DELIVERED: Manual (requiere confirmación de entrega)
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
        relations: ['payments'],
      });

      if (!sale)
        throw new NotFoundException(`Operación ${saleId} no encontrada`);

      // No permitir pagos en DELIVERED
      if (sale.status === SaleStatus.DELIVERED) {
        throw new BadRequestException(
          'No se pueden agregar pagos a una operación entregada',
        );
      }

      if (amount <= 0) {
        throw new BadRequestException('El monto debe ser mayor a 0');
      }

      // No permitir sobre-pagar
      if (sale.totalPaid + amount > sale.finalPrice) {
        throw new BadRequestException(
          `Monto excede el precio final. Restante: ${sale.finalPrice - sale.totalPaid}`,
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

      // Actualizar sale status automáticamente
      // Nota: El pago está PENDING, pero podría confirmar automáticamente
      // Esto depende de la lógica: si es confirmado inmediatamente o requiere validación
      sale.status = this.calculateSaleStatus(sale, amount);

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
   * - Sale no debe estar cerrada
   *
   * Efecto:
   * - Descuenta del finalPrice
   * - Recalcula estado automáticamente
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

      if (sale.status === SaleStatus.DELIVERED) {
        throw new BadRequestException(
          'No se pueden agregar trade-ins a una operación entregada',
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
        existingTradeIn.sale.status !== SaleStatus.DELIVERED
      ) {
        throw new BadRequestException(
          `Vehículo ya está en trade-in de otra operación activa`,
        );
      }

      if (tradeInValue > sale.finalPrice) {
        throw new BadRequestException(
          `Valuación excede precio final. Máximo: ${sale.finalPrice}`,
        );
      }

      // Crear trade-in
      const tradeIn = queryRunner.manager.create(TradeIn, {
        sale,
        vehicle,
        tradeInValue,
      });

      await queryRunner.manager.save(tradeIn);

      // Actualizar finalPrice (descuento)
      sale.finalPrice = Math.max(0, sale.finalPrice - tradeInValue);
      sale.status = this.calculateSaleStatus(sale, 0);

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
   * CONFIRM PAYMENT - Cambia estado de pago a CONFIRMED
   *
   * Actualiza totalPaid y recalcula estado de sale automáticamente.
   * Si pago es rechazado (REJECTED), resta del totalPaid.
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
      const wasConfirmed = payment.status === PaymentStatus.CONFIRMED;

      // Aplicar cambio de estado
      if (status === PaymentStatus.CONFIRMED) {
        payment.status = PaymentStatus.CONFIRMED;
        payment.paidAt = new Date();
        sale.totalPaid += payment.amount;
      } else if (status === PaymentStatus.REJECTED) {
        payment.status = PaymentStatus.REJECTED;
        // Si fue confirmado antes, revertir el totalPaid
        if (wasConfirmed) {
          sale.totalPaid -= payment.amount;
        }
      }

      // Recalcular estado de venta
      sale.status = this.calculateStatusFromPayments(sale);

      await queryRunner.manager.save(payment);
      await queryRunner.manager.save(sale);

      await queryRunner.commitTransaction();
      return { payment, sale };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * DELIVER SALE - Marca como DELIVERED
   *
   * Precondición: 100% pagado (totalPaid >= finalPrice)
   * Actualiza stock del vehículo según tipo de operación
   */
  async deliverSale(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await queryRunner.manager.findOne(Sale, {
        where: { id },
        relations: ['vehicle', 'payments'],
      });

      if (!sale) throw new NotFoundException(`Operación ${id} no encontrada`);

      // Validar pago completo
      const totalConfirmed = sale.payments
        .filter((p) => p.status === PaymentStatus.CONFIRMED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      if (totalConfirmed < sale.finalPrice) {
        throw new BadRequestException('No se puede entregar sin pago completo');
      }

      // Actualizar vehículo según tipo de operación
      const vehicle = sale.vehicle;

      if (sale.type === SaleType.SALE) {
        // SALE: Vehículo vendido, sale.status = SOLD en inventario
        vehicle.status = VehicleStatus.SOLD;
      } else if (sale.type === SaleType.PURCHASE) {
        // PURCHASE: Vehículo nuevo en inventario, status = AVAILABLE
        vehicle.status = VehicleStatus.AVAILABLE;
      }

      sale.status = SaleStatus.DELIVERED;

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
   * CALCULATE SALE STATUS - Determina estado automáticamente
   *
   * Lógica:
   * - DRAFT: Estado inicial (nunca cambiar manualmente desde aquí)
   * - RESERVED: Primer pago confirmado O trade-in agregado
   * - SOLD: 100% pagado (totalPaid >= finalPrice)
   * - DELIVERED: Manual (solo desde SOLD con deliver())
   */
  private calculateSaleStatus(sale: Sale, amountAdded: number): SaleStatus {
    // Si ya está DELIVERED, no cambiar
    if (sale.status === SaleStatus.DELIVERED) {
      return sale.status;
    }

    // Si hay trade-in agregado, pasar a RESERVED
    if (sale.tradeIns.length > 0) {
      return SaleStatus.RESERVED;
    }

    const newTotalPaid = sale.totalPaid + amountAdded;

    // Si está pagado 100%, pasar a SOLD
    if (newTotalPaid >= sale.finalPrice) {
      return SaleStatus.SOLD;
    }

    // Si hay pagos, pasar a RESERVED
    if (newTotalPaid > 0 && sale.status === SaleStatus.DRAFT) {
      return SaleStatus.RESERVED;
    }

    return sale.status;
  }

  /**
   * CALCULATE STATUS FROM PAYMENTS - Recalcula estado basado en pagos existentes
   */
  private calculateStatusFromPayments(sale: Sale): SaleStatus {
    if (sale.status === SaleStatus.DELIVERED) {
      return sale.status;
    }

    const totalConfirmed = sale.payments
      .filter((p) => p.status === PaymentStatus.CONFIRMED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // 100% pagado
    if (totalConfirmed >= sale.finalPrice) {
      return SaleStatus.SOLD;
    }

    // Hay al menos un pago confirmado
    if (totalConfirmed > 0) {
      return SaleStatus.RESERVED;
    }

    // Sin pagos confirmados
    if (sale.tradeIns.length > 0) {
      return SaleStatus.RESERVED;
    }

    return SaleStatus.DRAFT;
  }

  /**
   * RESERVE - Cambio de estado DRAFT → RESERVED
   *
   * Actualiza Vehicle.status a RESERVED (solo para SALE)
   * Impide que otros clientes compren el mismo vehículo
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

      if (sale.status !== SaleStatus.DRAFT) {
        throw new BadRequestException(
          `No se puede reservar desde estado ${sale.status}`,
        );
      }

      // Solo reservar vehículos en SALE
      if (sale.type === SaleType.SALE) {
        sale.vehicle.status = VehicleStatus.RESERVED;
        await queryRunner.manager.save(sale.vehicle);
      }

      sale.status = SaleStatus.RESERVED;
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
}
