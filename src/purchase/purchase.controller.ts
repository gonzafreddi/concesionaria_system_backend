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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Purchase } from './entities/purchase.entity';

@ApiTags('purchase')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una compra',
    description:
      'Registra la compra de un vehículo por parte de la concesionaria y la vincula con cliente, vehículo y documentos.',
  })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({
    status: 201,
    description: 'Compra creada correctamente',
    type: Purchase,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente o vehículo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o vehículo ya asociado a otra compra',
  })
  create(@Body() createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar compras',
    description:
      'Obtiene todas las compras con cliente, vehículo y documentos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de compras',
    type: [Purchase],
  })
  findAll(): Promise<Purchase[]> {
    return this.purchaseService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una compra por ID',
    description: 'Devuelve el detalle de una compra específica.',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Compra encontrada',
    type: Purchase,
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Purchase> {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una compra',
    description: 'Permite modificar parcialmente una compra existente.',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra', type: Number })
  @ApiBody({ type: UpdatePurchaseDto })
  @ApiResponse({
    status: 200,
    description: 'Compra actualizada correctamente',
    type: Purchase,
  })
  @ApiResponse({
    status: 404,
    description: 'Compra, cliente o vehículo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o vehículo ya asociado a otra compra',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una compra',
    description:
      'Elimina una compra si no tiene documentos asociados a la operación.',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Compra eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'La compra tiene documentos asociados y no puede eliminarse',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: true }> {
    return this.purchaseService.remove(id);
  }
}
