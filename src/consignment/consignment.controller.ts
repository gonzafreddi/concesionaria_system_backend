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
import { ConsignmentService } from './consignment.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { Consignment } from './entities/consignment.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('consignments')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('consignments')
export class ConsignmentController {
  constructor(private readonly consignmentService: ConsignmentService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una consignación' })
  @ApiBody({ type: CreateConsignmentDto })
  @ApiResponse({ status: 201, type: Consignment })
  create(
    @Body() createConsignmentDto: CreateConsignmentDto,
  ): Promise<Consignment> {
    return this.consignmentService.create(createConsignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar consignaciones' })
  @ApiResponse({ status: 200, type: [Consignment] })
  findAll(): Promise<Consignment[]> {
    return this.consignmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una consignación por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Consignment })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Consignment> {
    return this.consignmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una consignación' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateConsignmentDto })
  @ApiResponse({ status: 200, type: Consignment })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsignmentDto: UpdateConsignmentDto,
  ): Promise<Consignment> {
    return this.consignmentService.update(id, updateConsignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una consignación' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.consignmentService.remove(id);
  }
}
