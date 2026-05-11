import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeneratedDocumentsService } from './documents.service';
import { GeneratedDocument } from './entities/generated-document.entity';

describe('DocumentsService', () => {
  let service: GeneratedDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratedDocumentsService,
        { provide: getRepositoryToken(GeneratedDocument), useValue: {} },
      ],
    }).compile();

    service = module.get<GeneratedDocumentsService>(GeneratedDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
