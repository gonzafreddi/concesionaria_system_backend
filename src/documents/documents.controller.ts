import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Request } from 'express';
import { CreateGeneratedDocumentDto } from './dto/create-generated-document.dto';
import { FindGeneratedDocumentsQueryDto } from './dto/find-generated-documents-query.dto';
import {
  DocumentStatus,
  DocumentType,
  GeneratedDocument,
  RelatedEntityType,
} from './entities/generated-document.entity';
import { GeneratedDocumentsService } from './documents.service';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

type AuthenticatedRequest = Request & {
  user?: {
    id?: number | string;
  };
};

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: GeneratedDocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(
            new BadRequestException(
              `Tipo de archivo no permitido: ${file.mimetype}`,
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir un documento PDF generado en frontend',
    description:
      'Recibe el PDF final desde frontend, lo almacena y registra su metadata asociándolo a cualquier entidad del sistema.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'file',
        'templateCode',
        'documentType',
        'relatedEntityType',
        'relatedEntityId',
      ],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        templateCode: {
          type: 'string',
          example: 'sale-contract-v1',
        },
        documentType: {
          type: 'string',
          enum: Object.values(DocumentType),
        },
        relatedEntityType: {
          type: 'string',
          enum: Object.values(RelatedEntityType),
        },
        relatedEntityId: {
          type: 'string',
          example: '8d679f55-f0f3-4fd1-b784-d3a069d87d88',
        },
        status: {
          type: 'string',
          enum: Object.values(DocumentStatus),
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento creado exitosamente',
    type: GeneratedDocument,
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o metadata inválida',
  })
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateGeneratedDocumentDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<GeneratedDocument> {
    return this.documentsService.uploadDocument(
      file,
      createDocumentDto,
      request.user?.id !== undefined ? String(request.user.id) : null,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar documentos',
    description:
      'Obtiene todos los documentos registrados con filtros opcionales.',
  })
  @ApiQuery({ name: 'templateCode', required: false, type: String })
  @ApiQuery({ name: 'documentType', required: false, enum: DocumentType })
  @ApiQuery({
    name: 'relatedEntityType',
    required: false,
    enum: RelatedEntityType,
  })
  @ApiQuery({ name: 'relatedEntityId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiResponse({
    status: 200,
    description: 'Listado de documentos',
    type: [GeneratedDocument],
  })
  findAll(
    @Query() query: FindGeneratedDocumentsQueryDto,
  ): Promise<GeneratedDocument[]> {
    return this.documentsService.findAll(query);
  }

  @Get('entity/:relatedEntityType/:relatedEntityId')
  @ApiOperation({
    summary: 'Buscar documentos por entidad',
    description:
      'Busca documentos usando relatedEntityType y relatedEntityId sin relaciones polimórficas.',
  })
  @ApiParam({
    name: 'relatedEntityType',
    description: 'Tipo de entidad asociada',
    enum: RelatedEntityType,
  })
  @ApiParam({
    name: 'relatedEntityId',
    description: 'ID de la entidad asociada',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Documentos encontrados para la entidad indicada',
    type: [GeneratedDocument],
  })
  findByEntity(
    @Param('relatedEntityType', new ParseEnumPipe(RelatedEntityType))
    relatedEntityType: RelatedEntityType,
    @Param('relatedEntityId') relatedEntityId: string,
  ): Promise<GeneratedDocument[]> {
    return this.documentsService.findByEntity(
      relatedEntityType,
      relatedEntityId,
    );
  }

  @Get(':id/file')
  @ApiOperation({
    summary: 'Ver o descargar el archivo PDF de un documento',
    description: 'Devuelve el binario PDF almacenado dentro del sistema.',
  })
  @ApiParam({ name: 'id', description: 'ID UUID del documento', type: String })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF del documento',
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const document = await this.documentsService.getFile(id);

    response.setHeader('Content-Type', document.mimeType);
    response.setHeader('Content-Length', String(document.size));
    response.setHeader(
      'Content-Disposition',
      this.buildContentDisposition(document.originalFileName),
    );

    return new StreamableFile(document.fileData);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un documento por ID',
    description: 'Devuelve el detalle completo de un documento.',
  })
  @ApiParam({ name: 'id', description: 'ID UUID del documento', type: String })
  @ApiResponse({
    status: 200,
    description: 'Documento encontrado',
    type: GeneratedDocument,
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string): Promise<GeneratedDocument> {
    return this.documentsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un documento',
    description: 'Elimina un documento existente del sistema.',
  })
  @ApiParam({ name: 'id', description: 'ID UUID del documento', type: String })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id') id: string): Promise<{ deleted: true }> {
    return this.documentsService.remove(id);
  }

  private buildContentDisposition(fileName: string): string {
    const fallbackName =
      fileName
        .normalize('NFKD')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/["\\]/g, '_') || 'document.pdf';

    return `inline; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }
}
