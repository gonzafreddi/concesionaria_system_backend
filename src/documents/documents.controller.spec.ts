import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { GeneratedDocumentsService } from './documents.service';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: GeneratedDocumentsService,
          useValue: {
            uploadDocument: jest.fn(),
            findAll: jest.fn(),
            getFile: jest.fn(),
            findOne: jest.fn(),
            findByEntity: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
