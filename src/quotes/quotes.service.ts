import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ChangeQuoteStatusDto } from './dto/change-quote-status.dto';
import { CreateQuoteActivityDto } from './dto/create-quote-activity.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteActivityDto } from './dto/update-quote-activity.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuoteActivity, QuoteActivityType } from './entities/quote-activity.entity';
import { Quote, QuoteStatus } from './entities/quote.entity';

export interface QuoteFilters {
  status?: QuoteStatus;
  clientId?: number;
  vehicleId?: number;
  userId?: number;
  pendingFollowUp?: boolean;
}

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteActivity)
    private readonly activityRepository: Repository<QuoteActivity>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    await this.ensureRelations(createQuoteDto);

    const quote = this.quoteRepository.create({
      ...createQuoteDto,
      status: createQuoteDto.status ?? QuoteStatus.NEW,
      validUntil: createQuoteDto.validUntil ?? null,
      source: createQuoteDto.source?.trim() || null,
      paymentMethod: createQuoteDto.paymentMethod?.trim() || null,
      downPayment: createQuoteDto.downPayment ?? null,
      financingDetails: createQuoteDto.financingDetails?.trim() || null,
      notes: createQuoteDto.notes?.trim() || null,
      nextFollowUpAt: this.toDate(createQuoteDto.nextFollowUpAt),
      lostReason: createQuoteDto.lostReason?.trim() || null,
    });

    const saved = await this.quoteRepository.save(quote);

    await this.activityRepository.save(
      this.activityRepository.create({
        quoteId: saved.id,
        createdById: saved.userId,
        type: QuoteActivityType.STATUS_CHANGE,
        title: 'Cotización creada',
        description: `Estado inicial: ${saved.status}`,
      }),
    );

    return this.findOne(saved.id);
  }

  async findAll(filters: QuoteFilters = {}): Promise<Quote[]> {
    const where: FindOptionsWhere<Quote> = {};

    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.pendingFollowUp) {
      where.nextFollowUpAt = LessThan(new Date());
    }

    return this.quoteRepository.find({
      where,
      relations: ['client', 'vehicle', 'user'],
      order: { updatedAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['client', 'vehicle', 'user', 'activities', 'activities.createdBy'],
      order: { activities: { createdAt: 'DESC' } },
    });

    if (!quote) {
      throw new NotFoundException(`Cotización ${id} no encontrada`);
    }

    return quote;
  }

  async update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.findOne(id);
    await this.ensureRelations(updateQuoteDto);

    Object.assign(quote, {
      ...updateQuoteDto,
      source:
        updateQuoteDto.source !== undefined
          ? updateQuoteDto.source?.trim() || null
          : quote.source,
      paymentMethod:
        updateQuoteDto.paymentMethod !== undefined
          ? updateQuoteDto.paymentMethod?.trim() || null
          : quote.paymentMethod,
      financingDetails:
        updateQuoteDto.financingDetails !== undefined
          ? updateQuoteDto.financingDetails?.trim() || null
          : quote.financingDetails,
      notes:
        updateQuoteDto.notes !== undefined
          ? updateQuoteDto.notes?.trim() || null
          : quote.notes,
      nextFollowUpAt:
        updateQuoteDto.nextFollowUpAt !== undefined
          ? this.toDate(updateQuoteDto.nextFollowUpAt)
          : quote.nextFollowUpAt,
      lostReason:
        updateQuoteDto.lostReason !== undefined
          ? updateQuoteDto.lostReason?.trim() || null
          : quote.lostReason,
    });

    await this.quoteRepository.save(quote);
    return this.findOne(id);
  }

  async changeStatus(
    id: number,
    changeQuoteStatusDto: ChangeQuoteStatusDto,
  ): Promise<Quote> {
    const quote = await this.findOne(id);
    const previousStatus = quote.status;

    quote.status = changeQuoteStatusDto.status;
    quote.lostReason =
      changeQuoteStatusDto.status === QuoteStatus.LOST
        ? changeQuoteStatusDto.lostReason?.trim() || quote.lostReason
        : quote.lostReason;

    await this.quoteRepository.save(quote);

    await this.activityRepository.save(
      this.activityRepository.create({
        quoteId: quote.id,
        createdById: quote.userId,
        type: QuoteActivityType.STATUS_CHANGE,
        title: 'Cambio de estado',
        description:
          changeQuoteStatusDto.note?.trim() ||
          `${previousStatus} -> ${changeQuoteStatusDto.status}`,
      }),
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const quote = await this.findOne(id);
    await this.quoteRepository.remove(quote);
    return { deleted: true };
  }

  async findActivities(quoteId: number): Promise<QuoteActivity[]> {
    await this.findOne(quoteId);
    return this.activityRepository.find({
      where: { quoteId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async createActivity(
    quoteId: number,
    createActivityDto: CreateQuoteActivityDto,
  ): Promise<QuoteActivity> {
    await this.findOne(quoteId);

    if (createActivityDto.createdById) {
      await this.ensureUser(createActivityDto.createdById);
    }

    const activity = this.activityRepository.create({
      quoteId,
      createdById: createActivityDto.createdById ?? null,
      type: createActivityDto.type,
      title: createActivityDto.title.trim(),
      description: createActivityDto.description?.trim() || null,
      dueAt: this.toDate(createActivityDto.dueAt),
      completedAt: this.toDate(createActivityDto.completedAt),
    });

    return this.activityRepository.save(activity);
  }

  async updateActivity(
    quoteId: number,
    activityId: number,
    updateActivityDto: UpdateQuoteActivityDto,
  ): Promise<QuoteActivity> {
    await this.findOne(quoteId);
    const activity = await this.activityRepository.findOne({
      where: { id: activityId, quoteId },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad ${activityId} no encontrada`);
    }

    if (updateActivityDto.createdById) {
      await this.ensureUser(updateActivityDto.createdById);
    }

    Object.assign(activity, {
      ...updateActivityDto,
      title: updateActivityDto.title?.trim() ?? activity.title,
      description:
        updateActivityDto.description !== undefined
          ? updateActivityDto.description?.trim() || null
          : activity.description,
      dueAt:
        updateActivityDto.dueAt !== undefined
          ? this.toDate(updateActivityDto.dueAt)
          : activity.dueAt,
      completedAt:
        updateActivityDto.completedAt !== undefined
          ? this.toDate(updateActivityDto.completedAt)
          : activity.completedAt,
    });

    return this.activityRepository.save(activity);
  }

  private async ensureRelations(dto: Partial<CreateQuoteDto>) {
    if (dto.clientId) {
      const client = await this.clientRepository.findOne({ where: { id: dto.clientId } });
      if (!client) throw new BadRequestException(`Cliente ${dto.clientId} no encontrado`);
    }

    if (dto.vehicleId) {
      const vehicle = await this.vehicleRepository.findOne({ where: { id: dto.vehicleId } });
      if (!vehicle) throw new BadRequestException(`Vehículo ${dto.vehicleId} no encontrado`);
    }

    if (dto.userId) {
      await this.ensureUser(dto.userId);
    }
  }

  private async ensureUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException(`Usuario ${userId} no encontrado`);
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }
}
