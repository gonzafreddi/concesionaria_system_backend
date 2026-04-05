import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pago',
    description: 'Registra un pago asociado a una venta existente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago creado exitosamente',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o venta cerrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un pago por ID',
    description: 'Devuelve los detalles de un pago específico.',
  })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado',
    type: Payment,
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    return this.paymentsService.getPaymentById(id);
  }

  @Get('sale/:saleId')
  @ApiOperation({
    summary: 'Obtener pagos de una venta',
    description: 'Lista todos los pagos asociados a una venta específica.',
  })
  @ApiParam({ name: 'saleId', description: 'ID de la venta', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos',
    type: [Payment],
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  getPaymentsBySale(
    @Param('saleId', ParseIntPipe) saleId: number,
  ): Promise<Payment[]> {
    return this.paymentsService.getPaymentsBySale(saleId);
  }

  @Patch(':id/confirm')
  @ApiOperation({
    summary: 'Confirmar un pago',
    description:
      'Cambia el estado del pago a CONFIRMED y actualiza el total pagado de la venta.',
  })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado exitosamente',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Pago ya confirmado o rechazado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  confirm(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    return this.paymentsService.confirmPayment(id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Rechazar un pago',
    description: 'Cambia el estado del pago a REJECTED.',
  })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Pago rechazado exitosamente',
    type: Payment,
  })
  @ApiResponse({ status: 400, description: 'Pago ya rechazado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  reject(@Param('id', ParseIntPipe) id: number): Promise<Payment> {
    return this.paymentsService.rejectPayment(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un pago',
    description: 'Elimina un pago solo si no está confirmado.',
  })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Pago eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar un pago confirmado',
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentsService.deletePayment(id);
  }
}
