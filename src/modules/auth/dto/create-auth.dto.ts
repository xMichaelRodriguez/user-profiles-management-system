import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

import { LoginAuthDto } from './login-auth.dto';

export class CreateAuthDto extends PartialType(LoginAuthDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @Length(50, 500)
  @IsOptional()
  readonly biobraphy?: string;
}
