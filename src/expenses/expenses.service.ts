import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FindExpensesQueryDto } from './dto/find-expenses-query.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Expense, ExpenseStatus } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoriesRepository: Repository<ExpenseCategory>,
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
  ) {}

  async createCategory(
    createCategoryDto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = this.expenseCategoriesRepository.create({
      name: createCategoryDto.name.trim(),
      description: createCategoryDto.description?.trim() || null,
      isActive: createCategoryDto.isActive ?? true,
    });

    return this.expenseCategoriesRepository.save(category);
  }

  findAllCategories(): Promise<ExpenseCategory[]> {
    return this.expenseCategoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOneCategory(id: number): Promise<ExpenseCategory> {
    return this.getCategoryOrFail(id);
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = await this.getCategoryOrFail(id);

    if (updateCategoryDto.name !== undefined) {
      category.name = updateCategoryDto.name.trim();
    }

    if (updateCategoryDto.description !== undefined) {
      category.description = updateCategoryDto.description?.trim() || null;
    }

    if (updateCategoryDto.isActive !== undefined) {
      category.isActive = updateCategoryDto.isActive;
    }

    return this.expenseCategoriesRepository.save(category);
  }

  async removeCategory(id: number): Promise<{ deleted: true }> {
    const category = await this.getCategoryOrFail(id);
    const expensesCount = await this.expensesRepository.count({
      where: { categoryId: id },
    });

    if (expensesCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoria con gastos asociados',
      );
    }

    await this.expenseCategoriesRepository.remove(category);
    return { deleted: true };
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const category = await this.getCategoryOrFail(createExpenseDto.categoryId);

    if (!category.isActive) {
      throw new BadRequestException('La categoria de gasto esta inactiva');
    }

    const expense = this.expensesRepository.create({
      categoryId: createExpenseDto.categoryId,
      description: createExpenseDto.description.trim(),
      amount: createExpenseDto.amount,
      status: createExpenseDto.status ?? ExpenseStatus.PENDING,
      expenseDate: this.parseDate(createExpenseDto.expenseDate),
      supplierName: createExpenseDto.supplierName?.trim() || null,
      notes: createExpenseDto.notes?.trim() || null,
    });

    return this.expensesRepository.save(expense);
  }

  findAll(query: FindExpensesQueryDto): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: this.buildExpenseWhere(query),
      relations: ['category'],
      order: { expenseDate: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Expense> {
    return this.getExpenseOrFail(id);
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.getExpenseOrFail(id);

    if (updateExpenseDto.categoryId !== undefined) {
      const category = await this.getCategoryOrFail(
        updateExpenseDto.categoryId,
      );

      if (!category.isActive) {
        throw new BadRequestException('La categoria de gasto esta inactiva');
      }

      expense.categoryId = updateExpenseDto.categoryId;
    }

    if (updateExpenseDto.description !== undefined) {
      expense.description = updateExpenseDto.description.trim();
    }

    if (updateExpenseDto.amount !== undefined) {
      expense.amount = updateExpenseDto.amount;
    }

    if (updateExpenseDto.status !== undefined) {
      expense.status = updateExpenseDto.status;
    }

    if (updateExpenseDto.expenseDate !== undefined) {
      expense.expenseDate = this.parseDate(updateExpenseDto.expenseDate);
    }

    if (updateExpenseDto.supplierName !== undefined) {
      expense.supplierName = updateExpenseDto.supplierName?.trim() || null;
    }

    if (updateExpenseDto.notes !== undefined) {
      expense.notes = updateExpenseDto.notes?.trim() || null;
    }

    return this.expensesRepository.save(expense);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const expense = await this.getExpenseOrFail(id);
    await this.expensesRepository.remove(expense);
    return { deleted: true };
  }

  private async getCategoryOrFail(id: number): Promise<ExpenseCategory> {
    const category = await this.expenseCategoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria de gasto ${id} no encontrada`);
    }

    return category;
  }

  private async getExpenseOrFail(id: number): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!expense) {
      throw new NotFoundException(`Gasto ${id} no encontrado`);
    }

    return expense;
  }

  private buildExpenseWhere(
    query: FindExpensesQueryDto,
  ): FindOptionsWhere<Expense> {
    const where: FindOptionsWhere<Expense> = {};

    if (query.categoryId !== undefined) {
      where.categoryId = query.categoryId;
    }

    if (query.status !== undefined) {
      where.status = query.status;
    }

    const dateFrom = query.dateFrom ? this.parseDate(query.dateFrom) : null;
    const dateTo = query.dateTo ? this.parseDate(query.dateTo) : null;

    if (dateFrom && dateTo) {
      where.expenseDate = Between(dateFrom, dateTo);
    } else if (dateFrom) {
      where.expenseDate = MoreThanOrEqual(dateFrom);
    } else if (dateTo) {
      where.expenseDate = LessThanOrEqual(dateTo);
    }

    return where;
  }

  private parseDate(value?: string): Date {
    const parsedDate = value ? new Date(value) : new Date();

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Fecha de gasto invalida');
    }

    return parsedDate;
  }
}
