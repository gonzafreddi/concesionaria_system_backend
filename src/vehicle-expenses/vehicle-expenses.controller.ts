import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { VehicleExpenseSummaryDto } from './dto/vehicle-expense-summary.dto';
import { VehicleExpense } from './entities/vehicle-expense.entity';
import { VehicleExpensesService } from './vehicle-expenses.service';

@ApiTags('vehicle-expenses')
@Controller('vehicles/:vehicleId/expenses')
export class VehicleExpensesController {
  constructor(private readonly vehicleExpensesService: VehicleExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un gasto para un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiBody({ type: CreateVehicleExpenseDto })
  @ApiResponse({ status: 201, type: VehicleExpense })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  create(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() createExpenseDto: CreateVehicleExpenseDto,
  ): Promise<VehicleExpense> {
    return this.vehicleExpensesService.create(vehicleId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar gastos de un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiResponse({ status: 200, type: [VehicleExpense] })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  findAll(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ): Promise<VehicleExpense[]> {
    return this.vehicleExpensesService.findAll(vehicleId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen de costos y margen del vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiResponse({ status: 200, type: VehicleExpenseSummaryDto })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  getSummary(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
  ): Promise<VehicleExpenseSummaryDto> {
    return this.vehicleExpensesService.getSummary(vehicleId);
  }

  @Patch(':expenseId')
  @ApiOperation({ summary: 'Actualizar un gasto de un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiParam({ name: 'expenseId', type: Number, description: 'ID del gasto' })
  @ApiBody({ type: UpdateVehicleExpenseDto })
  @ApiResponse({ status: 200, type: VehicleExpense })
  @ApiResponse({ status: 404, description: 'Vehículo o gasto no encontrado' })
  update(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() updateExpenseDto: UpdateVehicleExpenseDto,
  ): Promise<VehicleExpense> {
    return this.vehicleExpensesService.update(
      vehicleId,
      expenseId,
      updateExpenseDto,
    );
  }

  @Delete(':expenseId')
  @ApiOperation({ summary: 'Eliminar un gasto de un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiParam({ name: 'expenseId', type: Number, description: 'ID del gasto' })
  @ApiResponse({ status: 200, description: 'Gasto eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Vehículo o gasto no encontrado' })
  remove(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
  ): Promise<{ deleted: true }> {
    return this.vehicleExpensesService.remove(vehicleId, expenseId);
  }
}
