import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Client } from '../clients/entities/client.entity';
import { Purchase } from '../purchase/entities/purchase.entity';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: {} },
        { provide: getRepositoryToken(Sale), useValue: {} },
        { provide: getRepositoryToken(Purchase), useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: {} },
        { provide: getRepositoryToken(Payment), useValue: {} },
        { provide: getRepositoryToken(Client), useValue: {} },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
