import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { Inspection } from './entities/inspection.entity';

@ApiTags('inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva inspección',
    description:
      'Crea una nueva inspección de vehículo con todos los detalles de condición, documentación y evaluación comercial',
  })
  @ApiBody({
    description: 'Datos para crear la inspección',
    type: CreateInspectionDto,
    examples: {
      inspectionCompleta: {
        description: 'Inspección completa con todos los campos',
        value: {
          clientId: 1,
          vehicleId: 1,
          paintAndBody: 8,
          tiresPercentage: 85,
          tiresBrand: 'Michelin',
          interiorCondition: 7,
          visibleDetails: 'Cristales ligeramente rayados',
          fullyOperational: true,
          serviceUpToDate: false,
          isOwner: true,
          hasLicenseDebt: false,
          licenseDebtAmount: 0,
          docRegistrationCard: true,
          docTitle: true,
          docVtv: true,
          docOwnerId: true,
          docForm08: false,
          docNoDebtCertificate: true,
          docPoliceVerification: false,
          docDomainReport: true,
          estimatedMarketValue: 450000.5,
          tradeInValue: 420000.0,
          estimatedEntryDate: '2026-02-01',
          generalNotes: 'Vehículo en buen estado general',
          paintNotes: 'Retoque menor en parachoques trasero',
        },
      },
      inspectionMinima: {
        description: 'Inspección con campos requeridos solamente',
        value: {
          clientId: 2,
          vehicleId: 3,
          paintAndBody: 6,
          tiresPercentage: 70,
          tiresBrand: 'Bridgestone',
          interiorCondition: 6,
          estimatedMarketValue: 350000.0,
          tradeInValue: 320000.0,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Inspección creada exitosamente',
    type: Inspection,
    example: {
      id: 'uuid-example',
      inspectionDate: '2026-01-26T10:30:00Z',
      paintAndBody: 8,
      tiresPercentage: 85,
      tiresBrand: 'Michelin',
      interiorCondition: 7,
      visibleDetails: 'Cristales ligeramente rayados',
      fullyOperational: true,
      serviceUpToDate: false,
      isOwner: true,
      hasLicenseDebt: false,
      licenseDebtAmount: 0,
      docRegistrationCard: true,
      docTitle: true,
      docVtv: true,
      docOwnerId: true,
      docForm08: false,
      docNoDebtCertificate: true,
      docPoliceVerification: false,
      docDomainReport: true,
      estimatedMarketValue: '450000.50',
      tradeInValue: '420000.00',
      estimatedEntryDate: '2026-02-01',
      generalNotes: 'Vehículo en buen estado general',
      paintNotes: 'Retoque menor en parachoques trasero',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o cliente/vehículo no encontrado',
  })
  create(@Body() createInspectionDto: CreateInspectionDto) {
    return this.inspectionsService.create(createInspectionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las inspecciones',
    description:
      'Retorna un listado completo de todas las inspecciones registradas, ordenadas por fecha descendente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de inspecciones',
    type: [Inspection],
    example: [
      {
        id: 'uuid-example-1',
        inspectionDate: '2026-01-26T10:30:00Z',
        paintAndBody: 8,
        tiresPercentage: 85,
        tiresBrand: 'Michelin',
      },
      {
        id: 'uuid-example-2',
        inspectionDate: '2026-01-25T14:20:00Z',
        paintAndBody: 7,
        tiresPercentage: 90,
        tiresBrand: 'Bridgestone',
      },
    ],
  })
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una inspección por ID',
    description: 'Retorna los detalles completos de una inspección específica',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la inspección',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Inspección encontrada',
    type: Inspection,
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      inspectionDate: '2026-01-26T10:30:00Z',
      paintAndBody: 8,
      tiresPercentage: 85,
      tiresBrand: 'Michelin',
      interiorCondition: 7,
      visibleDetails: 'Cristales ligeramente rayados',
      fullyOperational: true,
      serviceUpToDate: false,
      isOwner: true,
      hasLicenseDebt: false,
      estimatedMarketValue: '450000.50',
      tradeInValue: '420000.00',
      generalNotes: 'Vehículo en buen estado general',
      paintNotes: 'Retoque menor en parachoques trasero',
      client: {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        dni: '12345678',
      },
      vehicle: {
        id: 1,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Inspección no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una inspección',
    description: 'Actualiza los datos de una inspección existente',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la inspección',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
  })
  @ApiBody({
    description: 'Datos a actualizar (todos los campos son opcionales)',
    type: UpdateInspectionDto,
    examples: {
      actualizacionParcial: {
        description: 'Actualizar solo la puntuación de pintura',
        value: {
          paintAndBody: 9,
        },
      },
      actualizacionCompleta: {
        description: 'Actualizar múltiples campos',
        value: {
          paintAndBody: 9,
          tiresPercentage: 90,
          serviceUpToDate: true,
          generalNotes: 'Actualizado después de revisión adicional',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Inspección actualizada exitosamente',
    type: Inspection,
  })
  @ApiResponse({
    status: 404,
    description: 'Inspección no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  update(
    @Param('id') id: string,
    @Body() updateInspectionDto: UpdateInspectionDto,
  ) {
    return this.inspectionsService.update(id, updateInspectionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una inspección',
    description: 'Elimina una inspección del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la inspección',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Inspección eliminada exitosamente',
    example: {
      message:
        'Inspección con ID f47ac10b-58cc-4372-a567-0e02b2c3d479 eliminada exitosamente',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Inspección no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.inspectionsService.remove(id);
  }

  @Get(':id/score')
  @ApiOperation({
    summary: 'Calcular puntuación de inspección',
    description:
      'Calcula y retorna la puntuación general de una inspección basada en condición física y mecánica',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la inspección',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Puntuación calculada',
    example: {
      overallScore: 7.33,
      details: {
        paintAndBody: 8,
        interiorCondition: 7,
        tiresPercentage: 85,
        fullyOperational: true,
        serviceUpToDate: false,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Inspección no encontrada',
  })
  getInspectionScore(@Param('id') id: string) {
    return this.inspectionsService.getInspectionScore(id);
  }

  @Get(':id/pending-documentation')
  @ApiOperation({
    summary: 'Obtener documentación pendiente',
    description:
      'Retorna la lista de documentos pendientes para una inspección',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la inspección',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Documentación pendiente',
    example: {
      pending: ['Formulario 08', 'Verificación policial'],
      complete: false,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Inspección no encontrada',
  })
  getPendingDocumentation(@Param('id') id: string) {
    return this.inspectionsService.getPendingDocumentation(id);
  }

  @Get('client/:clientId')
  @ApiOperation({
    summary: 'Obtener inspecciones por cliente',
    description:
      'Retorna todas las inspecciones realizadas a un cliente específico',
  })
  @ApiParam({
    name: 'clientId',
    description: 'ID del cliente',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de inspecciones del cliente',
    type: [Inspection],
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  findByClient(@Param('clientId') clientId: string) {
    return this.inspectionsService.findByClient(parseInt(clientId, 10));
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Obtener inspecciones por vehículo',
    description:
      'Retorna todas las inspecciones realizadas a un vehículo específico',
  })
  @ApiParam({
    name: 'vehicleId',
    description: 'ID del vehículo',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de inspecciones del vehículo',
    type: [Inspection],
  })
  @ApiResponse({
    status: 404,
    description: 'Vehículo no encontrado',
  })
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.inspectionsService.findByVehicle(parseInt(vehicleId, 10));
  }
}

//TODO: si no tiene decimales agregarlos desde el servicio
//TODO: Transformar la fecha en el servicio para que siempre devuelva YYYY-MM-DD
