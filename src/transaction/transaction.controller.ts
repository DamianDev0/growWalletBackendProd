// src/transaction/transaction.controller.ts
import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('transaction')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    console.log('create transaction', createTransactionDto);
    return this.transactionService.create(createTransactionDto, user);
  }

  @Get() async findAll(@ActiveUser() user: ActiveUserInterface) {
    return this.transactionService.findAllTransactionsUser(user);
  }
}
