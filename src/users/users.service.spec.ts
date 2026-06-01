import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    usersRepository.findOne.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns null when findByEmail does not find a user', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.findByEmail('missing@test.com')).resolves.toBeNull();
    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'missing@test.com' },
    });
  });
});
