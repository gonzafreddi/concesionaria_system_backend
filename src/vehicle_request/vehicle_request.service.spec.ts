import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VehicleRequestService } from './vehicle_request.service';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { MailService } from '../mail/mail.service';

describe('VehicleRequestService', () => {
  let service: VehicleRequestService;
  let vehicleRequestRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let vehicleRepository: {
    findOne: jest.Mock;
  };
  let mailService: {
    sendVehicleRequestMatchedEmail: jest.Mock;
  };

  beforeEach(async () => {
    vehicleRequestRepository = {
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    vehicleRepository = {
      findOne: jest.fn(),
    };
    mailService = {
      sendVehicleRequestMatchedEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleRequestService,
        {
          provide: getRepositoryToken(VehicleRequest),
          useValue: vehicleRequestRepository,
        },
        { provide: getRepositoryToken(Client), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Vehicle), useValue: vehicleRepository },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<VehicleRequestService>(VehicleRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('notifies client manually when a vehicle arrives for the request', async () => {
    const client = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@example.com',
    } as Client;
    const vehicle = {
      id: 10,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'Blanco',
      price: 15000000,
    } as Vehicle;
    const request = {
      id: 7,
      client,
      user: { id: 2 } as User,
      brand: 'Toyota',
      model: 'Corolla',
    } as VehicleRequest;

    vehicleRequestRepository.findOne.mockResolvedValue(request);
    vehicleRepository.findOne.mockResolvedValue(vehicle);

    const result = await service.notifyVehicleArrival(7, 10);

    expect(result).toEqual({
      sent: true,
      to: 'juan@example.com',
      vehicleRequestId: 7,
      vehicleId: 10,
    });
    expect(mailService.sendVehicleRequestMatchedEmail).toHaveBeenCalledWith({
      to: 'juan@example.com',
      clientName: 'Juan Perez',
      requestedVehicle: 'Toyota Corolla',
      vehicle: {
        id: 10,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        color: 'Blanco',
        price: 15000000,
      },
    });
    expect(vehicleRequestRepository.save).not.toHaveBeenCalled();
  });

  it('does not notify when client has no email', async () => {
    vehicleRequestRepository.findOne.mockResolvedValue({
      id: 7,
      client: { id: 1, email: null },
    } as VehicleRequest);
    vehicleRepository.findOne.mockResolvedValue({ id: 10 } as Vehicle);

    await expect(service.notifyVehicleArrival(7, 10)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mailService.sendVehicleRequestMatchedEmail).not.toHaveBeenCalled();
  });
});
