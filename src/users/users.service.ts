import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User, UserRole } from './entities/user.entity';
import { encryptPassword } from '../utils/encrypt';
import { httpResponseType } from '../types/http/response,type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<httpResponseType> {
    try {
      const findUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (findUser) {
        return {
          statusCode: 400,
          message: 'User with this email already exists',
        };
      }

      const user = this.usersRepository.create({
        ...createUserDto,
        password: encryptPassword(createUserDto.password),
        isActive: true,
      });

      await this.usersRepository.save(user);

      return {
        statusCode: 201,
        message: 'User created successfully',
        data: user.name,
      };
    } catch (error) {
      console.log(error);
      throw new Error('Error creating user');
    }
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto, actorId?: number) {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }

    if (dto.role && dto.role !== user.role && user.role === UserRole.ADMIN) {
      await this.ensureAdminCanChangeRole(user, dto.role, actorId);
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updateStatus(id: number, dto: UpdateUserStatusDto, actorId?: number) {
    const user = await this.findOne(id);

    if (actorId === id && !dto.isActive) {
      throw new BadRequestException('No puedes desactivar tu propio usuario');
    }

    if (!dto.isActive && user.role === UserRole.ADMIN) {
      await this.ensureAtLeastOneActiveAdmin(id);
    }

    user.isActive = dto.isActive;
    return this.usersRepository.save(user);
  }

  async resetPassword(id: number, dto: ResetUserPasswordDto) {
    const user = await this.findOne(id);
    user.password = encryptPassword(dto.newPassword);
    return this.usersRepository.save(user);
  }

  async remove(id: number, actorId?: number) {
    return this.updateStatus(id, { isActive: false }, actorId);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  private async ensureAdminCanChangeRole(
    user: User,
    newRole: UserRole,
    actorId?: number,
  ) {
    if (newRole === UserRole.ADMIN) return;

    await this.ensureAtLeastOneActiveAdmin(user.id);

    if (actorId === user.id) {
      throw new BadRequestException(
        'No puedes quitarte el rol de administrador a ti mismo',
      );
    }
  }

  private async ensureAtLeastOneActiveAdmin(excludedUserId: number) {
    const activeAdmins = await this.usersRepository.count({
      where: { role: UserRole.ADMIN, isActive: true },
    });
    const excludedUser = await this.usersRepository.findOne({
      where: { id: excludedUserId },
    });

    if (
      activeAdmins <= 1 &&
      excludedUser?.role === UserRole.ADMIN &&
      excludedUser.isActive
    ) {
      throw new BadRequestException(
        'Debe existir al menos un administrador activo',
      );
    }
  }
}
