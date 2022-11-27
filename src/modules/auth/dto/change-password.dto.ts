import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  readonly oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  readonly newPassword: string;
}
