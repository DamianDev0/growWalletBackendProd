// src/wallet/wallet.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createWalletDto: CreateWalletDto,
    user: ActiveUserInterface,
  ): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingWallet) {
      throw new BadRequestException('User already has a wallet');
    }

    const wallet = this.walletRepository.create({
      ...createWalletDto,
      user,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    await this.userRepository.update(user.id, { wallet: savedWallet });

    return savedWallet;
  }

  async getBalance(user: ActiveUserInterface): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for the user');
    }

    return wallet;
  }
}
