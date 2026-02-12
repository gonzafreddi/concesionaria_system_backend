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
import { PreSaleDocumentationService } from './pre-sale-documentation.service';
import { CreatePreSaleDocumentationDto } from './dto/create-pre-sale-documentation.dto';
import { UpdatePreSaleDocumentationDto } from './dto/update-pre-sale-documentation.dto';

@ApiTags('pre-sale-documentation')
@Controller('pre-sale-documentation')
export class PreSaleDocumentationController {
  constructor(private readonly service: PreSaleDocumentationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pre-sale documentation checklist' })
  @ApiResponse({ status: 201, description: 'Documentation checklist created' })
  @ApiBadRequestResponse({
    description: 'Invalid payload or vehicle not found',
  })
  create(@Body() dto: CreatePreSaleDocumentationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pre-sale documentation checklists' })
  @ApiResponse({ status: 200, description: 'List of documentation checklists' })
  findAll() {
    return this.service.findAll();
  }

  @Get('/vehicle/:id')
  @ApiOperation({ summary: 'Get a specific pre-sale documentation checklist' })
  @ApiResponse({ status: 200, description: 'Documentation checklist found' })
  @ApiNotFoundResponse({ description: 'Documentation checklist not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOneByVehicleId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pre-sale documentation checklist' })
  @ApiResponse({ status: 200, description: 'Documentation checklist updated' })
  @ApiNotFoundResponse({ description: 'Documentation checklist not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePreSaleDocumentationDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pre-sale documentation checklist' })
  @ApiResponse({ status: 200, description: 'Documentation checklist deleted' })
  @ApiNotFoundResponse({ description: 'Documentation checklist not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
