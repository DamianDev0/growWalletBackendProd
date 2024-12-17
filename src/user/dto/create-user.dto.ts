import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  photo?: string;
}
