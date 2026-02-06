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
import { PreSaleAestheticService } from './pre-sale-aesthetic.service';
import { CreatePreSaleAestheticDto } from './dto/create-pre-sale-aesthetic.dto';
import { UpdatePreSaleAestheticDto } from './dto/update-pre-sale-aesthetic.dto';

@ApiTags('pre-sale-aesthetic')
@Controller('pre-sale-aesthetic')
export class PreSaleAestheticController {
  constructor(private readonly service: PreSaleAestheticService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pre-sale aesthetic preparation' })
  @ApiResponse({ status: 201, description: 'Aesthetic preparation created' })
  @ApiBadRequestResponse({
    description: 'Invalid payload or vehicle not found',
  })
  create(@Body() dto: CreatePreSaleAestheticDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pre-sale aesthetic preparations' })
  @ApiResponse({ status: 200, description: 'List of aesthetic preparations' })
  findAll() {
    return this.service.findAll();
  }

  @Get('/vehicle/:id')
  @ApiOperation({ summary: 'Get a specific pre-sale aesthetic preparation' })
  @ApiResponse({ status: 200, description: 'Aesthetic preparation found' })
  @ApiNotFoundResponse({ description: 'Aesthetic preparation not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOneByVehicleId(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pre-sale aesthetic preparation' })
  @ApiResponse({ status: 200, description: 'Aesthetic preparation updated' })
  @ApiNotFoundResponse({ description: 'Aesthetic preparation not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePreSaleAestheticDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pre-sale aesthetic preparation' })
  @ApiResponse({ status: 200, description: 'Aesthetic preparation deleted' })
  @ApiNotFoundResponse({ description: 'Aesthetic preparation not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
