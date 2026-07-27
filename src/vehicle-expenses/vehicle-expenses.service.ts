import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { VehicleExpenseSummaryDto } from './dto/vehicle-expense-summary.dto';
import {
  VehicleExpense,
  VehicleExpenseStatus,
} from './entities/vehicle-expense.entity';

@Injectable()
export class VehicleExpensesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleExpense)
    private readonly vehicleExpensesRepository: Repository<VehicleExpense>,
  ) {}

  async create(
    vehicleId: number,
    createExpenseDto: CreateVehicleExpenseDto,
  ): Promise<VehicleExpense> {
    await this.ensureVehicleExists(vehicleId);

    const expenseDate = this.parseExpenseDate(createExpenseDto.expenseDate);
    const expense = this.vehicleExpensesRepository.create({
      vehicleId,
      type: createExpenseDto.type,
      description: createExpenseDto.description,
      amount: createExpenseDto.amount,
      status: createExpenseDto.status ?? VehicleExpenseStatus.PENDING,
      expenseDate,
      supplierName: createExpenseDto.supplierName ?? null,
      notes: createExpenseDto.notes ?? null,
    });

    return this.vehicleExpensesRepository.save(expense);
  }

  async findAll(vehicleId: number): Promise<VehicleExpense[]> {
    await this.ensureVehicleExists(vehicleId);

    return this.vehicleExpensesRepository.find({
      where: { vehicleId },
      order: { expenseDate: 'DESC', id: 'DESC' },
    });
  }

  async getSummary(vehicleId: number): Promise<VehicleExpenseSummaryDto> {
    const vehicle = await this.ensureVehicleExists(vehicleId);
    const expenses = await this.vehicleExpensesRepository.find({
      where: { vehicleId },
    });

    const expensesTotal = expenses
      .filter((expense) => expense.status !== VehicleExpenseStatus.CANCELLED)
      .reduce((total, expense) => total + Number(expense.amount ?? 0), 0);

    const acquisitionPrice = Number(vehicle.acquisitionPrice ?? 0);
    const salePrice = Number(vehicle.price ?? 0);
    const totalCost = acquisitionPrice + expensesTotal;

    return {
      vehicleId: vehicle.id,
      acquisitionPrice,
      expensesTotal,
      totalCost,
      salePrice,
      estimatedProfit: salePrice - totalCost,
    };
  }

  async update(
    vehicleId: number,
    expenseId: number,
    updateExpenseDto: UpdateVehicleExpenseDto,
  ): Promise<VehicleExpense> {
    await this.ensureVehicleExists(vehicleId);
    const expense = await this.getVehicleExpenseOrFail(vehicleId, expenseId);

    if (updateExpenseDto.expenseDate !== undefined) {
      expense.expenseDate = this.parseExpenseDate(updateExpenseDto.expenseDate);
    }

    if (updateExpenseDto.type !== undefined) {
      expense.type = updateExpenseDto.type;
    }

    if (updateExpenseDto.description !== undefined) {
      expense.description = updateExpenseDto.description;
    }

    if (updateExpenseDto.amount !== undefined) {
      expense.amount = updateExpenseDto.amount;
    }

    if (updateExpenseDto.status !== undefined) {
      expense.status = updateExpenseDto.status;
    }

    if (updateExpenseDto.supplierName !== undefined) {
      expense.supplierName = updateExpenseDto.supplierName ?? null;
    }

    if (updateExpenseDto.notes !== undefined) {
      expense.notes = updateExpenseDto.notes ?? null;
    }

    return this.vehicleExpensesRepository.save(expense);
  }

  async remove(vehicleId: number, expenseId: number): Promise<{ deleted: true }> {
    await this.ensureVehicleExists(vehicleId);
    const expense = await this.getVehicleExpenseOrFail(vehicleId, expenseId);

    await this.vehicleExpensesRepository.remove(expense);
    return { deleted: true };
  }

  private async ensureVehicleExists(vehicleId: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);
    }

    return vehicle;
  }

  private async getVehicleExpenseOrFail(
    vehicleId: number,
    expenseId: number,
  ): Promise<VehicleExpense> {
    const expense = await this.vehicleExpensesRepository.findOne({
      where: { id: expenseId, vehicleId },
    });

    if (!expense) {
      throw new NotFoundException(
        `Gasto ${expenseId} no encontrado para el vehículo ${vehicleId}`,
      );
    }

    return expense;
  }

  private parseExpenseDate(expenseDate?: string): Date {
    const parsedDate = expenseDate ? new Date(expenseDate) : new Date();

    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha de gasto inválida');
    }

    return parsedDate;
  }
}
