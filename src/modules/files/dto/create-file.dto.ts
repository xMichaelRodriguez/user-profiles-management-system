import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 16)
  title: string;
}
