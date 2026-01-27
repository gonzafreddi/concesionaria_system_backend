import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { encryptPassword } from '../utils/encrypt';
import { httpResponseType } from 'src/types/http/response,type';

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

      const hashedPassword = encryptPassword(createUserDto.password);

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { deleted: true };
  }
}
