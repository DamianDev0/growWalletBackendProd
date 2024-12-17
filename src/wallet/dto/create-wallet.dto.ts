import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Currency } from '../../common/enum/currency';

export class CreateWalletDto {
  @IsNumber()
  balance: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency = Currency.COP;
}
