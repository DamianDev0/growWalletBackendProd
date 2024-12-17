// src/wallet/wallet.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    const wallet = await this.walletService.create(createWalletDto, user);
    return {
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  @Get('balance')
  async getBalance(@ActiveUser() user: ActiveUserInterface) {
    return await this.walletService.getBalance(user);
  }
}
