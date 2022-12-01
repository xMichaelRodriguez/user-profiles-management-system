import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class RequestResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
