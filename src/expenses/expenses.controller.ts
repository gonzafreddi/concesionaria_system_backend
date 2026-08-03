import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FindExpensesQueryDto } from './dto/find-expenses-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un gasto general' })
  @ApiBody({ type: CreateExpenseDto })
  @ApiResponse({ status: 201, type: Expense })
  create(@Body() createExpenseDto: CreateExpenseDto): Promise<Expense> {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar gastos generales' })
  @ApiResponse({ status: 200, type: [Expense] })
  findAll(@Query() query: FindExpensesQueryDto): Promise<Expense[]> {
    return this.expensesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gasto general' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Expense })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Expense> {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un gasto general' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiResponse({ status: 200, type: Expense })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un gasto general' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: true }> {
    return this.expensesService.remove(id);
  }
}
