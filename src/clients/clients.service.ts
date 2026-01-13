import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto) {
    const client = this.clientsRepository.create(createClientDto as any);
    return this.clientsRepository.save(client);
  }

  findAll() {
    return this.clientsRepository.find();
  }

  async findOne(id: number) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
    return { deleted: true };
  }
}
