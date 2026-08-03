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
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpensesService } from './expenses.service';

@ApiTags('expense-categories')
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una categoria de gastos' })
  @ApiBody({ type: CreateExpenseCategoryDto })
  @ApiResponse({ status: 201, type: ExpenseCategory })
  create(
    @Body() createCategoryDto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    return this.expensesService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias de gastos' })
  @ApiResponse({ status: 200, type: [ExpenseCategory] })
  findAll(): Promise<ExpenseCategory[]> {
    return this.expensesService.findAllCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoria de gastos' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ExpenseCategory })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExpenseCategory> {
    return this.expensesService.findOneCategory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoria de gastos' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateExpenseCategoryDto })
  @ApiResponse({ status: 200, type: ExpenseCategory })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    return this.expensesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoria sin gastos asociados' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: true }> {
    return this.expensesService.removeCategory(id);
  }
}
