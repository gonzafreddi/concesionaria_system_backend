import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeneratedDocumentsService } from './documents.service';
import {
  DocumentStatus,
  DocumentType,
  GeneratedDocument,
  RelatedEntityType,
} from './entities/generated-document.entity';

describe('DocumentsService', () => {
  let service: GeneratedDocumentsService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratedDocumentsService,
        {
          provide: getRepositoryToken(GeneratedDocument),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<GeneratedDocumentsService>(GeneratedDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stores PDF metadata and the authenticated user id', async () => {
    const file = {
      buffer: Buffer.from('%PDF-1.7 test'),
      originalname: 'contrato.pdf',
      mimetype: 'application/pdf',
      size: 13,
    } as Express.Multer.File;
    const dto = {
      templateCode: 'sale-contract-v1',
      documentType: DocumentType.CONTRACT,
      relatedEntityType: RelatedEntityType.SALE,
      relatedEntityId: '42',
    };
    const createdDocument = {
      ...dto,
      id: 'document-id',
      fileUrl: '/documents/document-id/file',
      filePublicId: null,
      fileData: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: DocumentStatus.GENERATED,
      generatedById: '7',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repository.create.mockReturnValue(createdDocument);
    repository.save.mockResolvedValue(createdDocument);

    const result = await service.uploadDocument(file, dto, '7');

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fileData: file.buffer,
        generatedById: '7',
        status: DocumentStatus.GENERATED,
      }),
    );
    expect(result.generatedById).toBe('7');
  });

  it('rejects a file whose content is not a PDF', async () => {
    const file = {
      buffer: Buffer.from('not a real PDF'),
      originalname: 'fake.pdf',
      mimetype: 'application/pdf',
      size: 14,
    } as Express.Multer.File;

    await expect(
      service.uploadDocument(
        file,
        {
          templateCode: 'sale-contract-v1',
          documentType: DocumentType.CONTRACT,
          relatedEntityType: RelatedEntityType.SALE,
          relatedEntityId: '42',
        },
        '7',
      ),
    ).rejects.toThrow('no corresponde a un PDF válido');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
