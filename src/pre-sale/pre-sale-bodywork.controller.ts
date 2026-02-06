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
import { PreSaleBodyworkService } from './pre-sale-bodywork.service';
import { CreatePreSaleBodyworkDto } from './dto/create-pre-sale-bodywork.dto';
import { UpdatePreSaleBodyworkDto } from './dto/update-pre-sale-bodywork.dto';

@ApiTags('pre-sale-bodywork')
@Controller('pre-sale-bodywork')
export class PreSaleBodyworkController {
  constructor(private readonly service: PreSaleBodyworkService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pre-sale bodywork inspection' })
  @ApiResponse({ status: 201, description: 'Bodywork inspection created' })
  @ApiBadRequestResponse({
    description: 'Invalid payload or vehicle not found',
  })
  create(@Body() dto: CreatePreSaleBodyworkDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pre-sale bodywork inspections' })
  @ApiResponse({ status: 200, description: 'List of bodywork inspections' })
  findAll() {
    return this.service.findAll();
  }

  @Get('/vehicle/:id')
  @ApiOperation({ summary: 'Get a specific pre-sale bodywork inspection' })
  @ApiResponse({ status: 200, description: 'Bodywork inspection found' })
  @ApiNotFoundResponse({ description: 'Bodywork inspection not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOneByVehicleId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pre-sale bodywork inspection' })
  @ApiResponse({ status: 200, description: 'Bodywork inspection updated' })
  @ApiNotFoundResponse({ description: 'Bodywork inspection not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePreSaleBodyworkDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pre-sale bodywork inspection' })
  @ApiResponse({ status: 200, description: 'Bodywork inspection deleted' })
  @ApiNotFoundResponse({ description: 'Bodywork inspection not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
