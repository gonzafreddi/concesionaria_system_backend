import { SaleBalanceCalculatorService } from './sale-balance-calculator.service';

describe('SaleBalanceCalculatorService', () => {
  let service: SaleBalanceCalculatorService;

  beforeEach(() => {
    service = new SaleBalanceCalculatorService();
  });

  it('calcula el balance pendiente descontando trade-ins y pagos', () => {
    expect(
      service.calculate({
        finalPrice: 100000,
        // Vehículos entregados como parte de pago
        tradeInValues: [20000, 5000],
        // Pagos ya imputados a la venta
        paymentValues: [10000, 15000],
      }),
    ).toEqual({
      finalPrice: 100000,
      tradeInsTotal: 25000,
      paymentsTotal: 25000,
      pendingBalance: 50000,
    });
  });

  it('no devuelve balance negativo', () => {
    expect(
      service.calculate({
        finalPrice: 100000,
        tradeInValues: [30000],
        paymentValues: [80000],
      }),
    ).toEqual({
      finalPrice: 100000,
      tradeInsTotal: 30000,
      paymentsTotal: 80000,
      pendingBalance: 0,
    });
  });
});
