import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  readonly resetPasswordToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  readonly password: string;
}
