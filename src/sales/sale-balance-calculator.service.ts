import { Injectable } from '@nestjs/common';

export interface SaleBalanceCalculationInput {
  // Precio final registrado para la operación
  finalPrice: number;
  // Valores de los vehículos tomados como parte de pago
  tradeInValues: number[];
  // Pagos efectivamente confirmados para la operación
  paymentValues: number[];
}

export interface SalePendingBalance {
  // Precio final base sobre el que se calcula la deuda
  finalPrice: number;
  // Total aportado por trade-ins
  tradeInsTotal: number;
  // Total abonado en pagos confirmados
  paymentsTotal: number;
  // Saldo pendiente, nunca negativo
  pendingBalance: number;
}

@Injectable()
export class SaleBalanceCalculatorService {
  calculate({
    finalPrice,
    tradeInValues,
    paymentValues,
  }: SaleBalanceCalculationInput): SalePendingBalance {
    // Normalizamos todo a number para evitar inconsistencias típicas de DECIMAL en TypeORM
    const normalizedFinalPrice = Number(finalPrice ?? 0);
    // Sumamos todos los trade-ins asociados
    const tradeInsTotal = tradeInValues.reduce(
      (total, value) => total + Number(value ?? 0),
      0,
    );
    // Sumamos únicamente los pagos que ya impactan en la cuenta
    const paymentsTotal = paymentValues.reduce(
      (total, value) => total + Number(value ?? 0),
      0,
    );
    // El saldo pendiente surge de descontar trade-ins y pagos al precio final
    const pendingBalance = Math.max(
      normalizedFinalPrice - tradeInsTotal - paymentsTotal,
      0,
    );

    return {
      finalPrice: normalizedFinalPrice,
      tradeInsTotal,
      paymentsTotal,
      pendingBalance,
    };
  }
}
