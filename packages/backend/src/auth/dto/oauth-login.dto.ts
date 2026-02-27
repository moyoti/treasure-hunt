import { IsEnum, IsString, IsOptional, IsEmail } from 'class-validator';

export class OAuthLoginDto {
  @IsEnum(['google', 'apple'])
  provider: 'google' | 'apple';

  @IsString()
  providerId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}