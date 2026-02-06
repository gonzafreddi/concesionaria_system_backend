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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PreSaleMechanicalService } from './pre-sale-mechanical.service';
import { CreatePreSaleMechanicalDto } from './dto/create-pre-sale-mechanical.dto';
import { UpdatePreSaleMechanicalDto } from './dto/update-pre-sale-mechanical.dto';

@ApiTags('pre-sale-mechanical')
@Controller('pre-sale-mechanical')
export class PreSaleMechanicalController {
  constructor(private readonly service: PreSaleMechanicalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pre-sale mechanical inspection' })
  @ApiResponse({ status: 201, description: 'Mechanical inspection created' })
  @ApiBadRequestResponse({
    description: 'Invalid payload or vehicle not found',
  })
  create(@Body() dto: CreatePreSaleMechanicalDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pre-sale mechanical inspections' })
  @ApiResponse({ status: 200, description: 'List of mechanical inspections' })
  findAll() {
    return this.service.findAll();
  }

  @Get('/vehicle/:id')
  @ApiOperation({
    summary: 'Get a specific pre-sale mechanical inspection by vehicle id ',
  })
  @ApiResponse({ status: 200, description: 'Mechanical inspection found' })
  @ApiNotFoundResponse({ description: 'Mechanical inspection not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOneByVehicleId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pre-sale mechanical inspection' })
  @ApiResponse({ status: 200, description: 'Mechanical inspection updated' })
  @ApiNotFoundResponse({ description: 'Mechanical inspection not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePreSaleMechanicalDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pre-sale mechanical inspection' })
  @ApiResponse({ status: 200, description: 'Mechanical inspection deleted' })
  @ApiNotFoundResponse({ description: 'Mechanical inspection not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
