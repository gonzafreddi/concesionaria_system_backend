import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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
    const { signatureCreatedAt, ...clientData } = createClientDto;
    const clientDataToSave: DeepPartial<Client> = {
      ...clientData,
      signatureData: createClientDto.signatureData ?? null,
      signatureCreatedAt: createClientDto.signatureData
        ? (signatureCreatedAt ?? new Date())
        : null,
    };
    const client = this.clientsRepository.create(clientDataToSave);
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
    const { signatureCreatedAt, ...clientData } = updateClientDto;

    Object.assign(client, clientData);

    if (updateClientDto.signatureData !== undefined) {
      client.signatureData = updateClientDto.signatureData ?? null;
      client.signatureCreatedAt = updateClientDto.signatureData
        ? (signatureCreatedAt ?? new Date())
        : null;
    }

    return this.clientsRepository.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
    return { deleted: true };
  }
}
