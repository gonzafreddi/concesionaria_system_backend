import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: repository },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('setea signatureCreatedAt al crear un cliente con firma', async () => {
    const signatureCreatedAt = new Date('2026-06-09T10:01:57.863Z');
    const savedClient = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Perez',
      dni: '12345678',
      signatureData: 'data:image/png;base64,abc',
      signatureCreatedAt,
    } as Client;
    repository.create.mockReturnValue(savedClient);
    repository.save.mockResolvedValue(savedClient);

    const result = await service.create({
      firstName: 'Juan',
      lastName: 'Perez',
      dni: '12345678',
      signatureData: 'data:image/png;base64,abc',
      signatureCreatedAt,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        signatureData: 'data:image/png;base64,abc',
        signatureCreatedAt,
      }),
    );
    expect(result.signatureCreatedAt).toBe(signatureCreatedAt);
  });

  it('limpia signatureCreatedAt al borrar la firma', async () => {
    const existingClient = {
      id: 1,
      signatureData: 'data:image/png;base64,abc',
      signatureCreatedAt: new Date('2026-05-10T00:00:00.000Z'),
    } as Client;

    jest.spyOn(service, 'findOne').mockResolvedValue(existingClient);
    repository.save.mockResolvedValue(existingClient);

    const result = await service.update(1, {
      signatureData: null,
    });

    expect(result.signatureData).toBeNull();
    expect(result.signatureCreatedAt).toBeNull();
  });
});
