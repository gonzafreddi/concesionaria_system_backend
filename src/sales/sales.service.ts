import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    const { quoteId, clientId, vehicleId, userId, saleDate, totalAmount } =
      createSaleDto as any;
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException(`Client ${clientId} not found`);
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    const quote = quoteId
      ? await this.quoteRepository.findOne({ where: { id: quoteId } })
      : null;

    const sale = this.salesRepository.create({
      quote,
      client,
      vehicle,
      user,
      totalAmount,
      saleDate: new Date(saleDate),
    } as any);

    return this.salesRepository.save(sale);
  }

  findAll() {
    return this.salesRepository.find({
      relations: ['client', 'vehicle', 'user', 'quote'],
    });
  }

  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['client', 'vehicle', 'user', 'quote', 'payments'],
    });
    if (!sale) throw new NotFoundException(`Sale ${id} not found`);
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto) {
    const sale = await this.findOne(id);
    Object.assign(sale, updateSaleDto);
    return this.salesRepository.save(sale);
  }

  async remove(id: number) {
    const sale = await this.findOne(id);
    await this.salesRepository.remove(sale);
    return { deleted: true };
  }
}
