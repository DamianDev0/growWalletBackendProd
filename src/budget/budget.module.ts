import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Category } from '../category/entities/category.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Transaction } from '../transaction/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Wallet, Category, Transaction])],
  controllers: [BudgetController],
  providers: [BudgetService, AuthGuard, JwtService],
})
export class BudgetModule {}
