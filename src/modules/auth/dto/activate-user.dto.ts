import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ActivateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  code: string;
}
