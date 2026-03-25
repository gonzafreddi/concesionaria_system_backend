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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from './entities/document.entity';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un documento',
    description:
      'Registra un documento y opcionalmente lo vincula a una venta, vehículo, pago o cliente.',
  })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Documento creado exitosamente',
    type: Document,
  })
  @ApiResponse({
    status: 404,
    description: 'Alguna referencia asociada no existe',
  })
  create(@Body() createDocumentDto: CreateDocumentDto): Promise<Document> {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar documentos',
    description: 'Obtiene todos los documentos registrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de documentos',
    type: [Document],
  })
  findAll(): Promise<Document[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un documento por ID',
    description: 'Devuelve el detalle completo de un documento.',
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado',
    type: Document,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un documento',
    description: 'Permite actualizar parcialmente los datos del documento.',
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({
    status: 200,
    description: 'Documento actualizado exitosamente',
    type: Document,
  })
  @ApiResponse({ status: 404, description: 'Documento o referencia no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un documento',
    description: 'Elimina un documento existente del sistema.',
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ deleted: true }> {
    return this.documentsService.remove(id);
  }
}
