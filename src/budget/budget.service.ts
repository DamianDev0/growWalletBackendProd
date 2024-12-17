/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { Category } from '../category/entities/category.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { addDays, differenceInDays, format } from 'date-fns';
import { Period } from '../common/enum/period.enum';
@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}
  private async findCategoryById(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return category;
  }
  private async checkActiveBudget(
    categoryId: string,
    userId: string,
  ): Promise<void> {
    const activeBudget = await this.budgetRepository.findOne({
      where: {
        category: { id: categoryId },
        user: { id: userId },
        endDate: MoreThan(new Date()),
      },
    });
    if (activeBudget) {
      throw new BadRequestException(
        'Active budget already exists for this category',
      );
    }
  }
  private calculateEndDate(period: Period, startDate: Date): Date {
    return period === Period.MONTHLY
      ? addDays(startDate, 30)
      : addDays(startDate, 15);
  }
  private async findWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }
    return wallet;
  }
  private async checkWalletBalance(
    wallet: Wallet,
    amount: number,
  ): Promise<void> {
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance in wallet');
    }
  }
  async create(
    createBudgetDto: CreateBudgetDto,
    user: ActiveUserInterface,
  ): Promise<Omit<Budget, 'user' | 'category'>> {
    const { amount, categoryId, period } = createBudgetDto;
    const category = await this.findCategoryById(categoryId);
    await this.checkActiveBudget(categoryId, user.id);
    const startDate = new Date();
    const endDate = this.calculateEndDate(period, startDate);
    const wallet = await this.findWalletByUserId(user.id);
    await this.checkWalletBalance(wallet, amount);
    const budget = this.budgetRepository.create({
      amount,
      startDate,
      endDate,
      period,
      category,
      user,
      spentAmount: 0,
    });
    wallet.balance -= amount;
    await this.walletRepository.save(wallet);
    const savedBudget = await this.budgetRepository.save(budget);
    const { user: _, category: __, ...budgetWithoutRelations } = savedBudget;
    return budgetWithoutRelations;
  }
  async update(
    budgetId: string,
    updateBudgetDto: UpdateBudgetDto,
    user: ActiveUserInterface,
  ): Promise<Omit<Budget, 'user' | 'category'>> {
    const { amount } = updateBudgetDto;
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, user: { id: user.id } },
      relations: ['category'],
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }
    if (amount < budget.amount) {
      throw new BadRequestException(
        'New amount must be greater than or equal to the current amount',
      );
    }
    const wallet = await this.findWalletByUserId(user.id);
    const amountDifference = amount - budget.amount;
    if (wallet.balance + budget.amount < amount) {
      throw new BadRequestException('Insufficient balance in wallet');
    }
    budget.amount = amount;
    wallet.balance -= amountDifference;
    await this.walletRepository.save(wallet);
    const updatedBudget = await this.budgetRepository.save(budget);
    const { user: _, category: __, ...budgetWithoutRelations } = updatedBudget;
    return budgetWithoutRelations;
  }
  async getStats(budgetId: string, user: ActiveUserInterface) {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, user: { id: user.id } },
      relations: ['category'],
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }

    const daysElapsed = differenceInDays(
      new Date(),
      new Date(budget.startDate),
    );
    const transactions = await this.transactionRepository.find({
      where: { category: { id: budget.category.id }, user: { id: user.id } },
    });
    const totalSpent = transactions.reduce(
      (total, transaction) => total + parseFloat(transaction.amount.toString()),
      0,
    );

    let warningMessage = null;
    if (daysElapsed <= 5 && totalSpent > budget.amount * 0.5) {
      warningMessage =
        'You have spent more than 50% of your budget in less than 5 days.';
    }

    const daysRemaining = differenceInDays(
      new Date(budget.endDate),
      new Date(),
    );
    if (daysRemaining < 0) {
      await this.remove(budgetId, user);
      throw new NotFoundException(
        `Budget with ID ${budgetId} has expired and been removed.`,
      );
    }

    const remainingAmount = budget.amount - totalSpent;
    const usedPercentage = Math.min(
      100,
      Math.max(0, (totalSpent / budget.amount) * 100),
    );
    const remainingPercentage = Math.min(
      100,
      Math.max(0, (remainingAmount / budget.amount) * 100),
    );

    const totalTransactions = transactions.length;
    const averageSpentPerTransaction =
      totalTransactions > 0 ? totalSpent / totalTransactions : 0;
    const dailySpendingRate = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const averageDailySpending = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const transactionDays = transactions.map((transaction) =>
      format(new Date(transaction.date), 'EEEE'),
    );

    return {
      totalBudgetAmount: budget.amount,
      totalAmountSpent: Number(totalSpent.toFixed(2)),
      remainingBudgetAmount: Number(remainingAmount.toFixed(2)),
      percentageBudgetUsed: Number(usedPercentage.toFixed(2)),
      percentageBudgetRemaining: Number(remainingPercentage.toFixed(2)),
      totalTransactions,
      averageSpentPerTransaction: Number(averageSpentPerTransaction.toFixed(2)),
      daysRemaining,
      dailySpendingRate: Number(dailySpendingRate.toFixed(2)),
      averageDailySpending: Number(averageDailySpending.toFixed(2)),
      transactionDays,
      warningMessage,
    };
  }

  async getAmount(
    budgetId: string,
    user: ActiveUserInterface,
  ): Promise<number> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, user: { id: user.id } },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${budgetId} not found`);
    }
    return budget.amount;
  }
  async getAllBudgetsForUser(user: ActiveUserInterface): Promise<Budget[]> {
    const budgets = await this.budgetRepository.find({
      where: { user: { id: user.id } },
      relations: ['category'],
    });
    if (!budgets.length) {
      throw new NotFoundException('No budgets found for this user');
    }
    return budgets;
  }
  async getBudgetByCategory(
    categoryId: string,
    user: ActiveUserInterface,
  ): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { category: { id: categoryId }, user: { id: user.id } },
      relations: ['category'],
    });
    if (!budget) {
      throw new NotFoundException(
        `No budget found for category ID ${categoryId}`,
      );
    }
    return budget;
  }
  async remove(
    id: string,
    user: ActiveUserInterface,
  ): Promise<Omit<Budget, 'user' | 'category'>> {
    const budget = await this.budgetRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['category'],
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const wallet = await this.walletRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for this user`);
    }

    wallet.balance += budget.amount;
    await this.walletRepository.save(wallet);

    await this.budgetRepository.remove(budget);

    return {
      id: budget.id,
      amount: budget.amount,
      spentAmount: budget.spentAmount,
      startDate: budget.startDate,
      endDate: budget.endDate,
      period: budget.period,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  }
}
