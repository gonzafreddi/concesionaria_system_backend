import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../payments/entities/payment.entity';
import { Sale } from './entities/sale.entity';
import {
  SaleBalanceCalculatorService,
  SalePendingBalance,
} from './sale-balance-calculator.service';

export interface SalePendingBalanceResponse extends SalePendingBalance {
  // Venta consultada
  saleId: number;
}

@Injectable()
export class SaleAccountBalanceService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly saleBalanceCalculatorService: SaleBalanceCalculatorService,
  ) {}

  async getPendingBalance(saleId: number): Promise<SalePendingBalanceResponse> {
    // Traemos solo lo necesario para componer el balance de cuenta
    const sale = await this.saleRepository.findOne({
      where: { id: saleId },
      relations: ['tradeIns', 'payments'],
    });

    if (!sale) {
      throw new NotFoundException(`Operación ${saleId} no encontrada`);
    }

    // La orquestación de datos queda acá; el cálculo puro se delega al servicio específico
    const balance = this.saleBalanceCalculatorService.calculate({
      finalPrice: Number(sale.finalPrice ?? 0),
      tradeInValues: sale.tradeIns.map((tradeIn) =>
        Number(tradeIn.tradeInValue ?? 0),
      ),
      // Solo consideramos pagos confirmados porque son los que realmente cancelan deuda
      paymentValues: sale.payments
        .filter((payment) => payment.status === PaymentStatus.CONFIRMED)
        .map((payment) => Number(payment.amount ?? 0)),
    });

    return {
      saleId: sale.id,
      ...balance,
    };
  }
}
