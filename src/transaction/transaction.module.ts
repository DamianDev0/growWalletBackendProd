import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { Budget } from '../budget/entities/budget.entity';
import { Category } from '../category/entities/category.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget, Category, Wallet])],
  providers: [TransactionService, AuthGuard, JwtService],
  controllers: [TransactionController],
})
export class TransactionModule {}
