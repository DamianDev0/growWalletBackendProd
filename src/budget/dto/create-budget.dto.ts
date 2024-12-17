import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { Period } from '../../common/enum/period.enum';

export class CreateBudgetDto {
  @IsNumber()
  amount: number;

  @IsUUID()
  categoryId: string;

  @IsEnum(Period)
  period: Period;
}
