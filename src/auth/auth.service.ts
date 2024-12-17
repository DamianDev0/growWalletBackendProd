// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from '../common/services/bcrypt.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      walletId: user.wallet ? user.wallet.id : null,
    };
    return this.jwtService.sign(payload);
  }

  async registerUser(registerDto: RegisterDto): Promise<User> {
    return this.userService.createUser(registerDto);
  }

  async loginUser({ email, password }: LoginDto) {
    const findUser = await this.userService.findUserWithPassword(email, {
      relations: ['wallet'],
    });

    if (!findUser) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await this.bcryptService.comparePassword(
      password,
      findUser.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const accessToken = this.generateToken(findUser);

    return {
      accessToken,
      id: findUser.id,
      name: findUser.name,
      walletId: findUser.wallet ? findUser.wallet.id : null,
    };
  }
}
