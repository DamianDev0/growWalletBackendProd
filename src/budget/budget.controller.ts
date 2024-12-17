import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('budget')
@UseGuards(AuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.create(createBudgetDto, user);
  }

  @Get() getAllBudgets(@ActiveUser() user: ActiveUserInterface) {
    return this.budgetService.getAllBudgetsForUser(user);
  }
  @Get(':budgetId') async getAmount(
    @ActiveUser() user: ActiveUserInterface,
    @Param('budgetId') budgetId: string,
  ) {
    return this.budgetService.getAmount(budgetId, user);
  }

  @Get('category/:categoryId') async getBudgetByCategory(
    @Param('categoryId') categoryId: string,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.getBudgetByCategory(categoryId, user);
  }

  @Get('stats/:budgetId')
  async getStats(
    @Param('budgetId') budgetId: string,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.getStats(budgetId, user);
  }

  @Patch(':id')
  async updateBudget(
    @Param('id') budgetId: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.budgetService.update(budgetId, updateBudgetDto, user);
  }
}
