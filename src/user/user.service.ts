import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.UserRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await this.bcryptService.hashPassword(
      createUserDto.password,
    );
    const newUser = { ...createUserDto, password: hashedPassword };
    return this.UserRepository.save(newUser);
  }

  async findUserWithPassword(
    email: string,
    options: { relations?: string[] } = {},
  ): Promise<User> {
    const user = await this.UserRepository.findOne({
      where: { email },
      select: ['id', 'password', 'name'],
      relations: options.relations,
    });
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.UserRepository.delete(id);
  }

  async getActiveUser(user: ActiveUserInterface): Promise<User> {
    const activeUser = await this.UserRepository.findOne({
      where: { id: user.id },
    });
    if (!activeUser) {
      throw new NotFoundException('User not found');
    }
    return activeUser;
  }
}
