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
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { LocationsService } from './locations.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('locations')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una ubicacion/deposito' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, type: Location })
  create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ubicaciones/depositos' })
  @ApiResponse({ status: 200, type: [Location] })
  findAll(): Promise<Location[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ubicacion/deposito' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Location })
  @ApiResponse({ status: 404, description: 'Ubicacion no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Location> {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ubicacion/deposito' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({ status: 200, type: Location })
  @ApiResponse({ status: 404, description: 'Ubicacion no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una ubicacion/deposito sin vehiculos asignados',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Ubicacion eliminada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La ubicacion tiene vehiculos asignados',
  })
  @ApiResponse({ status: 404, description: 'Ubicacion no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: true }> {
    return this.locationsService.remove(id);
  }
}
