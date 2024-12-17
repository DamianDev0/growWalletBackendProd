import { IsOptional, IsUUID, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  name: string;

  @IsString()
  store: string;

  @IsUUID()
  budgetId: string;

  @IsOptional()
  description?: string;
}
