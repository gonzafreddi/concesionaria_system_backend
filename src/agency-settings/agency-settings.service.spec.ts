import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgencySettingsService } from './agency-settings.service';
import { AgencySetting } from './entities/agency-setting.entity';

describe('AgencySettingsService', () => {
  let service: AgencySettingsService;

  const agencySettingsRepositoryMock = {
    create: jest.fn((settings) => settings),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencySettingsService,
        {
          provide: getRepositoryToken(AgencySetting),
          useValue: agencySettingsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<AgencySettingsService>(AgencySettingsService);
  });

  it('devuelve una configuracion singleton vacia cuando no existe registro', async () => {
    agencySettingsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne()).resolves.toMatchObject({
      id: 1,
      legalName: null,
      tradeName: null,
      taxId: null,
      address: null,
      city: null,
      province: null,
      phone: null,
      email: null,
    });
    expect(agencySettingsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('crea o actualiza la configuracion singleton con id 1', async () => {
    agencySettingsRepositoryMock.findOne.mockResolvedValue(null);
    agencySettingsRepositoryMock.save.mockImplementation(async (settings) => ({
      ...settings,
      createdAt: new Date('2026-08-10T00:00:00.000Z'),
      updatedAt: new Date('2026-08-10T00:00:00.000Z'),
    }));

    await expect(
      service.update({
        legalName: 'AUTO3 S.A.',
        taxId: '30-12345678-9',
        email: null,
      }),
    ).resolves.toMatchObject({
      id: 1,
      legalName: 'AUTO3 S.A.',
      taxId: '30-12345678-9',
      email: null,
    });
    expect(agencySettingsRepositoryMock.create).toHaveBeenCalledWith({
      id: 1,
      legalName: 'AUTO3 S.A.',
      taxId: '30-12345678-9',
      email: null,
    });
  });
});
