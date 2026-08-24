import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttachQuoteDocumentDto } from './dto/attach-quote-document.dto';
import { ChangeQuoteStatusDto } from './dto/change-quote-status.dto';
import { CreateQuoteActivityDto } from './dto/create-quote-activity.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteActivityDto } from './dto/update-quote-activity.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteStatus } from './entities/quote.entity';
import { QuotesService } from './quotes.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('quotes')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  findAll(
    @Query('status') status?: QuoteStatus,
    @Query('clientId') clientId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('userId') userId?: string,
    @Query('pendingFollowUp', new ParseBoolPipe({ optional: true }))
    pendingFollowUp?: boolean,
  ) {
    return this.quotesService.findAll({
      status,
      clientId: clientId ? Number(clientId) : undefined,
      vehicleId: vehicleId ? Number(vehicleId) : undefined,
      userId: userId ? Number(userId) : undefined,
      pendingFollowUp,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(id, updateQuoteDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeQuoteStatusDto: ChangeQuoteStatusDto,
  ) {
    return this.quotesService.changeStatus(id, changeQuoteStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.remove(id);
  }

  @Post(':id/document')
  attachDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() attachQuoteDocumentDto: AttachQuoteDocumentDto,
  ) {
    return this.quotesService.attachDocument(
      id,
      attachQuoteDocumentDto.documentId,
    );
  }

  @Get(':id/activities')
  findActivities(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findActivities(id);
  }

  @Post(':id/activities')
  createActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() createActivityDto: CreateQuoteActivityDto,
  ) {
    return this.quotesService.createActivity(id, createActivityDto);
  }

  @Patch(':id/activities/:activityId')
  updateActivity(
    @Param('id', ParseIntPipe) id: number,
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() updateActivityDto: UpdateQuoteActivityDto,
  ) {
    return this.quotesService.updateActivity(id, activityId, updateActivityDto);
  }
}
